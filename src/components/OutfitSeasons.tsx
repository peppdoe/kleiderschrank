import type { Item } from '../db/schema';
import { describeOutfitSeasons, outfitSeasons } from '../lib/today';
import { Icon } from './Icon';

/** Pflegesymbole + Satz, wann ein Outfit unter „Heute“ erscheint. Ohne vorhandene Teile nichts. */
export function OutfitSeasons({ itemIds, items }: { itemIds: readonly string[]; items: readonly Item[] }) {
  if (!itemIds.some((id) => items.some((item) => item.id === id))) return null;
  const seasons = outfitSeasons(itemIds, items);
  return (
    <p className="outfit-seasons">
      {seasons.length > 0 && (
        <span className="outfit-seasons__marks">
          {seasons.map((id) => (
            <Icon key={id} name={id} size={18} />
          ))}
        </span>
      )}
      <span>{describeOutfitSeasons(seasons)}</span>
    </p>
  );
}
