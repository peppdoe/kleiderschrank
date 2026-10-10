# Kleiderschrank-App für Lena – Design

**Datum:** 2026-10-10
**Status:** Design abgestimmt, bereit für Implementierungsplan

## 1. Ziel und Kontext

Lena soll ihren Kleiderschrank digital auf ihrem iPhone erfassen und daraus Outfits zusammenstellen können.

**Zwei Kernaufgaben:**
1. Kleidungsstücke erfassen und überblicken (Foto + Eigenschaften, filterbar).
2. Outfits aus vorhandenen Teilen zusammenstellen, benennen und speichern.

**Rahmenbedingungen:**
- Einzige Nutzerin: Lena, auf ihrem iPhone (Safari).
- Kein Server, keine laufenden Kosten, einfache Einrichtung.
- Daten liegen ausschließlich lokal auf dem iPhone; Sicherung über Datei-Export/-Import.
- Erwarteter Umfang: 100+ Teile inklusive Schuhe und Accessoires.
- Oberfläche auf Deutsch.

**Erfolgskriterien:**
- Ein neues Teil ist in wenigen Sekunden fotografiert und erfasst.
- Teile sind über Filter (Kategorie, Farbe, Saison) schnell auffindbar.
- Outfits lassen sich erstellen, ansehen, bearbeiten und löschen.
- Mit gelegentlichem Backup gehen keine Daten verloren; ein Backup lässt sich vollständig wiederherstellen.
- Die App funktioniert offline und startet vom Home-Bildschirm im Vollbild.

**Nicht im Umfang (bewusst):** Login, Cloud-Sync, Mehrgeräte-Nutzung, Kalender/Outfit-Planung nach Datum, Tags/Anlässe, Collage-Editor, automatische Farberkennung, Freistellen von Fotos.

## 2. Technischer Ansatz

Progressive Web App (PWA), statisch gehostet:

- **Vite + React + TypeScript**
- **Dexie** (IndexedDB) für lokale Datenhaltung, `dexie-react-hooks` (`useLiveQuery`) für reaktive Abfragen
- **vite-plugin-pwa** für Manifest, App-Icon, Service Worker / Offline-Betrieb
- **Vitest + fake-indexeddb + React Testing Library** für Tests
- **GitHub Pages** via GitHub Actions als kostenloses Hosting

Begründung: robustes, verbreitetes Grundgerüst; gut testbar und erweiterbar. Eine native iOS-App wurde verworfen (Mac/Xcode, Apple-Developer-Account 99 €/Jahr nötig).

## 3. Bildschirme und Bedienung

Navigation über eine **Tab-Leiste unten** mit drei Tabs: **Schrank**, **Outfits**, **Einstellungen**.

### 3.1 Schrank (Startseite)
- Raster quadratischer Foto-Kacheln (Vorschaubilder), 3 pro Zeile.
- Filterleiste oben mit Chips für **Kategorie**, **Farbe**, **Saison**; Filter kombinierbar, „Zurücksetzen“ mit einem Tipp.
  - Filtersemantik: Innerhalb einer Dimension ODER (z. B. Blau oder Rot), zwischen Dimensionen UND (Oberteil UND Blau UND Winter). Ein Teil passt zu einem Farb-/Saisonfilter, wenn mindestens eine seiner Farben/Saisons ausgewählt ist.
- Leerer Zustand: freundlicher Hinweis „Noch keine Teile – tippe auf +, um dein erstes Teil zu erfassen“.
- Ergebnislose Filterung: „Keine Teile passen zu diesen Filtern“ + Zurücksetzen-Button.
- „+“-Button: öffnet die iOS-Dateiauswahl (`<input type="file" accept="image/*">`), die „Foto aufnehmen“ und „Fotomediathek“ anbietet, danach das Erfassungsformular.
- Backup-Erinnerung: dezenter Hinweis, wenn das letzte Backup > 30 Tage zurückliegt (oder nie erfolgte und ≥ 10 Teile existieren).
- Tipp auf Kachel → **Detailansicht**.

### 3.2 Detailansicht eines Teils
- Großes Foto, Kategorie, Farben, Saisons, Notiz.
- Liste „In diesen Outfits“ (Outfit-Namen, antippbar).
- Aktionen: **Bearbeiten**, **Löschen** (mit Bestätigung; Hinweis, in wie vielen Outfits das Teil vorkommt).

