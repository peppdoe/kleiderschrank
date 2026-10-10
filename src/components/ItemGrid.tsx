import type { Item } from '../db/schema';
import { describeItem } from '../lib/describe';
import { ItemPhoto } from './ItemPhoto';

interface ItemGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedIds?: readonly string[];
  size?: 'normal' | 'large';
}

export function ItemGrid({ items, onItemClick, selectedIds, size = 'normal' }: ItemGridProps) {
  return (
    <ul className={size === 'large' ? 'item-grid item-grid--large' : 'item-grid'}>
      {items.map((item) => {
        const selected = selectedIds?.includes(item.id) ?? false;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={selected ? 'tile tile--selected' : 'tile'}
              aria-label={describeItem(item)}
              aria-pressed={selectedIds ? selected : undefined}
              onClick={() => onItemClick(item)}
            >
              <ItemPhoto itemId={item.id} alt="" />
              {selected && <span className="tile__check" aria-hidden="true">✓</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
