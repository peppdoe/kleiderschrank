import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { deleteItem } from '../db/items';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { seedItem } from '../test/factories';

afterEach(() => vi.restoreAllMocks());

function open(path: string) {
  window.location.hash = `#${path}`;
  render(<App />);
}

describe('Outfits', () => {
  it('shows an empty state with a way to start', async () => {
    open('/outfits');
    expect(await screen.findByText(/Noch keine Outfits/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Neues Outfit' }).length).toBeGreaterThan(0);
  });

  it('creates an outfit from selected items', async () => {
    const top = await seedItem({ category: 'top', colors: ['blue'] });
    const pants = await seedItem({ category: 'pants', colors: ['black'] });
    await seedItem({ category: 'shoes', colors: ['white'] });
    const user = userEvent.setup();
    open('/outfit/new');

    const next = await screen.findByRole('button', { name: 'Weiter' });
    expect(next).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Oberteil, Blau' }));
    await user.click(screen.getByRole('button', { name: 'Hose, Schwarz' }));
    expect(screen.getByText('2 ausgewählt')).toBeInTheDocument();
    await user.click(next);

    const save = screen.getByRole('button', { name: 'Speichern' });
    const name = screen.getByLabelText('Name des Outfits');
    expect(save).toBeDisabled();
    await user.type(name, '   ');
    expect(save).toBeDisabled();
    await user.clear(name);
    await user.type(name, 'Büro-Look');
    await user.click(save);

    expect(await screen.findByRole('heading', { name: 'Büro-Look' })).toBeInTheDocument();
    const outfits = await db.outfits.toArray();
    expect(outfits).toHaveLength(1);
    expect(outfits[0]).toMatchObject({ name: 'Büro-Look', itemIds: [top, pants] });
  });

  it('lists outfits and marks those without items', async () => {
    const a = await seedItem();
    await createOutfit('Sommer', [a]);
    const b = await seedItem();
    await createOutfit('Weg', [b]);
    await deleteItem(b);
    open('/outfits');
    expect(await screen.findByText('Sommer')).toBeInTheDocument();
    expect(screen.getByText('Weg')).toBeInTheDocument();
    expect(screen.getByText('Keine Teile mehr')).toBeInTheDocument();
  });

  it('renames an outfit', async () => {
    const a = await seedItem();
    const id = await createOutfit('Alt', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
    expect(await screen.findByText('1 ausgewählt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    const name = screen.getByLabelText('Name des Outfits');
    expect(name).toHaveValue('Alt');
    await user.clear(name);
    await user.type(name, 'Neu');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByRole('heading', { name: 'Neu' })).toBeInTheDocument();
  });

  it('deletes an outfit after confirmation but keeps its items', async () => {
    const a = await seedItem();
    const id = await createOutfit('Weg damit', [a]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Löschen' }));
    expect(await screen.findByText(/Noch keine Outfits/)).toBeInTheDocument();
    expect(await db.outfits.count()).toBe(0);
    expect(await db.items.count()).toBe(1);
  });

  it('hides the tab bar while an outfit is being put together', async () => {
    await seedItem();
    open('/outfit/new');
    await screen.findByRole('button', { name: 'Weiter' });
    expect(screen.queryByRole('navigation', { name: 'Hauptnavigation' })).not.toBeInTheDocument();
  });

  it('shows a hint for an outfit that no longer exists', async () => {
    open('/outfit/gibt-es-nicht');
    expect(await screen.findByText('Dieses Outfit gibt es nicht mehr.')).toBeInTheDocument();
  });
});
