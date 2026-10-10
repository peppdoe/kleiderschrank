import { CATEGORIES, COLORS, SEASONS } from '../lib/constants';
import { EMPTY_FILTER, isFilterActive, toggleValue, type FilterState } from '../lib/filters';
import { ChipGroup } from './ChipGroup';

interface FilterBarProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <ChipGroup
        label="Kategorie"
        options={CATEGORIES}
        selected={value.categories}
        onToggle={(id) => onChange({ ...value, categories: toggleValue(value.categories, id) })}
      />
      <ChipGroup
        label="Farbe"
        options={COLORS}
        selected={value.colors}
        onToggle={(id) => onChange({ ...value, colors: toggleValue(value.colors, id) })}
      />
      <ChipGroup
        label="Saison"
        options={SEASONS}
        selected={value.seasons}
        onToggle={(id) => onChange({ ...value, seasons: toggleValue(value.seasons, id) })}
      />
      {isFilterActive(value) && (
        <button type="button" className="link-button" onClick={() => onChange(EMPTY_FILTER)}>
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
