import { useLiveQuery } from 'dexie-react-hooks';
import { FilePicker } from '../components/FilePicker';
import { FilterBar } from '../components/FilterBar';
import { ItemGrid } from '../components/ItemGrid';
import { listItems } from '../db/items';
import { plural } from '../lib/describe';
import { EMPTY_FILTER, applyFilter, type FilterState } from '../lib/filters';
import { navigate } from '../lib/route';

interface WardrobeScreenProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onPickPhoto: (file: File) => void;
}

export function WardrobeScreen({ filter, onFilterChange, onPickPhoto }: WardrobeScreenProps) {
  const items = useLiveQuery(listItems, []);
  if (!items) return null;
  const visible = applyFilter(items, filter);

  return (
    <section className="screen-content">
      <header className="screen-header">
        <h1>Schrank</h1>
        <span className="muted">{plural(items.length, 'Teil', 'Teile')}</span>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <p>Noch keine Teile – tippe auf +, um dein erstes Teil zu erfassen.</p>
        </div>
      ) : (
        <>
          <FilterBar value={filter} onChange={onFilterChange} />
          {visible.length === 0 ? (
            <div className="empty">
              <p>Keine Teile passen zu diesen Filtern.</p>
              <button type="button" className="button" onClick={() => onFilterChange(EMPTY_FILTER)}>
                Alle Teile anzeigen
              </button>
            </div>
          ) : (
            <ItemGrid items={visible} onItemClick={(item) => navigate(`/item/${item.id}`)} />
          )}
        </>
      )}

      <FilePicker className="fab" label="Teil hinzufügen" accept="image/*" onPick={onPickPhoto}>
        <span aria-hidden="true">+</span>
      </FilePicker>
    </section>
  );
}
