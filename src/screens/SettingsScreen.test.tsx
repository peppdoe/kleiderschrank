import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { META_LAST_BACKUP, getMeta } from '../db/meta';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { exportBackup } from '../lib/backup';
import { shareOrDownload } from '../lib/files';
import { seedItem } from '../test/factories';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  makeThumb: vi.fn(async () => new Blob(['thumb'], { type: 'image/jpeg' })),
}));

vi.mock('../lib/files', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/files')>()),
  shareOrDownload: vi.fn(async () => 'shared'),
}));

// Kein vi.restoreAllMocks(): Das würde die vi.fn()-Implementierungen aus vi.mock leeren.
// confirm wird in jedem Test, der es braucht, per spyOn neu gesetzt.
beforeEach(() => {
  window.location.hash = '#/settings';
});

describe('Einstellungen', () => {
  it('shows counts and that no backup exists yet', async () => {
    const a = await seedItem();
    await seedItem();
    await createOutfit('Büro', [a]);
    render(<App />);
    expect(await screen.findByText('2 Teile · 1 Outfit')).toBeInTheDocument();
    expect(screen.getByText('Noch kein Backup')).toBeInTheDocument();
  });

  it('exports a backup via the share sheet and remembers the date', async () => {
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await user.click(await screen.findByRole('button', { name: 'Backup sichern' }));
    expect(shareOrDownload).toHaveBeenCalledWith(
      expect.stringContaining('"app":"kleiderschrank"'),
      expect.stringMatching(/^kleiderschrank-backup-\d{4}-\d{2}-\d{2}\.json$/),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Backup gesichert.');
    expect(await getMeta(META_LAST_BACKUP)).toBeDefined();
    expect(await screen.findByText(/^Letztes Backup: /)).toBeInTheDocument();
  });

  it('does not remember a cancelled share', async () => {
    vi.mocked(shareOrDownload).mockResolvedValueOnce('cancelled');
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await user.click(await screen.findByRole('button', { name: 'Backup sichern' }));
    expect(await getMeta(META_LAST_BACKUP)).toBeUndefined();
    expect(screen.getByRole('button', { name: 'Backup sichern' })).toBeInTheDocument();
  });

  it('replaces all data from a valid backup after confirmation', async () => {
    await seedItem({ category: 'top' });
    const json = await exportBackup();
    await seedItem({ category: 'shoes' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup einspielen'),
      new File([json], 'kleiderschrank-backup-2026-10-10.json', { type: 'application/json' }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Backup eingespielt: 1 Teil, 0 Outfits.');
    expect(await db.items.count()).toBe(1);
    expect((await db.items.toArray())[0].category).toBe('top');
  });

  it('rejects an invalid file and keeps the data', async () => {
    await seedItem();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup einspielen'),
      new File(['kein backup'], 'notiz.json', { type: 'application/json' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Das ist keine gültige Kleiderschrank-Sicherung.');
    expect(await db.items.count()).toBe(1);
  });

  it('does nothing when the import is not confirmed', async () => {
    await seedItem();
    const json = await exportBackup();
    await seedItem();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup einspielen'),
      new File([json], 'backup.json', { type: 'application/json' }),
    );
    expect(await db.items.count()).toBe(2);
  });
});
