import { SEASONS, type SeasonId } from '../lib/constants';
import { Icon } from './Icon';

interface SeasonSymbolsProps {
  /** Name der Gruppe für Screenreader, z. B. „Saison wählen“. */
  label: string;
  selected: readonly SeasonId[];
  onToggle: (season: SeasonId) => void;
  /** Die aktuelle Saison bekommt eine Naht-Markierung und wird so angesagt. */
  current?: SeasonId;
}

/** Saisons als Pflegesymbole: gefüllt heißt gewählt, die gestrichelte Naht markiert die aktuelle Saison. */
export function SeasonSymbols({ label, selected, onToggle, current }: SeasonSymbolsProps) {
  return (
    <div className="care-symbols" role="group" aria-label={label}>
      {SEASONS.map((season) => {
        const on = selected.includes(season.id);
        const isCurrent = season.id === current;
        return (
          <button
            key={season.id}
            type="button"
            className={`care-symbol${on ? ' care-symbol--on' : ''}${isCurrent ? ' care-symbol--current' : ''}`}
            aria-pressed={on}
            aria-label={isCurrent ? `${season.label} (aktuelle Saison)` : season.label}
            onClick={() => onToggle(season.id)}
          >
            <span className="care-symbol__mark">
              <Icon name={season.id} />
            </span>
            <span className="care-symbol__label" aria-hidden="true">
              {season.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
