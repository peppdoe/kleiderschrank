import { SEASONS, type SeasonId } from '../lib/constants';
import { Icon } from './Icon';

interface SeasonSymbolsProps {
  selected: readonly SeasonId[];
  current: SeasonId;
  onToggle: (season: SeasonId) => void;
}

/** Saisons als Pflegesymbole: ein Tipp filtert den Schrank, die aktuelle Saison ist markiert. */
export function SeasonSymbols({ selected, current, onToggle }: SeasonSymbolsProps) {
  return (
    <div className="care-symbols" role="group" aria-label="Saison wählen">
      {SEASONS.map((season) => {
        const on = selected.includes(season.id);
        const isCurrent = season.id === current;
        return (
          <button
            key={season.id}
            type="button"
            className={`care-symbol${on ? ' care-symbol--on' : ''}${isCurrent ? ' care-symbol--current' : ''}`}
            aria-pressed={on}
            aria-label={season.label}
            onClick={() => onToggle(season.id)}
          >
            <span className="care-symbol__mark">
              <Icon name={season.id} />
            </span>
            <span className="care-symbol__label" aria-hidden="true">
              {isCurrent ? 'Jetzt' : season.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
