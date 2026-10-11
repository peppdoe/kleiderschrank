import type { ParsedBackup } from '../lib/backup';
import { plural } from '../lib/describe';
import { Sheet } from './Sheet';

interface ImportSheetProps {
  backup: ParsedBackup;
  currentItems: number;
  currentOutfits: number;
  onConfirm: () => void;
  onBackupFirst: () => void;
  onCancel: () => void;
}

const counts = (items: number, outfits: number) => `${plural(items, 'Teil', 'Teile')}, ${plural(outfits, 'Look', 'Looks')}`;

/** Bevor ein Backup alles ersetzt: was drin ist, was jetzt da ist, und der Weg, erst zu sichern. */
export function ImportSheet({ backup, currentItems, currentOutfits, onConfirm, onBackupFirst, onCancel }: ImportSheetProps) {
  const date = backup.exportedAt
    ? new Date(backup.exportedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <Sheet title="Backup zurückholen?" onClose={onCancel}>
      <dl className="compare">
        <div>
          <dt>Backup{date && ` vom ${date}`}:</dt>{' '}
          <dd>{counts(backup.items.length, backup.outfits.length)}</dd>
        </div>
        <div>
          <dt>Dein aktueller Stand:</dt>{' '}
          <dd>{counts(currentItems, currentOutfits)}</dd>
        </div>
      </dl>
      <p className="notice">Dein aktueller Stand wird dabei vollständig ersetzt.</p>
      <div className="sheet__actions">
        <button type="button" className="button button--danger-solid" onClick={onConfirm}>
          Ersetzen
        </button>
        <button type="button" className="button" onClick={onBackupFirst}>
          Erst aktuellen Stand sichern
        </button>
        <button type="button" className="text-button" data-autofocus onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </Sheet>
  );
}
