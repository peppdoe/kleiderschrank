import { Icon } from './Icon';

interface DetailBarProps {
  /** Name der Leiste für Screenreader, z. B. „Teil“ oder „Look“. */
  label: string;
  backHref: string;
  backLabel: string;
  onEdit: () => void;
}

/**
 * Zurück und Bearbeiten in Daumenreichweite: feste Leiste über der Tab-Leiste.
 * Die installierte iPhone-App hat keine Wischgeste zurück, oben links wäre mit einer Hand zu weit.
 */
export function DetailBar({ label, backHref, backLabel, onEdit }: DetailBarProps) {
  return (
    <nav className="detail-bar" aria-label={label}>
      <a className="text-button text-button--back" href={backHref}>
        <Icon name="back" size={20} />
        {backLabel}
      </a>
      <button type="button" className="button detail-bar__edit" onClick={onEdit}>
        Bearbeiten
      </button>
    </nav>
  );
}
