import type { Item, Outfit } from '../db/schema';
import { SEASONS, labelOf, type SeasonId } from './constants';

const fits = (item: Item, season: SeasonId) => item.seasons.length === 0 || item.seasons.includes(season);

/** Saisons, in denen ein Outfit unter „Heute“ erscheint: alle Teile mit Saisonangabe passen; Teile ohne Saison passen immer. */
export function outfitSeasons(itemIds: readonly string[], items: readonly Item[]): SeasonId[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const pieces = itemIds.map((id) => byId.get(id)).filter((item): item is Item => item !== undefined);
  if (pieces.length === 0) return [];
  return SEASONS.map((s) => s.id).filter((season) => pieces.every((item) => fits(item, season)));
}

/** Outfits, die zur Saison passen (siehe `outfitSeasons`). */
export function outfitsForSeason(outfits: Outfit[], items: Item[], season: SeasonId): Outfit[] {
  return outfits.filter((outfit) => outfitSeasons(outfit.itemIds, items).includes(season));
}

/** Satz für Outfit-Liste, -Detail und -Editor, z. B. „Erscheint im Herbst und Winter“. */
export function describeOutfitSeasons(seasons: readonly SeasonId[]): string {
  if (seasons.length === 0) return 'Erscheint nie unter „Heute“: Die Teile haben keine gemeinsame Saison.';
  if (seasons.length === SEASONS.length) return 'Erscheint das ganze Jahr';
  const names = seasons.map((id) => labelOf(SEASONS, id));
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}`;
  return `Erscheint im ${list}`;
}
