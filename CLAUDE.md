# Kleiderschrank-App (für Lena)

Offline-fähige Web-App (PWA) für Lenas iPhone: Kleidungsstücke per Foto erfassen, filtern und zu Outfits kombinieren. **Kein Server, kein Login.** Alle Daten liegen nur in IndexedDB auf dem Gerät, gesichert wird per Backup-Datei.

- Live: https://peppdoe.github.io/kleiderschrank/
- Repo: https://github.com/peppdoe/kleiderschrank (öffentlich, enthält keine persönlichen Daten)
- Spec: `docs/superpowers/specs/2026-10-10-kleiderschrank-app-design.md`
- Plan (umgesetzt): `docs/superpowers/plans/2026-10-10-kleiderschrank-app.md`
- Anleitung für Lena + iPhone-Abnahme-Checkliste: `README.md`
- Produktbeschreibung (Nutzerin, Zweck, Prinzipien): `PRODUCT.md`
- Gestaltungssystem „Pflegeetikett“ (Farben, Schrift, Komponenten, Regeln): `DESIGN.md` + `.impeccable/design.json`; Gestaltungsauftrag: `.impeccable/surfaces/src.md`

## Befehle

```bash
npm install
npm run dev        # http://localhost:5173/kleiderschrank/
npm test           # Vitest, alle Tests
npm run build      # tsc --noEmit + vite build (inkl. Service Worker)
npm run preview    # gebaute App, http://localhost:4173/kleiderschrank/
```

- Node 24 LTS liegt unter `C:\Program Files\nodejs`. Steht es in einer Shell nicht im PATH, hilft `export PATH="/c/Program Files/nodejs:$PATH"` (Bash).
- Für den Browser-Pane: `.claude/launch.json` mit den Konfigurationen `dev` und `preview`. Dort `C:/PROGRA~1/...` mit Vorwärts-Slashes verwenden, Pfade mit Leerzeichen oder Backslashes scheitern.
- Am iPhone im WLAN testen: `npm run dev -- --host`. Offline-Betrieb und „Zum Home-Bildschirm“ funktionieren erst über HTTPS (GitHub Pages).

## Stack und Struktur

Vite 5 · React 18 · TypeScript (strict) · Dexie 4 (IndexedDB) + `dexie-react-hooks` · vite-plugin-pwa · Vitest + jsdom + fake-indexeddb + Testing Library. Alle Versionen sind exakt gepinnt (`npm install -E`).

```
src/db/        schema.ts (Dexie-Tabellen items/photos/outfits/meta), items.ts, outfits.ts, meta.ts
src/lib/       constants (Kategorien/Farben/Saisons), filters, backup, backupReminder, image,
               errors, storage, files, route (Hash-Routing), id, describe, useObjectUrl,
               greeting (Begrüßung + Saison nach Monat), today (Outfits zur Saison)
src/components/  ChipGroup, FilterBar, FilterSheet, FilterTags, ItemGrid, ItemPhoto, FilePicker,
               TabBar, NotFound, OutfitPreview, InstallNotice, ErrorBoundary, LabelBand,
               SeasonSymbols, ImportSheet, OutfitSeasons, OutfitLook, OutfitPhotoPicker,
               Icon (eigene SVG-Symbole, keine Emojis)
src/screens/   Wardrobe, ItemForm, ItemDetail, Outfits, OutfitEditor, OutfitDetail, Settings
src/App.tsx    Routing-Switch; hält Schrank-Filter und Foto-Entwurf
```

## Gestaltung (vor UI-Änderungen `DESIGN.md` lesen)

