# Kleiderschrank-App (für Lena)

Offline-fähige Web-App (PWA) für Lenas iPhone: Kleidungsstücke per Foto erfassen, filtern und zu Looks kombinieren (im Code `outfit`), optional mit einem Foto, auf dem sie den Look trägt. **Kein Server, kein Login.** Alle Daten liegen nur in IndexedDB auf dem Gerät, gesichert wird per Backup-Datei.

- Live: https://peppdoe.github.io/kleiderschrank/
- Repo: https://github.com/peppdoe/kleiderschrank (öffentlich, enthält keine persönlichen Daten)
- Spec: `docs/superpowers/specs/2026-10-10-kleiderschrank-app-design.md`
- Plan (umgesetzt): `docs/superpowers/plans/2026-10-10-kleiderschrank-app.md`
- Anleitung für Lena + iPhone-Abnahme-Checkliste: `README.md`
- Produktbeschreibung (Nutzerin, Zweck, Prinzipien): `PRODUCT.md`
- **Übergabe/aktueller Stand und offene Aufgaben: `HANDOFF.md` (zuerst lesen)**
- Spec/Plan Tragebild (umgesetzt): `docs/superpowers/specs/2026-10-11-outfit-tragebild-design.md`, `docs/superpowers/plans/2026-10-11-outfit-tragebild.md`
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
src/db/        schema.ts (Dexie v2: items/photos/outfits/meta/outfitPhotos), items.ts, outfits.ts (inkl. Tragebild), meta.ts
src/lib/       constants (Kategorien/Farben/Saisons), filters, backup, backupReminder, image,
               errors, storage, files, route (Hash-Routing), id, describe, useObjectUrl,
               greeting (Begrüßung + Saison nach Monat), today (Looks zur Saison, stitchSeason),
               theme (Hell/Dunkel/Automatisch, localStorage `kleiderschrank-theme`)
src/components/  NameAsk (Namensfrage beim ersten Start), ChipGroup, FilterBar, FilterSheet, FilterTags, ItemGrid, ItemPhoto, FilePicker,
               TabBar, NotFound, OutfitPreview, InstallNotice, ErrorBoundary, LabelBand,
               SeasonSymbols, ImportSheet, OutfitSeasons, OutfitLook, OutfitPhotoPicker, SwatchGroup,
               DetailBar, Toast, Sheet, ConfirmSheet, Icon (eigene SVG-Symbole, keine Emojis)
