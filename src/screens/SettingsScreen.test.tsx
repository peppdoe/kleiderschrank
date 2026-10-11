import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { META_LAST_BACKUP, META_USER_NAME, getMeta } from '../db/meta';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { exportBackup } from '../lib/backup';
import { shareOrDownload } from '../lib/files';
import { makeThumb } from '../lib/image';
import { isStandalone } from '../lib/storage';
import { seedItem } from '../test/factories';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  makeThumb: vi.fn(async () => new Blob(['thumb'], { type: 'image/jpeg' })),
}));

vi.mock('../lib/files', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/files')>()),
  shareOrDownload: vi.fn(async () => 'shared'),
}));

vi.mock('../lib/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/storage')>()),
  isStandalone: vi.fn(() => false),
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
    expect(await screen.findByText('2 Teile · 1 Look')).toBeInTheDocument();
    expect(await screen.findByText('Noch kein Backup – sichere am besten gleich.')).toBeInTheDocument();
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
    expect(await screen.findByText(/^Zuletzt gesichert: heute$/)).toBeInTheDocument();
  });

  it('opens the share sheet only once on a double tap', async () => {
    let finish: (value: 'shared') => void = () => {};
    vi.mocked(shareOrDownload).mockClear();
    vi.mocked(shareOrDownload).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await user.dblClick(await screen.findByRole('button', { name: 'Backup sichern' }));
    expect(shareOrDownload).toHaveBeenCalledTimes(1);
    finish('shared');
    expect(await screen.findByRole('status')).toHaveTextContent('Backup gesichert.');
  });

  it('does not count a download as a backup inside the installed app', async () => {
    vi.mocked(isStandalone).mockReturnValue(true);
    vi.mocked(shareOrDownload).mockResolvedValueOnce('downloaded');
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await user.click(await screen.findByRole('button', { name: 'Backup sichern' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Dateien-App');
    expect(await getMeta(META_LAST_BACKUP)).toBeUndefined();
    vi.mocked(isStandalone).mockReturnValue(false);
  });

  it('blocks a second import while one is running and offers a fresh backup afterwards', async () => {
    await seedItem();
    const json = await exportBackup();
    let finish: (blob: Blob) => void = () => {};
    vi.mocked(makeThumb).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await screen.findByRole('button', { name: 'Backup sichern' });
    await user.upload(screen.getByLabelText('Backup zurückholen'), new File([json], 'backup.json', { type: 'application/json' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Backup zurückholen?' })).getByRole('button', { name: 'Ersetzen' }));
    await waitFor(() => expect(screen.getByLabelText('Backup zurückholen')).toBeDisabled());
    finish(new Blob(['thumb'], { type: 'image/jpeg' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Backup eingespielt');
    expect(screen.getByLabelText('Backup zurückholen')).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Backup sichern' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Backup erstellen' })).toBeInTheDocument();
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

  it('shows what the backup contains against the current state before replacing everything', async () => {
    await seedItem({ category: 'top' });
    const json = await exportBackup(new Date('2026-10-03T08:00:00'));
    await seedItem({ category: 'shoes' });
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup zurückholen'),
      new File([json], 'kleiderschrank-backup-2026-10-03.json', { type: 'application/json' }),
    );
    const sheet = await screen.findByRole('dialog', { name: 'Backup zurückholen?' });
    expect(sheet).toHaveTextContent('Backup vom 03.10.2026: 1 Teil, 0 Looks');
    expect(sheet).toHaveTextContent('Dein aktueller Stand: 2 Teile, 0 Looks');
    await user.click(within(sheet).getByRole('button', { name: 'Ersetzen' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Backup eingespielt: 1 Teil, 0 Looks.');
    expect(await db.items.count()).toBe(1);
    expect((await db.items.toArray())[0].category).toBe('top');
  });

  it('rejects an invalid file and keeps the data', async () => {
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup zurückholen'),
      new File(['kein backup'], 'notiz.json', { type: 'application/json' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Das ist keine gültige Kleiderschrank-Sicherung.');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await db.items.count()).toBe(1);
  });

  it('does nothing when the import is not confirmed', async () => {
    await seedItem();
    const json = await exportBackup();
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup zurückholen'),
      new File([json], 'backup.json', { type: 'application/json' }),
    );
    await user.click(within(await screen.findByRole('dialog', { name: 'Backup zurückholen?' })).getByRole('button', { name: 'Abbrechen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await db.items.count()).toBe(2);
  });

  it('remembers the name used for the greeting', async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = await screen.findByLabelText('Dein Name');
    await user.type(field, '  Lena ');
    await user.tab();
    await waitFor(async () => expect(await getMeta(META_USER_NAME)).toBe('Lena'));
    expect(await screen.findByText('Gespeichert')).toBeInTheDocument();
  });

  it('previews the greeting band while the name is typed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const preview = await screen.findByRole('group', { name: 'Vorschau der Begrüßung' });
    expect(within(preview).queryByText(/Mia/)).not.toBeInTheDocument();
    await user.type(await screen.findByLabelText('Dein Name'), 'Mia');
    expect(within(preview).getByText(/, Mia$/)).toBeInTheDocument();
  });
});
