import { Icon } from './Icon';

// Auf iOS hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari.
export function InstallNotice({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="notice-line" role="note">
      <p>
        Über Safari → Teilen → „Zum Home-Bildschirm“ installieren. Daten aus Safari werden nicht übernommen – wenn
        du hier schon Teile erfasst hast: Backup erstellen und in der installierten App einspielen.
      </p>
      {onDismiss && (
        <button type="button" className="icon-button" aria-label="Hinweis ausblenden" onClick={onDismiss}>
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