- Welt „Pflegeetikett“: flaches Namensband in der Farbe der gewählten Saison (Salbei, Apricot, Ocker, Eisblau; Schrift navy) mit gestrichelter Naht (Begrüßung mit Namen + wechselnder Spruch), Saisons als Pflegesymbole, Auswahl und Filter als Karton-Anhänger mit Lochung, Porzellan-Grund `#f5f6f8` (nie Creme).
- **Sprache: „Look“, nicht „Outfit“.** In der Oberfläche heißt eine Kombination immer Look (Tab „Looks“, „Neuer Look“, „Look gespeichert“). Im Code, in Routen (`#/outfits`) und im Datenmodell bleibt `outfit`.
- **Teile können einen Namen haben** (optionales Feld `name`, ohne Index wie `favorite`, Backup v1 über `parseItem`). Titel: Name, sonst erste Notizzeile, sonst Kategorie (`itemTitle` in `lib/describe.ts`).
- **Lena ist 20.** Ton wie eine Freundin mit Gespür für Mode (siehe `PRODUCT.md`), nie wie Verkäuferin, Amt oder Eltern. Ein Test in `lib/greeting.test.ts` sperrt typische Eltern-/Verkäufer-Floskeln.
- **Fadenrot nur für:** die eine Hauptaktion (Hinzufügen, Speichern, Backup erstellen), den aktiven Tab, zerstörerische Aktionen, Fehler und Fokus. Nichts anderes wird rot.
- **Saisonfaden:** Nähte (Namensband, Etiketten), Herz und gewählte Saison tragen die Farbe der gewählten Saison (`--accent`, gesetzt als `data-season` am Root in `App.tsx`). Nie für Aktionen oder Text.
- Abschnittstitel in normaler Schreibweise; Versalien nur für Tabs und Pflegesymbol-Namen.
- Keine Karten um Fotos/Outfits, keine Pillen-Chips, keine Emojis als Symbole (eigene SVGs in `components/Icon.tsx`), keine Kicker-/Eyebrow-Zeile über Überschriften.
- In Formularen keine Tab-Leiste; Aktionen sitzen in einer festen Leiste unten (Daumenreichweite).
- **Saison-Reihe = „Heute“-Regler:** Die aktuelle Saison ist beim Öffnen vorausgewählt (`App.tsx`) und filtert Schrank und „Heute“; Einfachauswahl über `chooseSeason`. Das Filter-Panel im Schrank hat bewusst keine Saison-Gruppe und setzt die Saison nie zurück. Teile ohne Saison gelten als ganzjährig (`lib/filters.ts`).
- Rückfragen laufen über Bodenblätter (`components/Sheet.tsx`, `ConfirmSheet.tsx`), nie über `window.confirm`. Abbrechen mit ungespeicherten Änderungen fragt nach („Änderungen verwerfen?“).
- Neues Teil passt nicht zum aktiven Filter → Filter wird gelöst, das Teil markiert und „Teil gespeichert“ angezeigt. Nach dem Speichern eines Outfits: Etikett wird eingenäht, „Look gespeichert“.
- Outfits erscheinen als Collage (`OutfitPreview`) oder, falls vorhanden, als Tragebild (`OutfitLook`: Foto von Lena im Look, Vorschau oben bündig zugeschnitten; im Detail oben, darunter die Teile), die Liste zweispaltig; ihre Saison ergibt sich aus den Teilen (`lib/today.ts`), Outfits haben keine eigene Saison.
- **Lieblingsteile:** optionales Feld `favorite` am Teil, ohne Index (daher keine neue Schema-Version). `setFavorite` in `db/items.ts`; das Backup übernimmt es in `parseItem` (Format bleibt v1). Anhänger „Lieblinge“ filtert (`FilterState.favorites`).
- Name für die Begrüßung: Meta-Schlüssel `userName` (Einstellungen). Grußsprüche nennen nie konkrete Kleidungsstücke (Test erzwingt das).
- Vorschaubilder sind 3:4 (360×480); ältere quadratische werden per `object-fit: cover` angezeigt.
- Design-Prüfungen: `/impeccable critique` bzw. `impeccable detect --json src index.html`; Review-Aufnahmen landen in `.impeccable/review/` (nicht versioniert).

## Regeln

