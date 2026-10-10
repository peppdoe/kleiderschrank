import { Icon } from './Icon';

// Auf iOS hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari.
export function InstallNotice({ onDismiss, detailed = false }: { onDismiss?: () => void; detailed?: boolean }) {
  if (detailed) {
    return (
      <p className="notice" role="note">
        Installiere die App über Safari → Teilen → „Zum Home-Bildschirm“, damit deine Daten dauerhaft bleiben. Daten aus
        Safari werden nicht übernommen – wenn du hier schon Teile erfasst hast: Backup erstellen und in der installierten
        App einspielen.
      </p>
    );
  }
  return (
    <div className="notice-line" role="note">
      <p>Erst „Zum Home-Bildschirm“ – Daten aus Safari werden nicht übernommen.</p>
      {onDismiss && (
        <button type="button" className="icon-button" aria-label="Hinweis ausblenden" onClick={onDismiss}>
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
