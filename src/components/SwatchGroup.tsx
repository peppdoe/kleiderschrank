import { COLORS, labelOf, type ColorId } from '../lib/constants';
import { plural } from '../lib/describe';

interface SwatchGroupProps {
  label: string;
  selected: readonly ColorId[];
  onToggle: (id: ColorId) => void;
  /** Im Filter: nur Farben mit Teilen (gewählte bleiben stehen), die Anzahl wird mit angesagt. */
  counts?: ReadonlyMap<ColorId, number>;
}

/** Farben als Farbfelder statt als Anhänger: die Farbe ist das Erkennungszeichen, ihr Name steht immer darunter (auch für Farbenblinde). */
export function SwatchGroup({ label, selected, onToggle, counts }: SwatchGroupProps) {
  const options = counts ? COLORS.filter((c) => (counts.get(c.id) ?? 0) > 0 || selected.includes(c.id)) : COLORS;
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
              <span className="swatch__name" aria-hidden="true">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
