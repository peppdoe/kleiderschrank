# Kleiderschrank-App (für Lena)

Offline-fähige Web-App (PWA) für Lenas iPhone: Kleidungsstücke per Foto erfassen, filtern und zu Outfits kombinieren. **Kein Server, kein Login.** Alle Daten liegen nur in IndexedDB auf dem Gerät, gesichert wird per Backup-Datei.

- Live: https://peppdoe.github.io/kleiderschrank/
- Repo: https://github.com/peppdoe/kleiderschrank (öffentlich, enthält keine persönlichen Daten)
- Spec: `docs/superpowers/specs/2026-10-10-kleiderschrank-app-design.md`
- Plan (umgesetzt): `docs/superpowers/plans/2026-10-10-kleiderschrank-app.md`
- Anleitung für Lena + iPhone-Abnahme-Checkliste: `README.md`

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
               errors, storage, files, route (Hash-Routing), id, describe, useObjectUrl
src/components/  ChipGroup, FilterBar, ItemGrid, ItemPhoto, FilePicker, TabBar, NotFound,
               OutfitPreview, InstallNotice, ErrorBoundary
src/screens/   Wardrobe, ItemForm, ItemDetail, Outfits, OutfitEditor, OutfitDetail, Settings
src/App.tsx    Routing-Switch; hält Schrank-Filter und Foto-Entwurf
```

## Regeln

- **Bildschirme greifen nie direkt auf `db` zu**, sondern nur über `db/items.ts`, `db/outfits.ts`, `db/meta.ts` und `lib/backup.ts`.
- Gespeichert werden stabile englische IDs (`top`, `blue`, `winter`). Deutsche Labels kommen aus `lib/constants.ts`. Die Oberfläche ist komplett auf Deutsch.
- Schreibvorgänge über mehrere Tabellen laufen immer in **einer** Dexie-Transaktion: Teil + Foto anlegen, Teil löschen inkl. Entfernen aus Outfits, Backup-Import.
- **Backup-Format v1** (nicht ohne Migration ändern): `{ app: "kleiderschrank", version: 1, exportedAt, items, outfits, photos: [{ itemId, full: <base64> }] }`. Der Import prüft alles **vor** dem Ersetzen.
- Fotos: Vollbild-JPEG mit max. 1200 px an der langen Kante, Qualität 0.85. Vorschaubild 300×300, mittig zugeschnitten. EXIF-Drehung über `imageOrientation: 'from-image'`.
- Schema-Änderungen nur über eine neue `this.version(n)` in `db/schema.ts`. Bestehende Daten auf Lenas iPhone müssen erhalten bleiben.
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