### 3.3 Erfassungs-/Bearbeitungsformular
- Fotovorschau oben (beim Bearbeiten: Foto austauschbar).
- Auswahl per antippbaren Chips:
  - **Kategorie** (Pflicht, genau eine): Oberteil, Hose, Rock, Kleid, Jacke/Mantel, Schuhe, Tasche, Accessoire, Sonstiges
  - **Farbe** (0..n): Schwarz, Weiß, Grau, Beige, Braun, Rot, Rosa, Orange, Gelb, Grün, Blau, Lila, Bunt/Muster, Metallic – dargestellt als farbige Punkte mit Beschriftung
  - **Saison** (0..n): Frühling, Sommer, Herbst, Winter
  - **Notiz** (optional, Freitext)
- „Speichern“ ist erst aktiv, wenn Foto und Kategorie gesetzt sind. Danach zurück zum Schrank (bzw. zur Detailansicht beim Bearbeiten).

### 3.4 Outfits
- Liste aller Outfits als Karten: Name + Mini-Raster der enthaltenen Teile (bis zu 4 Vorschaubilder, „+n“ bei mehr).
- Leerer Zustand mit Hinweis und Button „Neues Outfit“.
- **Neues Outfit:** Schrank-Raster im Auswahlmodus (Filter verfügbar, gewählte Teile mit Häkchen, Zähler „3 ausgewählt“) → „Weiter“ → Name eingeben (Pflicht) → „Speichern“.
- **Outfit-Detail:** Teile groß im Raster (antippbar → Detailansicht des Teils); Aktionen **Bearbeiten** (Teile ändern, umbenennen) und **Löschen** (mit Bestätigung).
- Outfit ohne Teile (weil alle Teile gelöscht wurden): bleibt erhalten, zeigt „Keine Teile mehr“.

### 3.5 Einstellungen
- **Backup exportieren** (siehe Abschnitt 5).
- **Backup importieren** mit Sicherheitsabfrage „Alle aktuellen Daten werden ersetzt“.
- Anzeige „Letztes Backup: <Datum>“ bzw. „Noch kein Backup“.
- Speicherübersicht: „124 Teile · 18 Outfits · 23 MB“ (MB via `navigator.storage.estimate()`, falls verfügbar).
- Hinweis zur Installation, falls die App nicht als Home-Bildschirm-App läuft oder dauerhafter Speicher abgelehnt wurde.

### 3.6 Gestaltung
- Ruhig, hell, an iOS angelehnt; große Tippflächen (≥ 44 pt); Safe-Area-Abstände (Notch, Home-Indikator).
- Automatischer Dark Mode über `prefers-color-scheme`.

## 4. Architektur und Datenmodell

### 4.1 Projektstruktur
```
src/
  db/
    schema.ts        – Dexie-Datenbank, Tabellen, TypeScript-Typen
    items.ts         – Teile anlegen/ändern/löschen/abfragen
    outfits.ts       – Outfits anlegen/ändern/löschen/abfragen
  lib/
    image.ts         – Foto verkleinern, Vorschaubild erzeugen
    backup.ts        – Export/Import
    filters.ts       – Filterlogik (reine Funktion)
    constants.ts     – Kategorien, Farben, Saisons (IDs + deutsche Labels)
  screens/           – Schrank, Teil-Detail, Teil-Formular, Outfits, Outfit-Detail, Outfit-Editor, Einstellungen
  components/        – Kachel, Filterleiste, Chip-Auswahl, Tab-Leiste, Bestätigungsdialog …
  App.tsx            – Routing (Hash-basiert, kompatibel mit GitHub Pages)
```
Regel: Bildschirme greifen nur über `db/items.ts` und `db/outfits.ts` auf Daten zu, nie direkt auf Dexie-Tabellen.

### 4.2 Datenmodell (Dexie / IndexedDB)

| Tabelle   | Felder |
|-----------|--------|
| `items`   | `id` (UUID), `category`, `colors: string[]`, `seasons: string[]`, `note: string`, `createdAt`, `updatedAt` |
| `photos`  | `itemId` (Primärschlüssel), `full: Blob` (JPEG, längste Kante ≈ 1200 px), `thumb: Blob` (JPEG, ≈ 300 px, quadratisch zugeschnitten) |
| `outfits` | `id` (UUID), `name`, `itemIds: string[]`, `createdAt`, `updatedAt` |
| `meta`    | `key`, `value` (z. B. `lastBackupAt`, `persistRequested`) |

- Kategorie-, Farb- und Saisonwerte werden als stabile IDs gespeichert (z. B. `top`, `blue`, `winter`); deutsche Labels kommen aus `constants.ts`.
- Fotos in separater Tabelle, damit Teillisten schnell bleiben und das Raster nur Vorschaubilder lädt.
- Zeitstempel als ISO-Strings.
- Schema-Versionierung über Dexie `version(n)`, damit spätere Erweiterungen migrierbar sind.

