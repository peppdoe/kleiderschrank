import { CATEGORIES, type CategoryId, type ColorId } from '../lib/constants';
import { EMPTY_FILTER, isFilterActive, toggleValue, type FilterState } from '../lib/filters';
import { ChipGroup } from './ChipGroup';
import { SeasonSymbols } from './SeasonSymbols';
import { SwatchGroup } from './SwatchGroup';

interface FilterBarProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  /** Im Bodenblatt: Gruppen mit sichtbarer Überschrift und umbrechenden Chips statt Seitwärts-Scrollen. */
  wrap?: boolean;
  /** Im Schrank steuert die Saison-Reihe die Saison; dann keine eigene Saison-Gruppe. */
  withSeasons?: boolean;
  /** Im Filterblatt: nur vorhandene Werte mit Anzahl (siehe `facetCounts`). */
  counts?: { categories: ReadonlyMap<CategoryId, number>; colors: ReadonlyMap<ColorId, number> };
}

export function FilterBar({ value, onChange, wrap = false, withSeasons = true, counts }: FilterBarProps) {
  const groups = [
    <ChipGroup
      key="cat"
      label="Kategorie"
      options={CATEGORIES}
      selected={value.categories}
      counts={counts?.categories}
      onToggle={(id) => onChange({ ...value, categories: toggleValue(value.categories, id) })}
    />,
    <SwatchGroup
      key="color"
      label="Farbe"
      selected={value.colors}
      counts={counts?.colors}
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
