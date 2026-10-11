/**
 * Kurze Bestätigung wie „Teil gespeichert“. Der Ansagebereich bleibt immer eingehängt, damit VoiceOver
 * die Meldung vorliest – ein erst mit dem Text eingefügter Bereich wird auf iOS oft verschluckt.
 * Die sichtbare Pille ist für Screenreader ausgeblendet, sonst käme die Meldung doppelt.
 */
export function Toast({ message }: { message: string | null }) {
  return (
    <>
      <p className="visually-hidden" role="status">
        {message ?? ''}
      </p>
      {message && (
        <p className="toast" aria-hidden="true">
          {message}
        </p>
      )}
    </>
  );
}
