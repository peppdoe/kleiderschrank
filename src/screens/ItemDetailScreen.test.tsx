import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { seedItem } from '../test/factories';

afterEach(() => vi.restoreAllMocks());

function open(path: string) {
  window.location.hash = `#${path}`;
  render(<App />);
}

describe('Teil-Details', () => {
  it('shows all details and the outfits containing the item', async () => {
    const id = await seedItem({ category: 'top', colors: ['blue', 'white'], seasons: ['summer'], note: 'Leinen' });
    await createOutfit('Strand', [id]);
    open(`/item/${id}`);
    expect(await screen.findByRole('heading', { name: 'Leinen' })).toBeInTheDocument();
    expect(screen.getByText('Oberteil')).toBeInTheDocument();
    expect(screen.getByText('Blau, Weiß')).toBeInTheDocument();
    expect(screen.getByText('Sommer')).toBeInTheDocument();
    expect(screen.getByText('Leinen')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Strand' })).toBeInTheDocument();
  });

  it('edits an item and keeps its photo', async () => {
    const id = await seedItem({ category: 'top', colors: ['blue'] });
    const user = userEvent.setup();
    open(`/item/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
    await screen.findByRole('heading', { name: 'Teil bearbeiten' });
    const categories = screen.getByRole('group', { name: 'Kategorie' });
    expect(within(categories).getByRole('button', { name: 'Oberteil' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByRole('heading', { name: 'Hose' })).toBeInTheDocument();
    expect(await (await db.photos.get(id))!.full.text()).toBe('photo-full');
  });

  it('deletes after confirmation and removes the item from outfits', async () => {
    const id = await seedItem();
    const outfitId = await createOutfit('Büro', [id]);
    const user = userEvent.setup();
    open(`/item/${id}`);
    await screen.findByRole('button', { name: 'Büro' });
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    const sheet = await screen.findByRole('dialog', { name: 'Teil löschen?' });
    expect(sheet).toHaveTextContent('Es wird auch aus 1 Outfit entfernt.');
    await user.click(within(sheet).getByRole('button', { name: 'Löschen' }));
    expect(await screen.findByText(/Noch keine Teile/)).toBeInTheDocument();
    expect(await db.items.count()).toBe(0);
    expect((await db.outfits.get(outfitId))!.itemIds).toEqual([]);
  });

  it('keeps the item when deletion is not confirmed', async () => {
    const id = await seedItem();
    const user = userEvent.setup();
    open(`/item/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Löschen' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Teil löschen?' })).getByRole('button', { name: 'Abbrechen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await db.items.count()).toBe(1);
    expect(screen.getByRole('heading', { name: 'Oberteil' })).toBeInTheDocument();
  });

  it('leaves an untouched edit form without asking', async () => {
    const id = await seedItem({ category: 'top', colors: ['blue'] });
    const user = userEvent.setup();
    open(`/item/${id}/edit`);
    await screen.findByRole('heading', { name: 'Teil bearbeiten' });
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(await screen.findByRole('heading', { name: 'Oberteil' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves out details that were never filled in', async () => {
    const id = await seedItem({ category: 'bag' });
    open(`/item/${id}`);
    await screen.findByRole('heading', { name: 'Tasche' });
    expect(screen.queryByText('Saison')).not.toBeInTheDocument();
    expect(screen.queryByText('Farben')).not.toBeInTheDocument();
  });

  it('shows a hint for an item that no longer exists', async () => {
    open('/item/gibt-es-nicht');
    expect(await screen.findByText('Dieses Teil gibt es nicht mehr.')).toBeInTheDocument();
  });

  it('shows a hint when editing an item that no longer exists', async () => {
    open('/item/gibt-es-nicht/edit');
    expect(await screen.findByText('Dieses Teil gibt es nicht mehr.')).toBeInTheDocument();
  });
});
