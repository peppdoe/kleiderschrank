import type { Item, Outfit } from '../db/schema';
import type { SeasonId } from './constants';

/** Outfits, deren Teile mit Saisonangabe alle zur Saison passen; Teile ohne Saison passen immer. */
export function outfitsForSeason(outfits: Outfit[], items: Item[], season: SeasonId): Outfit[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return outfits.filter((outfit) => {
    const pieces = outfit.itemIds.map((id) => byId.get(id)).filter((item): item is Item => item !== undefined);
    return pieces.length > 0 && pieces.every((item) => item.seasons.length === 0 || item.seasons.includes(season));
  });
}
