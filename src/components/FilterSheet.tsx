import { useEffect, useRef } from 'react';
import type { FilterState } from '../lib/filters';
import { FilterBar } from './FilterBar';

interface FilterSheetProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  onClose: () => void;
}

/** Bodenblatt mit allen Filtern; schließt per „Fertig“, Tipp daneben oder Escape. */
export function FilterSheet({ value, onChange, onClose }: FilterSheetProps) {
  const doneRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    doneRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__head">
          <h2 id="filter-sheet-title" className="sheet__title">Filter</h2>
          <button ref={doneRef} type="button" className="text-button" onClick={onClose}>
            Fertig
          </button>
        </div>
        <FilterBar value={value} onChange={onChange} wrap />
      </div>
    </div>
  );
}
