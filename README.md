# Kleiderschrank

Lenas digitaler Kleiderschrank als Web-App fürs iPhone. Alle Daten bleiben auf dem Gerät.

## Für Lena: Installation

1. Öffne in **Safari** den Link `https://peppdoe.github.io/kleiderschrank/`.
2. Tippe unten auf **Teilen** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → **Hinzufügen**.
3. Starte die App ab jetzt immer über das neue Symbol auf dem Home-Bildschirm.

## Für Lena: So funktioniert's

- **Teil hinzufügen:** Tipp auf „Erstes Teil fotografieren“ bzw. später auf das rote **+**, mach ein Foto oder wähl eins aus. Dann nur noch eine Kategorie antippen und **Speichern**. Farbe, Saison, Name und Notiz sind freiwillig.
- **Saison oben auf dem Band:** Die aktuelle Saison ist schon gewählt. Sie bestimmt, welche Looks unter **„Heute“** stehen. Im Schrank fehlt nie etwas: Passende Teile stehen oben, die anderen unter „Für andere Saisons“. Tipp eine andere Saison an, um zu sehen, was dann passt.
- **Looks:** Im Tab **Looks** auf **+** tippen, die Teile antippen, die zusammengehören, **Weiter**, Namen geben, fertig. Wenn du magst, leg ein Foto von dir im Look dazu (z. B. ein Spiegel-Selfie) – auch später noch in der Look-Ansicht.
- **Lieblinge:** In einem Teil auf das Herz tippen; der Anhänger „Lieblinge“ zeigt dann nur diese.
- **Dein Name** für die Begrüßung: **Einstellungen** → **Du**.

## Für Lena: Backup

Deine Daten liegen nur auf deinem iPhone. Mach regelmäßig ein Backup (die App erinnert dich):

1. **Einstellungen** → **Backup erstellen** → **Backup sichern**.
2. Wähle **„In Dateien sichern“** → **iCloud Drive** → **Sichern**.

Wiederherstellen (z. B. auf einem neuen iPhone): App installieren → **Einstellungen** → **Backup zurückholen** → Datei aus iCloud Drive wählen.

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
- [ ] Erster Start: „Noch ganz viel Platz hier.“ → „Erstes Teil fotografieren“ öffnet Kamera bzw. Fotomediathek.
- [ ] „+“ → „Foto aufnehmen“: Kamera öffnet sich, Teil lässt sich speichern.
- [ ] „+“ → „Fotomediathek“: Foto auswählen und speichern; Hochformat- und HEIC-Fotos stehen richtig herum.
- [ ] Nach dem Foto ist die Kategorie ohne Scrollen sichtbar; Abbrechen/Speichern sitzen unten in Daumenreichweite.
- [ ] Name für ein Teil vergeben → erscheint auf dem Etikett.
- [ ] Filter nach Kategorie, Farbe und „Lieblinge“ funktionieren; das Filterblatt zeigt nur vorhandene Werte mit Anzahl.
- [ ] Saison auf dem Band wechseln: „Heute“ zeigt die passenden Looks, der Schrank versteckt nichts (Rest unter „Für andere Saisons“).
- [ ] Look erstellen, umbenennen, löschen; Foto von dir im Look hinzufügen (Spiegel-Selfie: Kopf bleibt in der Vorschau), ändern und entfernen.
- [ ] Mit VoiceOver: „Teil gespeichert“ / „Look gespeichert“ werden vorgelesen.
- [ ] Flugmodus an → App vom Home-Bildschirm starten → alles sichtbar.
- [ ] Backup sichern in iCloud Drive; ein Teil löschen; Backup zurückholen → Teil und Tragebilder sind wieder da.
