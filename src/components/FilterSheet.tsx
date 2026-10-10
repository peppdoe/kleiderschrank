import { useEffect, useRef } from 'react';
import { plural } from '../lib/describe';
import { EMPTY_FILTER, isFilterActive, type FilterState } from '../lib/filters';
import { FilterBar } from './FilterBar';

interface FilterSheetProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  onClose: () => void;
  /** Wie viele Teile mit den gewählten Filtern übrig bleiben. */
  resultCount: number;
}

/** Bodenblatt mit allen Filtern; die Aktionen liegen unten in Daumenreichweite. */
export function FilterSheet({ value, onChange, onClose, resultCount }: FilterSheetProps) {
  const showRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    showRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet sheet--filters"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="filter-sheet-title" className="sheet__title">Filter</h2>
        <FilterBar value={value} onChange={onChange} wrap />
        <div className="sheet__bar">
          {isFilterActive(value) && (
            <button type="button" className="text-button" onClick={() => onChange(EMPTY_FILTER)}>
              Zurücksetzen
            </button>
          )}
          <button ref={showRef} type="button" className="button button--primary" onClick={onClose}>
            {plural(resultCount, 'Teil', 'Teile')} zeigen
          </button>
        </div>
      </div>
    </div>
  );
}
