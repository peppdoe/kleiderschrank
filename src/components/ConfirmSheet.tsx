import { Sheet } from './Sheet';

interface ConfirmSheetProps {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Rot für Löschen und Verwerfen. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Rückfrage vor riskanten Schritten. Der sichere Weg hat den Fokus. */
export function ConfirmSheet({
  title, message, confirmLabel, cancelLabel = 'Abbrechen', destructive = false, onConfirm, onCancel,
}: ConfirmSheetProps) {
  return (
    <Sheet title={title} onClose={onCancel}>
      {message && <p className="notice">{message}</p>}
      <div className="sheet__actions">
        <button type="button" className={destructive ? 'button button--danger-solid' : 'button button--primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="text-button" data-autofocus onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </Sheet>
  );
}
