import { useState } from 'react';
import { CATEGORIES, COLORS, SEASONS, labelOf } from '../lib/constants';
import { toggleValue, type FilterState } from '../lib/filters';
import { FilterSheet } from './FilterSheet';
import { Icon } from './Icon';

interface FilterTagsProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  resultCount: number;
}

/** Ein Anhänger „Filter“ öffnet das Bodenblatt; jeder aktive Filter hängt als eigener Anhänger daneben. */
export function FilterTags({ value, onChange, resultCount }: FilterTagsProps) {
  const [open, setOpen] = useState(false);
  const active = [
    ...value.categories.map((id) => ({ key: `c-${id}`, label: labelOf(CATEGORIES, id), next: { ...value, categories: toggleValue(value.categories, id) } })),
    ...value.colors.map((id) => ({ key: `f-${id}`, label: labelOf(COLORS, id), next: { ...value, colors: toggleValue(value.colors, id) } })),
    ...value.seasons.map((id) => ({ key: `s-${id}`, label: labelOf(SEASONS, id), next: { ...value, seasons: toggleValue(value.seasons, id) } })),
  ];

  return (
    <>
      <div className="tag-row">
        <button type="button" className="swing-tag" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <Icon name="filter" size={20} />
          Filter{active.length > 0 && <span className="swing-tag__count">{active.length}</span>}
        </button>
        {active.map((tag) => (
          <button
            key={tag.key}
            type="button"
            className="swing-tag swing-tag--active"
            aria-label={`Filter ${tag.label} entfernen`}
            onClick={() => onChange(tag.next)}
          >
            {tag.label}
            <Icon name="close" size={16} />
          </button>
        ))}
      </div>
      {open && <FilterSheet value={value} onChange={onChange} onClose={() => setOpen(false)} resultCount={resultCount} />}
    </>
  );
}
