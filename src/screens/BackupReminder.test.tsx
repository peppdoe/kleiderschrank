import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { META_LAST_BACKUP, setMeta } from '../db/meta';
import { seedItem } from '../test/factories';

async function seedMany(count: number) {
  for (let i = 0; i < count; i += 1) await seedItem();
}

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Backup-Erinnerung', () => {
  it('appears from 10 items without any backup and links to the settings', async () => {
    await seedMany(10);
    render(<App />);
    const banner = await screen.findByRole('button', { name: /Zeit für ein Backup/ });
    await userEvent.click(banner);
    expect(await screen.findByRole('heading', { name: 'Einstellungen' })).toBeInTheDocument();
  });

  it('stays hidden after a recent backup', async () => {
    await seedMany(10);
    await setMeta(META_LAST_BACKUP, new Date().toISOString());
    render(<App />);
    await screen.findByText('10 Teile');
    expect(screen.queryByRole('button', { name: /Zeit für ein Backup/ })).not.toBeInTheDocument();
  });

  it('stays hidden for a small wardrobe without backup', async () => {
    await seedMany(3);
    render(<App />);
    await screen.findByText('3 Teile');
    expect(screen.queryByRole('button', { name: /Zeit für ein Backup/ })).not.toBeInTheDocument();
  });
});