### 4.3 Kernabläufe
- **Teil anlegen:** Datei wählen → `image.ts` dekodiert (`createImageBitmap`, Fallback `<img>`), verkleinert per Canvas, erzeugt Vorschaubild → `items.ts` schreibt Teil und Fotos in **einer Transaktion**.
- **Teil löschen:** in **einer Transaktion** Teil, Fotos und alle Verweise in `outfits.itemIds` entfernen.
- **Anzeige:** Bildschirme nutzen `useLiveQuery`, Änderungen erscheinen automatisch. Vorschaubild-Blobs werden über Object-URLs angezeigt und beim Unmount freigegeben.

### 4.4 PWA
- `vite-plugin-pwa` mit Manifest (Name „Kleiderschrank“, Icon, `display: standalone`, Theme-Farbe) und Service Worker, der alle App-Dateien für den Offline-Betrieb vorhält.
- Beim ersten Start `navigator.storage.persist()` anfragen; Ergebnis in `meta` speichern.
- Updates: Service Worker aktualisiert sich automatisch beim nächsten Start (`registerType: 'autoUpdate'`).

## 5. Backup

- **Format:** eine JSON-Datei `kleiderschrank-backup-JJJJ-MM-TT.json`:
  ```json
  { "app": "kleiderschrank", "version": 1, "exportedAt": "...",
    "items": [...], "outfits": [...],
    "photos": [{ "itemId": "...", "full": "<base64 JPEG>" }] }
  ```
  Vorschaubilder werden nicht exportiert, sondern beim Import neu erzeugt.
- **Export:** Datei erzeugen → Teilen über `navigator.share({ files })`, wenn unterstützt (z. B. in iCloud Drive / Dateien sichern); sonst Download. Nach erfolgreichem Export `lastBackupAt` setzen.
- **Import:** Datei wählen → Sicherheitsabfrage → JSON parsen und vollständig validieren (`app`, `version`, Pflichtfelder, gültige Kategorie-IDs, jedes Teil hat ein Foto) → Vorschaubilder erzeugen → erst dann in **einer Transaktion** alle Tabellen leeren und neu befüllen. Bei jedem Fehler vor der Transaktion bleiben die bestehenden Daten unverändert.
- Erwartete Größe bei 100+ Teilen: ca. 15–30 MB.

## 6. Fehlerbehandlung

Alle Meldungen auf Deutsch und in Alltagssprache.

| Situation | Verhalten |
|-----------|-----------|
| Foto nicht lesbar / Format nicht unterstützt | „Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.“ Formular bleibt offen. |
| Speicher voll (`QuotaExceededError`) | Meldung, dass der Speicher voll ist, mit Hinweis, ein Backup zu machen und Teile zu löschen. Nichts wird teilweise gespeichert. |
| Ungültige Backup-Datei | „Das ist keine gültige Kleiderschrank-Sicherung.“ Keine Datenänderung. |
| Dauerhafter Speicher abgelehnt | Hinweis in den Einstellungen, die App zum Home-Bildschirm hinzuzufügen. |
| Teilen beim Export nicht verfügbar / abgebrochen | Fallback auf Download; Abbruch durch Nutzerin ist kein Fehler (kein `lastBackupAt`-Update). |
| Unvollständiges Formular | Speichern-Button deaktiviert, bis Foto und Kategorie gesetzt sind (bei Outfits: mind. ein Teil und ein Name). |

## 7. Tests

- **Unit/Integration (Vitest + fake-indexeddb):**
  - `filters.ts`: Kombinationen, ODER innerhalb/UND zwischen Dimensionen, leere Filter.
  - `items.ts`: anlegen, ändern, löschen inkl. Entfernen aus Outfits; Transaktionsverhalten.
  - `outfits.ts`: anlegen, ändern, löschen, leeres Outfit nach Teil-Löschung.
  - `backup.ts`: Roundtrip (Export → Import → identische Daten), Ablehnung ungültiger/kaputter Dateien ohne Datenänderung.
- **Komponenten (React Testing Library):** Teil erfassen (mit gemocktem `image.ts`), filtern, Outfit erstellen.
- **Manuell:** Bildverkleinerung im Desktop-Browser; abschließend auf einem echten iPhone: Installation zum Home-Bildschirm, Kamera, Offline-Start, Backup-Export nach iCloud Drive und Re-Import.

## 8. Veröffentlichung

- GitHub-Repository; GitHub-Actions-Workflow: bei Push auf `main` → `npm ci` → Tests → Build → Deploy auf **GitHub Pages**.
- Vite `base` auf den Repository-Pfad setzen (z. B. `/kleiderschrank/`); Hash-Routing vermeidet 404-Probleme auf GitHub Pages.
- Anleitung für Lena (README + Info-Text in der App): Link in Safari öffnen → Teilen → „Zum Home-Bildschirm“; regelmäßig Backup in iCloud Drive sichern.
