import { plural } from '../lib/describe';
import type { Item } from '../db/schema';
import { EMPTY_FILTER, facetCounts, isFilterActive, type FilterState } from '../lib/filters';
import { FilterBar } from './FilterBar';
import { Sheet } from './Sheet';

interface FilterSheetProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  onClose: () => void;
  /** Wie viele Teile mit den gewählten Filtern übrig bleiben. */
  resultCount: number;
  /** false im Schrank: die Saison bleibt Sache der Saison-Reihe und wird nie mit zurückgesetzt. */
  withSeasons?: boolean;
  /** Die Teile, aus denen gefiltert wird: das Blatt bietet nur an, was es darin gibt. */
  items: Item[];
}

/** Alle Filter in einem Bodenblatt; die Aktionen liegen unten in Daumenreichweite. */
export function FilterSheet({ value, onChange, onClose, resultCount, withSeasons = true, items }: FilterSheetProps) {
  const active = withSeasons ? isFilterActive(value) : value.categories.length + value.colors.length > 0;
  const reset = () => onChange(withSeasons ? EMPTY_FILTER : { ...value, categories: [], colors: [] });

  return (
    <Sheet title="Filter" onClose={onClose} className="sheet--filters">
      <FilterBar value={value} onChange={onChange} wrap withSeasons={withSeasons} counts={facetCounts(items, value)} />
      <div className="sheet__bar">
        {active && (
          <button type="button" className="text-button" onClick={reset}>
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
