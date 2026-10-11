import type { Item } from '../db/schema';
import { SEASONS, labelOf } from '../lib/constants';
import { describeOutfitSeasons, outfitSeasons } from '../lib/today';
import { Icon } from './Icon';

interface OutfitSeasonsProps {
  itemIds: readonly string[];
  items: readonly Item[];
  as?: 'p' | 'span';
  id?: string;
  /** Liste: Symbole mit kurzen Namen („Herbst · Winter“); der ganze Satz bleibt für Screenreader. */
  compact?: boolean;
}

/** Pflegesymbole + Satz, wann ein Outfit unter „Heute“ erscheint. Ohne vorhandene Teile nichts. */
export function OutfitSeasons({ itemIds, items, as: Tag = 'p', id: elementId, compact = false }: OutfitSeasonsProps) {
  if (!itemIds.some((id) => items.some((item) => item.id === id))) return null;
  const seasons = outfitSeasons(itemIds, items);
  const sentence = describeOutfitSeasons(seasons);
  // Die Pflegesymbole stehen nie allein: ein Bügeleisen liest niemand als „Herbst“.
  const short = seasons.length === 0
    ? 'Keine gemeinsame Saison'
    : seasons.length === SEASONS.length
      ? 'Ganzjährig'
      : seasons.map((id) => labelOf(SEASONS, id)).join(' · ');
  return (
    <Tag className={`outfit-seasons${compact ? ' outfit-seasons--compact' : ''}`} id={elementId}>
      {seasons.length > 0 && (
        <span className="outfit-seasons__marks">
          {seasons.map((id) => (
            <Icon key={id} name={id} size={18} />
          ))}
        </span>
      )}
      {compact ? (
        <>
          <span aria-hidden="true">{short}</span>
          <span className="visually-hidden">{sentence}</span>
        </>
      ) : (
        <span>{sentence}</span>
      )}
    </Tag>
  );
}