src/screens/   Wardrobe, ItemForm, ItemDetail, Outfits, OutfitEditor, OutfitDetail, Settings
src/App.tsx    Routing-Switch; hält Schrank-Filter (Saison = Heute-Regler), Foto-Entwurf und den gemeinsamen Toast
```

## Gestaltung (vor UI-Änderungen `DESIGN.md` lesen)

- Welt „Pflegeetikett“: flaches Namensband in der Farbe der gewählten Saison (Salbei, Apricot, Ocker, Eisblau; Schrift navy) mit gestrichelter Naht (Begrüßung mit Namen + wechselnder Spruch), Saisons als Pflegesymbole, Auswahl und Filter als Karton-Anhänger mit Lochung, Porzellan-Grund `#f5f6f8` (nie Creme).
- **Sprache: „Look“, nicht „Outfit“.** In der Oberfläche heißt eine Kombination immer Look (Tab „Looks“, „Neuer Look“, „Look gespeichert“). Im Code, in Routen (`#/outfits`) und im Datenmodell bleibt `outfit`.
- **Teile können einen Namen haben** (optionales Feld `name`, ohne Index wie `favorite`, Backup v1 über `parseItem`). Titel: Name, sonst Kategorie (`itemTitle` in `lib/describe.ts`); die Notiz wird nie zum Titel. Im Formular steht nach dem Foto zuerst die Pflicht-Kategorie, Name und Notiz kommen zuletzt.
- **Lena ist 20.** Ton wie eine Freundin mit Gespür für Mode (siehe `PRODUCT.md`), nie wie Verkäuferin, Amt oder Eltern. Ein Test in `lib/greeting.test.ts` sperrt typische Eltern-/Verkäufer-Floskeln.
- **Fadenrot nur für:** die eine Hauptaktion (Hinzufügen, Speichern, Backup erstellen), den aktiven Tab, zerstörerische Aktionen, Fehler und Fokus. Nichts anderes wird rot.
- **Saisonfaden:** Nähte (Namensband, Etiketten), Herz und gewählte Saison tragen die Farbe der gewählten Saison (`--accent`/`--band`/`--stitch`, gesetzt als `data-season` am Root in `App.tsx`). Das Etikett eines Teils trägt dagegen ein eigenes `data-season` (seine Saison, `stitchSeason`). Nie für Aktionen oder Text.
- **Pflegesymbole** (Waschbottich, Trockner-Quadrat, Bügeleisen, Bleich-Dreieck mit Saisonzeichen in `components/Icon.tsx`) stehen nie ohne ihren Saisonnamen.
- **Hell/Dunkel:** Einstellungen → „Darstellung“ (Automatisch · Hell · Dunkel, Anhänger über `ChipGroup`). Die Wahl ist eine Geräte-Einstellung im `localStorage` (nicht im Backup), gesetzt als `data-theme` am Root. Ein Inline-Skript in `index.html` setzt sie vor dem ersten Bild (sonst blitzt es); `lib/theme.ts` übernimmt danach, inkl. `meta theme-color` und Nachziehen bei „Automatisch“ (Systemwechsel und beim Zurückkehren in die App). Dunkel-CSS nur über `[data-theme='dark']`, nie über `@media (prefers-color-scheme)`.
- Abschnittstitel in normaler Schreibweise; Versalien nur für Tabs und Pflegesymbol-Namen.
- Keine Karten um Fotos/Outfits, keine Pillen-Chips, keine Emojis als Symbole (eigene SVGs in `components/Icon.tsx`), keine Kicker-/Eyebrow-Zeile über Überschriften.
- **Daumenreichweite:** In Formularen keine Tab-Leiste; eine feste Leiste ganz unten trägt Abbrechen/Zurück links und die Hauptaktion rechts, oben steht nur der Titel. Detailseiten (Teil, Look) haben `DetailBar` über der Tab-Leiste: ‹ Zurück links, Bearbeiten rechts; Löschen bleibt am Inhaltsende.
- **Farben** wählt man als Farbfelder mit sichtbarem Namen (`SwatchGroup`), nicht als Anhänger. Das Filterblatt zeigt nur Kategorien/Farben, die es unter den übrigen Teilen gibt, mit Anzahl (`facetCounts`).
- **Toasts** nur über `notify(text, action?)` in `App.tsx` (eine dauerhaft eingehängte Ansage-Region für VoiceOver, `components/Toast.tsx`); Bildschirme bekommen dafür einen Callback (`onNotice`). Mit Aktion bleibt der Toast 6 s statt 3,5 s; solange der Knopf Fokus oder einen Zeiger hat, läuft keine Zeit (`useNoticeTimer`, `onHold`).
- **Rückgängig statt Nachfrage-Kette:** Löschen eines Teils/Looks zeigt „Teil/Look gelöscht“ mit „Rückgängig“. `deleteItem`/`deleteOutfit` geben einen Schnappschuss zurück, `restoreItem`/`restoreOutfit` spielen ihn in einer Transaktion zurück (Foto, Liebling, Platz in den Looks; inzwischen geänderte Looks behalten ihre Änderungen).
- **Schriftgrößen nur in rem** (Basis 17 px). Auf iPhone/iPad folgt die Wurzel der iOS-Textgröße (`font: -apple-system-body`, nur mit `-webkit-touch-callout`), feste Reihen (Tabs, Pflegesymbol-Namen, Farbnamen, Bandtitel) sind mit `min(rem, px)` gedeckelt, Eingabefelder nie unter 16 px (`max(1rem, 16px)`), sonst zoomt iOS.
- **Erster Start:** leerer Schrank zeigt „Noch ganz viel Platz hier.“ mit „Erstes Teil fotografieren“, darunter einmal „Wie heißt du?“ (`NameAsk`, verschwindet mit gesetztem Namen); ohne Teile weder Plus-Knopf noch Saison-Wahl. Looks-Tab ohne Teile führt zum ersten Foto.
- **Mehrere Teile hintereinander:** Im Formular für ein neues Teil erscheint, sobald gespeichert werden kann, „Speichern und nächstes Teil fotografieren“ (selbst ein `FilePicker`). `onCreated(item, nextFile)` → `App.tsx` setzt das neue Foto und erhöht `draftCount` (Schlüssel des Formulars), damit es frisch beginnt.
- **Saison-Reihe = „Heute“-Regler:** Die aktuelle Saison ist beim Öffnen vorausgewählt (`App.tsx`), steuert „Heute“, Spruch und Fadenfarbe – **versteckt im Schrank aber nichts**: passende Teile stehen oben, die übrigen unter „Für andere Saisons“. Einfachauswahl über `chooseSeason`. Das Filter-Panel im Schrank hat bewusst keine Saison-Gruppe und setzt die Saison nie zurück. Teile ohne Saison gelten als ganzjährig (`lib/filters.ts`).
- Rückfragen laufen über Bodenblätter (`components/Sheet.tsx`, `ConfirmSheet.tsx`), nie über `window.confirm`. Abbrechen mit ungespeicherten Änderungen fragt nach („Änderungen verwerfen?“).
- Neues Teil passt nicht zu Kategorie-/Farb-/Lieblingsfilter → diese Filter werden gelöst (die Saison bleibt), das Teil markiert und „Teil gespeichert“ angezeigt. Nach dem Speichern eines Looks: Etikett wird eingenäht, „Look gespeichert“.
- Outfits erscheinen als Collage (`OutfitPreview`) oder, falls vorhanden, als Tragebild (`OutfitLook`: Foto von Lena im Look, Vorschau oben bündig zugeschnitten; im Detail oben, darunter die Teile), die Liste zweispaltig; ihre Saison ergibt sich aus den Teilen (`lib/today.ts`), Outfits haben keine eigene Saison.
- **Lieblingsteile:** optionales Feld `favorite` am Teil, ohne Index (daher keine neue Schema-Version). `setFavorite` in `db/items.ts`; das Backup übernimmt es in `parseItem` (Format bleibt v1). Anhänger „Lieblinge“ filtert (`FilterState.favorites`).
- Name für die Begrüßung: Meta-Schlüssel `userName` (Einstellungen). Grußsprüche nennen nie konkrete Kleidungsstücke (Test erzwingt das).
- **Begrüßung wechselt** je Tageszeit (`SALUTATIONS` in `lib/greeting.ts`, beim Öffnen einmal ausgelost über `titlePick`): morgens Guten Morgen · Morgen · Hey, tagsüber Hallo · Hey · Hi, abends Guten Abend · Hey · Na, nachts (23–5) „Noch wach, Lena?“. „Na“ nur mit Namen; höchstens 12 Zeichen. Die Vorschau in den Einstellungen zeigt immer die klassische (ohne `titlePick`). Tests auf „…, Lena“ deshalb mit `/, Lena\??$/`.
- Vorschaubilder sind 3:4 (360×480); ältere quadratische werden per `object-fit: cover` angezeigt.
- Design-Prüfungen: `/impeccable critique` bzw. `impeccable detect --json src index.html`; Review-Aufnahmen landen in `.impeccable/review/` (nicht versioniert).

