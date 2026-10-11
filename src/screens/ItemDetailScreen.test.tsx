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

  it('gives a piece its own name and shows it on the label', async () => {
    const id = await seedItem({ category: 'top', note: 'Von Oma' });
    const user = userEvent.setup();
    open(`/item/${id}/edit`);
    const name = await screen.findByLabelText('Name');
    expect(name).toHaveValue('');
    await user.type(name, 'Grüne Strickjacke');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByRole('heading', { name: 'Grüne Strickjacke' })).toBeInTheDocument();
    expect((await db.items.get(id))!.name).toBe('Grüne Strickjacke');

    await user.click(screen.getByRole('button', { name: 'Bearbeiten' }));
    expect(await screen.findByLabelText('Name')).toHaveValue('Grüne Strickjacke');
  });

  it('deletes after confirmation and removes the item from outfits', async () => {
    const id = await seedItem();
    const outfitId = await createOutfit('Büro', [id]);
    const user = userEvent.setup();
    open(`/item/${id}`);
    await screen.findByRole('button', { name: 'Büro' });
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    const sheet = await screen.findByRole('dialog', { name: 'Teil löschen?' });
    expect(sheet).toHaveTextContent('Es wird auch aus 1 Look entfernt.');
    await user.click(within(sheet).getByRole('button', { name: 'Löschen' }));
    expect(await screen.findByText(/Noch ganz viel Platz hier/)).toBeInTheDocument();
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

describe('Lieblingsteil', () => {
  it('marks a piece as favorite with the heart and unmarks it again', async () => {
    const id = await seedItem({ category: 'dress', colors: ['red'] });
    const user = userEvent.setup();
    open(`/item/${id}`);
    const heart = await screen.findByRole('button', { name: 'Lieblingsteil' });
    expect(heart).toHaveAttribute('aria-pressed', 'false');
    await user.click(heart);
    await vi.waitFor(async () => expect((await db.items.get(id))!.favorite).toBe(true));
    expect(await screen.findByRole('button', { name: 'Lieblingsteil', pressed: true })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lieblingsteil' }));
    await vi.waitFor(async () => expect((await db.items.get(id))!.favorite).toBeFalsy());
  });
});

describe('Daumenreichweite', () => {
  it('puts back and edit into one bar at the bottom of a piece', async () => {
    const id = await seedItem({ category: 'top' });
    open(`/item/${id}`);
    const bar = await screen.findByRole('navigation', { name: 'Teil' });
    expect(within(bar).getByRole('link', { name: 'Schrank' })).toHaveAttribute('href', '#/');
    expect(within(bar).getByRole('button', { name: 'Bearbeiten' })).toBeInTheDocument();
    expect(document.querySelectorAll('.text-button--back')).toHaveLength(1);
  });
});

describe('Nahtfarbe des Etiketts', () => {
  afterEach(() => vi.useRealTimers());

  it('sews a piece in its own season, not in the one chosen on the wardrobe', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    const dress = await seedItem({ category: 'dress', seasons: ['summer'] });
    open(`/item/${dress}`);
    await screen.findByRole('heading', { name: 'Kleid' });
    expect(document.querySelector<HTMLElement>('.care-label')!.dataset.season).toBe('summer');
  });

  it('keeps the chosen season when the piece belongs to it too, and for all-year pieces', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    const coat = await seedItem({ category: 'jacket', seasons: ['winter', 'autumn'] });
    open(`/item/${coat}`);
    await screen.findByRole('heading', { name: 'Jacke & Mantel' });
    expect(document.querySelector<HTMLElement>('.care-label')!.dataset.season).toBe('autumn');
  });
});
