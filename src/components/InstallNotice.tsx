import { Icon } from './Icon';

// Auf iOS hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari.
export function InstallNotice({ onDismiss, detailed = false }: { onDismiss?: () => void; detailed?: boolean }) {
  if (detailed) {
    return (
      <p className="notice" role="note">
        Leg die App über Teilen → „Zum Home-Bildschirm“ ab, dann bleibt dein Schrank sicher gespeichert. Teile aus Safari
        ziehen nicht automatisch mit um: vorher ein Backup erstellen und es in der App zurückholen.
      </p>
    );
  }
  return (
    <div className="notice-line" role="note">
      <p>Leg die App auf den Home-Bildschirm. Was du in Safari anlegst, zieht nicht mit.</p>
      {onDismiss && (
        <button type="button" className="icon-button" aria-label="Hinweis ausblenden" onClick={onDismiss}>
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
