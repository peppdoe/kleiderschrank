import { COLORS, labelOf, type ColorId } from '../lib/constants';
import { plural } from '../lib/describe';

interface SwatchGroupProps {
  label: string;
  selected: readonly ColorId[];
  onToggle: (id: ColorId) => void;
  /** Im Filter: nur Farben mit Teilen (gewählte bleiben stehen), die Anzahl wird mit angesagt. */
  counts?: ReadonlyMap<ColorId, number>;
}

/** Farben als Farbfelder statt als Anhänger: die Farbe selbst ist das Erkennungszeichen, der Name steht darunter. */
export function SwatchGroup({ label, selected, onToggle, counts }: SwatchGroupProps) {
  const options = counts ? COLORS.filter((c) => (counts.get(c.id) ?? 0) > 0 || selected.includes(c.id)) : COLORS;
  const picked = COLORS.filter((c) => selected.includes(c.id)).map((c) => c.label);
  return (
    <div className="swatch-group">
      <div className="swatch-group__grid" role="group" aria-label={label}>
        {options.map((option) => {
          const on = selected.includes(option.id);
          const count = counts?.get(option.id) ?? 0;
          return (
            <button
              key={option.id}
              type="button"
              className={on ? 'swatch swatch--on' : 'swatch'}
              aria-pressed={on}
              aria-label={counts ? `${labelOf(COLORS, option.id)}, ${plural(count, 'Teil', 'Teile')}` : option.label}
              onClick={() => onToggle(option.id)}
            >
              <span className="swatch__dot" style={{ background: option.swatch }} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {picked.length > 0 && (
        <p className="swatch-group__picked" aria-hidden="true">
          {picked.join(', ')}
        </p>
      )}
    </div>
  );
}
