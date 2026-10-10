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
}

export function ChipGroup<T extends string>({ label, options, selected, onToggle }: ChipGroupProps<T>) {
  return (
    <div className="chip-group" role="group" aria-label={label}>
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            className={on ? 'chip chip--on' : 'chip'}
            aria-pressed={on}
            onClick={() => onToggle(option.id)}
          >
            {option.swatch && <span className="chip__swatch" style={{ background: option.swatch }} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