## Regeln

- **Bildschirme greifen nie direkt auf `db` zu**, sondern nur über `db/items.ts`, `db/outfits.ts`, `db/meta.ts` und `lib/backup.ts`.
- Gespeichert werden stabile englische IDs (`top`, `blue`, `winter`). Deutsche Labels kommen aus `lib/constants.ts`. Die Oberfläche ist komplett auf Deutsch.
- Schreibvorgänge über mehrere Tabellen laufen immer in **einer** Dexie-Transaktion: Teil + Foto anlegen, Teil löschen inkl. Entfernen aus Looks, Look + Tragebild anlegen/ändern/löschen, Backup-Import.
- **Backup-Format v1** (nicht ohne Migration ändern): `{ app: "kleiderschrank", version: 1, exportedAt, items, outfits, photos: [{ itemId, full: <base64> }], outfitPhotos: [{ outfitId, full: <base64> }] }`. `outfitPhotos` ist optional (ältere Sicherungen haben es nicht, Version bleibt 1). Der Import prüft alles **vor** dem Ersetzen.
- Fotos: Vollbild-JPEG mit max. 1200 px an der langen Kante, Qualität 0.85. Vorschaubild 360×480 (3:4), bei Teilen mittig, bei Tragebildern **oben bündig** zugeschnitten (`processPhoto(file, { anchor: 'top' })`). EXIF-Drehung über `imageOrientation: 'from-image'`.
- Schema-Änderungen nur über eine neue `this.version(n)` in `db/schema.ts` (aktuell Version 2: Tabelle `outfitPhotos` für Tragebilder). Bestehende Daten auf Lenas iPhone müssen erhalten bleiben.
- Vite `base` ist `/kleiderschrank/`. Wird das Repo umbenannt, muss auch `base` angepasst werden.

## Tests

- TDD: erst ein fehlschlagender Test, dann der Code. Vor jedem Commit `npm test` und `npx tsc --noEmit` ausführen.
- `*.test.ts` laufen in Node, `*.test.tsx` in jsdom (`environmentMatchGlobs` in `vite.config.ts`).
- `src/test/setup.ts` ersetzt in jsdom `Blob` durch Nodes `Blob`, weil fake-indexeddb jsdom-Blobs leer zurückgibt. Außerdem stubbt die Datei `URL.createObjectURL` und leert vor jedem Test alle Tabellen.
- Helfer in `src/test/factories.ts`: `makeItem`, `fakePhoto`, `seedItem`.
- Der Ansagebereich (`role="status"`) ist immer eingehängt. `findByRole('status')` kehrt deshalb sofort zurück; auf die Meldung immer mit `waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(…))` warten. Ebenso nach dem Speichern erst warten, bis das Formular weg ist, bevor man im Schrank nach einem Namen wie „Hose“ sucht (sonst trifft man den Kategorie-Anhänger).
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

Die vollständige, geordnete Liste steht in `HANDOFF.md` (Abschnitt 4). Kurz:

- Gerätetest auf dem iPhone des Auftraggebers (14 Pro, iOS 27) bestanden. Als Nächstes übergibt er die App an Lena (Anleitungsbild in `docs/uebergabe/`, Link per WhatsApp); danach mit ihren Rückmeldungen weiterbauen.
- Testen auf dem iPhone: `scripts/demo-backup.mjs` erzeugt eine Demo-Sicherung zum Einspielen über „Backup zurückholen“.
- Aus der Kritik Runde 5 (28/40): keine Suche nach Namen/Notizen, Saison-Reihe als Regler nicht selbsterklärend, Hilfe nur als Einzeiler.
