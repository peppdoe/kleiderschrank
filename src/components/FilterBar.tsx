import { CATEGORIES, COLORS } from '../lib/constants';
import { EMPTY_FILTER, isFilterActive, toggleValue, type FilterState } from '../lib/filters';
import { ChipGroup } from './ChipGroup';
import { SeasonSymbols } from './SeasonSymbols';

interface FilterBarProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  /** Im Bodenblatt: Gruppen mit sichtbarer Überschrift und umbrechenden Chips statt Seitwärts-Scrollen. */
  wrap?: boolean;
  /** Im Schrank steuert die Saison-Reihe die Saison; dann keine eigene Saison-Gruppe. */
  withSeasons?: boolean;
}

export function FilterBar({ value, onChange, wrap = false, withSeasons = true }: FilterBarProps) {
  const groups = [
    <ChipGroup
      key="cat"
      label="Kategorie"
      options={CATEGORIES}
      selected={value.categories}
      onToggle={(id) => onChange({ ...value, categories: toggleValue(value.categories, id) })}
    />,
    <ChipGroup
      key="color"
      label="Farbe"
      options={COLORS}
      selected={value.colors}
      onToggle={(id) => onChange({ ...value, colors: toggleValue(value.colors, id) })}
    />,
    <SeasonSymbols
      key="season"
      label="Saison"
      selected={value.seasons}
      onToggle={(id) => onChange({ ...value, seasons: toggleValue(value.seasons, id) })}
    />,
  ];
  const titles = ['Kategorie', 'Farbe', 'Saison'];
  if (!withSeasons) {
    groups.pop();
    titles.pop();
  }

  return (
    <div className={wrap ? 'filter-bar filter-bar--wrap' : 'filter-bar'}>
      {wrap
        ? groups.map((group, index) => (
            <div key={titles[index]} className="filter-bar__group">
              <h3 className="filter-bar__title">{titles[index]}</h3>
              {group}
            </div>
          ))
        : groups}
      {!wrap && isFilterActive(value) && (
        <button type="button" className="text-button filter-bar__reset" onClick={() => onChange(EMPTY_FILTER)}>
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
