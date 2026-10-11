import { useEffect, useRef } from 'react';
import type { Item } from '../db/schema';
import { describeItem } from '../lib/describe';
import { Icon } from './Icon';
import { ItemPhoto } from './ItemPhoto';

interface ItemGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedIds?: readonly string[];
  size?: 'normal' | 'large';
  /** Gerade gespeichertes Teil: kurz markieren und in den Blick holen. */
  highlightId?: string | null;
}

/** Name einer Kachel für Screenreader: Kategorie, Farben und – falls vorhanden – die erste Zeile der Notiz. */
export function tileLabel(item: Item): string {
  const note = item.note.split('\n')[0].trim();
  const label = note ? `${describeItem(item)} – ${note}` : describeItem(item);
  return item.favorite ? `${label}, Lieblingsteil` : label;
}

export function ItemGrid({ items, onItemClick, selectedIds, size = 'normal', highlightId }: ItemGridProps) {
  const highlightRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    highlightRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [highlightId]);

  return (
    <ul className={size === 'large' ? 'item-grid item-grid--large' : 'item-grid'}>
      {items.map((item) => {
        const selected = selectedIds?.includes(item.id) ?? false;
        const isNew = item.id === highlightId;
        return (
          <li key={item.id}>
            <button
              ref={isNew ? highlightRef : undefined}
              type="button"
              className={`tile${selected ? ' tile--selected' : ''}${isNew ? ' tile--new' : ''}`}
              aria-label={tileLabel(item)}
              aria-pressed={selectedIds ? selected : undefined}
              onClick={() => onItemClick(item)}
            >
              <ItemPhoto itemId={item.id} alt="" />
              {item.favorite && (
                <span className="tile__fav" aria-hidden="true">
                  <Icon name="heart" size={14} filled />
                </span>
              )}
              {selected && (
                <span className="tile__check" aria-hidden="true">
                  <Icon name="check" size={18} />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
