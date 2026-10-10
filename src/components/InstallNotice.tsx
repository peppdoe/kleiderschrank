// Auf iOS hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari.
export function InstallNotice() {
  return (
    <p className="banner banner--static" role="note">
      Installiere die App zuerst: Safari → Teilen → „Zum Home-Bildschirm“, dann die App über das neue Symbol öffnen.
      Daten aus Safari werden nicht übernommen – falls du hier schon Teile erfasst hast: Backup erstellen und in der
      Home-Bildschirm-App einspielen.
    </p>
  );
}