- **Bildschirme greifen nie direkt auf `db` zu**, sondern nur über `db/items.ts`, `db/outfits.ts`, `db/meta.ts` und `lib/backup.ts`.
- Gespeichert werden stabile englische IDs (`top`, `blue`, `winter`). Deutsche Labels kommen aus `lib/constants.ts`. Die Oberfläche ist komplett auf Deutsch.
- Schreibvorgänge über mehrere Tabellen laufen immer in **einer** Dexie-Transaktion: Teil + Foto anlegen, Teil löschen inkl. Entfernen aus Outfits, Backup-Import.
- **Backup-Format v1** (nicht ohne Migration ändern): `{ app: "kleiderschrank", version: 1, exportedAt, items, outfits, photos: [{ itemId, full: <base64> }], outfitPhotos: [{ outfitId, full: <base64> }] }`. `outfitPhotos` ist optional (ältere Sicherungen haben es nicht, Version bleibt 1). Der Import prüft alles **vor** dem Ersetzen.
- Fotos: Vollbild-JPEG mit max. 1200 px an der langen Kante, Qualität 0.85. Vorschaubild 300×300, mittig zugeschnitten. EXIF-Drehung über `imageOrientation: 'from-image'`.
- Schema-Änderungen nur über eine neue `this.version(n)` in `db/schema.ts` (aktuell Version 2: Tabelle `outfitPhotos` für Tragebilder). Bestehende Daten auf Lenas iPhone müssen erhalten bleiben.
- Vite `base` ist `/kleiderschrank/`. Wird das Repo umbenannt, muss auch `base` angepasst werden.

## Tests

- TDD: erst ein fehlschlagender Test, dann der Code. Vor jedem Commit `npm test` und `npx tsc --noEmit` ausführen.
- `*.test.ts` laufen in Node, `*.test.tsx` in jsdom (`environmentMatchGlobs` in `vite.config.ts`).
- `src/test/setup.ts` ersetzt in jsdom `Blob` durch Nodes `Blob`, weil fake-indexeddb jsdom-Blobs leer zurückgibt. Außerdem stubbt die Datei `URL.createObjectURL` und leert vor jedem Test alle Tabellen.
- Helfer in `src/test/factories.ts`: `makeItem`, `fakePhoto`, `seedItem`.
- Werte aus `useLiveQuery` erscheinen asynchron. In Tests deshalb `findBy…` verwenden, nicht `getBy…`. Sonst werden die Tests wackelig.
- In Dateien mit `vi.mock(..., () => ({ x: vi.fn(...) }))` **kein** `vi.restoreAllMocks()` aufrufen, das leert die Mock-Implementierungen.
- Canvas und `createImageBitmap` gibt es in jsdom nicht. `lib/image.ts` wird in Screen-Tests gemockt. Echte Bildverarbeitung lässt sich im Browser-Pane per `await import('/kleiderschrank/src/lib/image.ts')` prüfen.

## Deployment

- Jeder Push auf `main` startet `.github/workflows/deploy.yml`: `npm ci` → Tests → Build → GitHub Pages. Die installierte App aktualisiert sich beim nächsten Start selbst (`registerType: 'autoUpdate'`).
- Entwickelt wird auf Feature-Branches, die anschließend per Fast-Forward in `main` übernommen werden. Vor dem Push nach `main` den Nutzer fragen, denn das veröffentlicht.
- Git-Identität (nur in diesem Repo): `peppdoe` / `340721352+peppdoe@users.noreply.github.com`. `gh` ist als `peppdoe` angemeldet (Scopes: repo, workflow).

## iOS-Besonderheiten (wichtig)

- **Safari und die Home-Bildschirm-App haben getrennte Speicher.** Daten aus Safari werden nicht übernommen. `InstallNotice` weist in Safari darauf hin.
- `navigator.share` braucht eine frische Nutzergeste. Deshalb besteht das Backup aus zwei Schritten: „Backup erstellen“ → „Backup sichern“, ohne `await` vor `share()`.
- In der installierten App ist ein Download (`<a download>`) unzuverlässig und zählt deshalb nicht als Backup.
- `navigator.storage.persist()` wird beim Start angefragt. Ohne Installation kann Safari die Daten nach etwa 7 Tagen ohne Nutzung löschen.
- npm 11 blockiert Install-Skripte (z. B. von esbuild und sharp). Bisher funktioniert trotzdem alles. Falls Vite oder der Icon-Generator streiken: `npm install-scripts approve <paket>`.

## Offen

- Abnahme auf Lenas echtem iPhone: Checkliste in `README.md`, besonders Hochformat-/HEIC-Fotos und Backup über iCloud Drive.
