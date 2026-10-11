/** Eine kurze Meldung, optional mit einer Aktion wie „Rückgängig“. */
export interface Notice {
  text: string;
  action?: { label: string; run: () => void };
}

/**
 * Kurze Bestätigung wie „Teil gespeichert“. Der Ansagebereich bleibt immer eingehängt, damit VoiceOver
 * die Meldung vorliest – ein erst mit dem Text eingefügter Bereich wird auf iOS oft verschluckt.
 * Der sichtbare Text ist für Screenreader ausgeblendet, sonst käme die Meldung doppelt; eine Aktion
 * bleibt als Knopf erreichbar.
 */
export function Toast({ notice }: { notice: Notice | null }) {
  return (
    <>
      <p className="visually-hidden" role="status">
        {notice?.text ?? ''}
      </p>
      {notice && (
        <div className={notice.action ? 'toast toast--action' : 'toast'}>
          <span aria-hidden="true">{notice.text}</span>
          {notice.action && (
            <button type="button" className="toast__action" onClick={notice.action.run}>
              {notice.action.label}
            </button>
          )}
        </div>
      )}
    </>
  );
}
