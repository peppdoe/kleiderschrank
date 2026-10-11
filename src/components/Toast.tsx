import { useEffect, useRef } from 'react';

/** Eine kurze Meldung, optional mit einer Aktion wie „Rückgängig“. */
export interface Notice {
  text: string;
  action?: { label: string; run: () => void };
}

const NOTICE_MS = 3500;
// Mit „Rückgängig“ bleibt die Meldung länger stehen, damit man den Knopf noch erwischt.
const ACTION_NOTICE_MS = 6000;

/**
 * Lässt eine Meldung nach ihrer Zeit verschwinden. Solange sie festgehalten wird (Fokus oder Finger
 * auf der Aktion, etwa mit VoiceOver), läuft keine Zeit; danach beginnt sie von vorn.
 */
export function useNoticeTimer(notice: Notice | null, held: boolean, onExpire: () => void) {
  const expire = useRef(onExpire);
  expire.current = onExpire;
  useEffect(() => {
    if (!notice || held) return undefined;
    const timer = setTimeout(() => expire.current(), notice.action ? ACTION_NOTICE_MS : NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice, held]);
}

interface ToastProps {
  notice: Notice | null;
  /** Meldet, ob die Aktion gerade Fokus oder einen Zeiger hat. */
  onHold?: (held: boolean) => void;
}

/**
 * Kurze Bestätigung wie „Teil gespeichert“. Der Ansagebereich bleibt immer eingehängt, damit VoiceOver
 * die Meldung vorliest – ein erst mit dem Text eingefügter Bereich wird auf iOS oft verschluckt.
 * Der sichtbare Text ist für Screenreader ausgeblendet, sonst käme die Meldung doppelt; eine Aktion
 * bleibt als Knopf erreichbar.
 */
export function Toast({ notice, onHold }: ToastProps) {
  return (
    <>
      <p className="visually-hidden" role="status">
        {notice?.text ?? ''}
      </p>
      {notice && (
        <div
          className={notice.action ? 'toast toast--action' : 'toast'}
          onFocus={() => onHold?.(true)}
          onBlur={() => onHold?.(false)}
          onPointerEnter={() => onHold?.(true)}
          onPointerLeave={() => onHold?.(false)}
        >
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
