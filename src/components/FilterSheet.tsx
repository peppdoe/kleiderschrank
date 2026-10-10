import { plural } from '../lib/describe';
import { EMPTY_FILTER, isFilterActive, type FilterState } from '../lib/filters';
import { FilterBar } from './FilterBar';
import { Sheet } from './Sheet';

interface FilterSheetProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  onClose: () => void;
  /** Wie viele Teile mit den gewählten Filtern übrig bleiben. */
  resultCount: number;
}

/** Alle Filter in einem Bodenblatt; die Aktionen liegen unten in Daumenreichweite. */
export function FilterSheet({ value, onChange, onClose, resultCount }: FilterSheetProps) {
  return (
    <Sheet title="Filter" onClose={onClose} className="sheet--filters">
      <FilterBar value={value} onChange={onChange} wrap />
      <div className="sheet__bar">
        {isFilterActive(value) && (
          <button type="button" className="text-button" onClick={() => onChange(EMPTY_FILTER)}>
            Zurücksetzen
          </button>
        )}
        <button type="button" className="button button--primary" data-autofocus onClick={onClose}>
          {plural(resultCount, 'Teil', 'Teile')} zeigen
        </button>
      </div>
    </Sheet>
  );
}
