import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { META_USER_NAME, setMeta } from '../db/meta';
import { createOutfit } from '../db/outfits';
import { seedItem } from '../test/factories';

beforeEach(() => {
  window.location.hash = '#/';
});
afterEach(() => vi.useRealTimers());

describe('Schrank', () => {
  it('shows a friendly empty state', async () => {
    render(<App />);
    expect(await screen.findByText('Noch leer hier. Tipp auf + und fotografier dein erstes Teil.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Schrank/ })).toHaveAttribute('aria-current', 'page');
  });

  it('greets Lena by her chosen name', async () => {
    await setMeta(META_USER_NAME, 'Lena');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: /, Lena$/ })).toBeInTheDocument();
  });

  it('greets without a name until one is set', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: /^(Guten Morgen|Hallo|Guten Abend)$/ })).toBeInTheDocument();
  });

  it('shows the outfits that fit the current season under Heute', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    const coat = await seedItem({ category: 'jacket', seasons: ['autumn'] });
    const sandals = await seedItem({ category: 'shoes', seasons: ['summer'] });
    await createOutfit('Herbst-Look', [coat]);
    await createOutfit('Strandtag', [sandals]);
    render(<App />);
    const today = await screen.findByRole('region', { name: 'Heute' });
    expect(await within(today).findByRole('button', { name: /Herbst-Look/ })).toBeInTheDocument();
    expect(within(today).queryByRole('button', { name: /Strandtag/ })).not.toBeInTheDocument();
  });

  it('narrows the wardrobe through the filter sheet and shows active filters as removable tags', async () => {
    await seedItem({ category: 'top', colors: ['blue'] });
    await seedItem({ category: 'pants', colors: ['black'] });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText('2 Teile')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Filter/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Filter' });
    await user.click(within(within(sheet).getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: /^Hose/ }));
    expect(within(sheet).getByRole('button', { name: 'Zurücksetzen' })).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '1 Teil zeigen' }));
    expect(screen.getByRole('button', { name: /^Filter, \d aktiv$/ })).toHaveFocus();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Oberteil, Blau' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();
    expect(screen.getByText('1 von 2 Teilen')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter Hose entfernen' }));
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
  });

  it('preselects the current season as today and lets Lena switch it', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    await seedItem({ category: 'top', colors: ['blue'], seasons: ['summer'] });
    await seedItem({ category: 'jacket', seasons: ['autumn'] });
    const sandals = await seedItem({ category: 'shoes', seasons: ['summer'] });
    await createOutfit('Strandtag', [sandals]);
    const user = userEvent.setup();
    render(<App />);
    const seasons = await screen.findByRole('group', { name: 'Saison wählen' });
    const autumn = within(seasons).getByRole('button', { name: 'Herbst (aktuelle Saison)' });
    expect(autumn).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.season).toBe('autumn');
    expect(await screen.findByRole('button', { name: 'Jacke & Mantel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Oberteil, Blau' })).not.toBeInTheDocument();
    expect(screen.getByText('1 von 3 Teilen')).toBeInTheDocument();
    expect(screen.getByText('· Herbst')).toBeInTheDocument();

    await user.click(within(seasons).getByRole('button', { name: 'Sommer' }));
    expect(within(seasons).getByRole('button', { name: 'Sommer' })).toHaveAttribute('aria-pressed', 'true');
    expect(autumn).toHaveAttribute('aria-pressed', 'false');
    // Die Fadenfarbe folgt der gewählten Saison.
    expect(document.documentElement.dataset.season).toBe('summer');
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
    const today = screen.getByRole('region', { name: 'Für den Sommer' });
    expect(within(today).getByRole('button', { name: /Strandtag/ })).toBeInTheDocument();
    // Die Saison steht schon in der Überschrift, die Zeile daneben zählt nur die Looks.
    expect(within(today).getByText('1 Look')).toBeInTheDocument();

    await user.click(within(seasons).getByRole('button', { name: 'Sommer' }));
    expect(screen.getByRole('button', { name: 'Jacke & Mantel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
  });

  it('sews the season choice onto the name band and dates Heute instead', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    const coat = await seedItem({ category: 'jacket', seasons: ['autumn'] });
    await createOutfit('Herbst-Look', [coat]);
    render(<App />);
    const seasons = await screen.findByRole('group', { name: 'Saison wählen' });
    expect(seasons.closest('.label-band')).not.toBeNull();
    const today = await screen.findByRole('region', { name: 'Heute' });
    expect(within(today).getByText('Samstag, 10. Oktober')).toBeInTheDocument();
  });

  it('puts the install hint after the clothes', async () => {
    await seedItem({ category: 'top' });
    render(<App />);
    const piece = await screen.findByRole('button', { name: 'Oberteil' });
    const note = await screen.findByRole('note');
    expect(piece.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps the chosen season when only other filters leave nothing to show', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    await seedItem({ category: 'top', colors: ['blue'], seasons: ['autumn'] });
    await seedItem({ category: 'pants', colors: ['red'], seasons: ['autumn'], favorite: true });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /^Filter/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Filter' });
    await user.click(within(within(sheet).getByRole('group', { name: 'Farbe' })).getByRole('button', { name: /^Blau/ }));
    await user.click(within(sheet).getByRole('button', { name: /zeigen$/ }));
    await user.click(screen.getByRole('button', { name: 'Lieblinge' }));

    await user.click(await screen.findByRole('button', { name: 'Filter lösen' }));
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
    const seasons = screen.getByRole('group', { name: 'Saison wählen' });
    expect(within(seasons).getByRole('button', { name: 'Herbst (aktuelle Saison)' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('offers only categories and colours that are in the wardrobe, with counts', async () => {
    await seedItem({ category: 'top', colors: ['blue'] });
    await seedItem({ category: 'top', colors: ['blue', 'white'] });
    await seedItem({ category: 'pants', colors: ['black'] });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /^Filter/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Filter' });
    const categories = within(sheet).getByRole('group', { name: 'Kategorie' });
    expect(within(categories).getAllByRole('button')).toHaveLength(2);
    expect(within(categories).getByRole('button', { name: 'Oberteil, 2 Teile' })).toBeInTheDocument();
    expect(within(categories).queryByRole('button', { name: /Rock/ })).not.toBeInTheDocument();
    const colors = within(sheet).getByRole('group', { name: 'Farbe' });
    expect(within(colors).getAllByRole('button')).toHaveLength(3);
    expect(within(colors).getByRole('button', { name: 'Blau, 2 Teile' })).toBeInTheDocument();
  });

  it('marks the current season by name, not only as "Jetzt"', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    render(<App />);
    const seasons = await screen.findByRole('group', { name: 'Saison wählen' });
    expect(within(seasons).getByText('Herbst')).toBeInTheDocument();
    expect(within(seasons).queryByText('Jetzt')).not.toBeInTheDocument();
  });

  it('keeps the season out of the filter sheet so resetting never clears today', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    await seedItem({ category: 'top', colors: ['blue'] });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /^Filter/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Filter' });
    expect(within(sheet).queryByRole('group', { name: 'Saison' })).not.toBeInTheDocument();
    expect(within(sheet).queryByRole('button', { name: 'Zurücksetzen' })).not.toBeInTheDocument();

    await user.click(within(within(sheet).getByRole('group', { name: 'Farbe' })).getByRole('button', { name: /^Blau/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Zurücksetzen' }));
    await user.click(within(sheet).getByRole('button', { name: /zeigen$/ }));
    const seasons = screen.getByRole('group', { name: 'Saison wählen' });
    expect(within(seasons).getByRole('button', { name: 'Herbst (aktuelle Saison)' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters by season with the care symbols and explains an empty result', async () => {
    await seedItem({ category: 'top', colors: ['blue'], seasons: ['summer'] });
    const user = userEvent.setup();
    render(<App />);
    const seasons = await screen.findByRole('group', { name: 'Saison wählen' });
    await user.click(within(seasons).getByRole('button', { name: 'Winter' }));
    expect(within(seasons).getByRole('button', { name: 'Winter' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Keine Teile passen zu diesen Filtern.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Alle Teile anzeigen' }));
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
  });
});

describe('Lieblinge', () => {
  it('narrows the wardrobe to favorites with one tag', async () => {
    await seedItem({ category: 'dress', colors: ['red'], favorite: true });
    await seedItem({ category: 'pants', colors: ['black'] });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lieblinge' }));
    expect(screen.getByRole('button', { name: 'Lieblinge' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Hose, Schwarz' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kleid, Rot/ })).toBeInTheDocument();
  });
});

describe('Lieblinge leer', () => {
  it('explains how to get favorites and switches only that filter off', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T07:40:00'));
    await seedItem({ category: 'pants', colors: ['black'], seasons: ['autumn'] });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Lieblinge' }));
    expect(screen.getByText(/Noch keine Lieblinge/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lieblinge aus' }));
    expect(screen.getByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Herbst (aktuelle Saison)' })).toHaveAttribute('aria-pressed', 'true');
    vi.useRealTimers();
  });
});
