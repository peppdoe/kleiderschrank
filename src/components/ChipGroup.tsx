import { plural } from '../lib/describe';

interface ChipOption<T extends string> {
  id: T;
  label: string;
  swatch?: string;
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onToggle: (id: T) => void;
  /** Im Filter: nur Werte mit Teilen (gewählte bleiben stehen), daneben die Anzahl. */
  counts?: ReadonlyMap<T, number>;
}

export function ChipGroup<T extends string>({ label, options, selected, onToggle, counts }: ChipGroupProps<T>) {
  const shown = counts ? options.filter((o) => (counts.get(o.id) ?? 0) > 0 || selected.includes(o.id)) : options;
  return (
    <div className="chip-group" role="group" aria-label={label}>
      {shown.map((option) => {
        const on = selected.includes(option.id);
        const count = counts?.get(option.id) ?? 0;
        return (
          <button
            key={option.id}
            type="button"
            className={on ? 'chip chip--on' : 'chip'}
            aria-pressed={on}
            aria-label={counts ? `${option.label}, ${plural(count, 'Teil', 'Teile')}` : undefined}
            onClick={() => onToggle(option.id)}
          >
            {option.swatch && <span className="chip__swatch" style={{ background: option.swatch }} aria-hidden="true" />}
            {option.label}
            {counts && <span className="chip__count" aria-hidden="true">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
