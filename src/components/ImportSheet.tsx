import { useEffect, useRef } from 'react';
import type { ParsedBackup } from '../lib/backup';
import { plural } from '../lib/describe';

interface ImportSheetProps {
  backup: ParsedBackup;
  currentItems: number;
  currentOutfits: number;
  onConfirm: () => void;
  onBackupFirst: () => void;
  onCancel: () => void;
}

const counts = (items: number, outfits: number) => `${plural(items, 'Teil', 'Teile')}, ${plural(outfits, 'Outfit', 'Outfits')}`;

/** Bevor ein Backup alles ersetzt: was drin ist, was jetzt da ist, und der Weg, erst zu sichern. */
export function ImportSheet({ backup, currentItems, currentOutfits, onConfirm, onBackupFirst, onCancel }: ImportSheetProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cancelHandler = useRef(onCancel);
  cancelHandler.current = onCancel;

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelHandler.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const date = backup.exportedAt ? new Date(backup.exportedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div className="sheet-backdrop" onClick={onCancel}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="import-sheet-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="import-sheet-title" className="sheet__title">Backup einspielen?</h2>
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
          <button ref={cancelRef} type="button" className="text-button" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
