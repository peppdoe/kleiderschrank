# Kleiderschrank

Lenas digitaler Kleiderschrank als Web-App fürs iPhone. Alle Daten bleiben auf dem Gerät.

## Für Lena: Installation

1. Öffne in **Safari** den Link `https://peppdoe.github.io/kleiderschrank/`.
2. Tippe unten auf **Teilen** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → **Hinzufügen**.
3. Starte die App ab jetzt immer über das neue Symbol auf dem Home-Bildschirm.

## Für Lena: Backup

Deine Daten liegen nur auf deinem iPhone. Mach regelmäßig ein Backup (die App erinnert dich):

1. **Einstellungen** → **Backup erstellen** → **Backup sichern**.
2. Wähle **„In Dateien sichern“** → **iCloud Drive** → **Sichern**.

Wiederherstellen (z. B. auf einem neuen iPhone): App installieren → **Einstellungen** → **Backup einspielen** → Datei aus iCloud Drive wählen.

## Entwicklung

Voraussetzung: Node 24 LTS.

```bash
npm install
npm run dev      # http://localhost:5173/kleiderschrank/
npm test
npm run build
```

Am iPhone im selben WLAN testen: `npm run dev -- --host` und die angezeigte `Network`-Adresse in Safari öffnen. Offline-Modus und „Zum Home-Bildschirm“ funktionieren erst über HTTPS (GitHub Pages).

Jeder Push auf `main` wird automatisch getestet und auf GitHub Pages veröffentlicht (`.github/workflows/deploy.yml`).

## Abnahme-Checkliste auf dem iPhone

- [ ] Link in Safari öffnen, zum Home-Bildschirm hinzufügen, App startet im Vollbild.
- [ ] „+“ → „Foto aufnehmen“: Kamera öffnet sich, Teil lässt sich speichern.
- [ ] „+“ → „Fotomediathek“: Foto auswählen und speichern; Hochformat-Fotos stehen richtig herum.
- [ ] Filter nach Kategorie, Farbe, Saison funktionieren.
- [ ] Outfit erstellen, umbenennen, löschen.
- [ ] Flugmodus an → App vom Home-Bildschirm starten → alles sichtbar.
- [ ] Backup sichern in iCloud Drive; ein Teil löschen; Backup einspielen → Teil ist wieder da.
