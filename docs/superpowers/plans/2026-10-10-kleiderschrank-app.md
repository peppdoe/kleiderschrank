# Kleiderschrank-App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine offline-fähige Web-App (PWA) für Lenas iPhone, mit der sie Kleidungsstücke per Foto erfasst, filtert, zu Outfits kombiniert und per Datei sichert – ohne Server.

**Architecture:** Vite + React + TypeScript als statische Single-Page-App mit Hash-Routing. Alle Daten liegen in IndexedDB (über Dexie); die Bildschirme greifen ausschließlich über kleine Datenmodule (`src/db/items.ts`, `outfits.ts`, `meta.ts`) zu und beobachten Abfragen live (`useLiveQuery`). Fotos werden im Browser per Canvas verkleinert; Backup ist eine JSON-Datei mit Base64-Fotos. Veröffentlichung über GitHub Pages.

**Tech Stack:** Node 24 LTS, Vite 5.4, React 18.3, TypeScript 5.6, Dexie 4.0 + dexie-react-hooks, vite-plugin-pwa 0.21, Vitest 2.1 + jsdom + fake-indexeddb + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-10-kleiderschrank-app-design.md`

## Global Constraints

- Oberfläche komplett auf Deutsch; gespeicherte Werte sind stabile englische IDs (`top`, `blue`, `winter` …), Labels kommen aus `src/lib/constants.ts`.
- Kategorien (genau eine, Pflicht): Oberteil, Hose, Rock, Kleid, Jacke/Mantel, Schuhe, Tasche, Accessoire, Sonstiges.
- Farben (0..n): Schwarz, Weiß, Grau, Beige, Braun, Rot, Rosa, Orange, Gelb, Grün, Blau, Lila, Bunt/Muster, Metallic.
- Saisons (0..n): Frühling, Sommer, Herbst, Winter.
- Kein Server, kein Login, keine Cloud: alle Daten in IndexedDB auf dem Gerät.
- Fotos: Vollbild JPEG, längste Kante ≤ 1200 px, Qualität 0.85; Vorschaubild 300 × 300 px, mittig quadratisch zugeschnitten.
- Backup-Format: `{ app: "kleiderschrank", version: 1, exportedAt, items, outfits, photos: [{ itemId, full: <base64> }] }`; Dateiname `kleiderschrank-backup-JJJJ-MM-TT.json`. Import ersetzt alles, und zwar nur nach vollständiger Validierung in einer Transaktion.
- Backup-Erinnerung: wenn letztes Backup > 30 Tage her ist, oder nie erfolgte und ≥ 10 Teile existieren.
- Bildschirme (`src/screens/*`) greifen nie direkt auf `db` zu, nur über `src/db/items.ts`, `src/db/outfits.ts`, `src/db/meta.ts` und `src/lib/backup.ts`.
- Tippflächen ≥ 44 px; Safe-Area-Abstände; Dark Mode über `prefers-color-scheme`.
- Vite `base` ist `/kleiderschrank/` – das GitHub-Repository muss `kleiderschrank` heißen.
- Abhängigkeiten werden mit exakten Versionen installiert (`npm install -E`), genau die im Plan genannten.
- Tests: Daten-/Logik-Tests heißen `*.test.ts` und laufen in der Node-Umgebung; Komponenten-/Ablauf-Tests heißen `*.test.tsx` und laufen in jsdom. (Grund: fake-indexeddb kann jsdom-Blobs nicht speichern; der Test-Setup ersetzt in jsdom `Blob` durch Nodes `Blob`. Das wurde vorab geprüft.)

## Review Focus

1. **Riesige iPhone-Fotos (12–48 MP, z. B. 8064 × 6048):** Erwartet wird, dass das gespeicherte Foto auf 1200 × 900 verkleinert wird, ohne Absturz. → Test für `fitWithin`/`centerSquare` in Task 6.
2. **Doppeltes Tippen auf „Speichern“:** Erwartet wird genau ein neues Teil, kein Duplikat. → Doppelklick-Test in Task 8 (Button-Sperre + Ref-Guard).
3. **Backup mit verwaisten oder doppelten Verweisen** (Outfit verweist auf nicht vorhandenes Teil, Foto ohne Teil): Erwartet wird ein bereinigter Import, kein Abbruch. → Tests in Task 5.
4. **Veraltete Adresse nach dem Löschen** (Zurück-Geste auf `#/item/<gelöschte id>` oder `#/outfit/<gelöschte id>`): Erwartet wird ein freundlicher Hinweis statt einer leeren oder abgestürzten Seite. → Tests in Task 9 und Task 10.
5. **Outfit-Name nur aus Leerzeichen:** Erwartet wird, dass er nicht gespeichert werden kann. → Tests in Task 4 (Datenebene) und Task 10 (UI).

## Voraussetzungen (vor Task 1)

- Node 24 LTS, Git, GitHub CLI und VS Code sind installiert (am 2026-10-10 erledigt). Nach der Installation muss Claude bzw. das Terminal neu gestartet werden, damit `node`/`npm` im PATH sind. Prüfen mit `node --version` (erwartet `v24.x`).
- Git-Identität ist gesetzt (`git config user.name` / `git config user.email` liefern Werte).
- Das Repository existiert bereits (`git init` erfolgt, Branch `main`), die Spec liegt unter `docs/superpowers/specs/`.

## Dateistruktur

```
package.json, package-lock.json, tsconfig.json, vite.config.ts, index.html
.gitignore, .gitattributes, README.md
.github/workflows/deploy.yml
public/icon.svg (+ generierte PNG-Icons, favicon.ico)
src/
  main.tsx                 – Einstieg, rendert <App/>
  App.tsx                  – Routing-Switch, Tab-Leiste, App-weiter Zustand (Filter, Foto-Entwurf)
  styles.css               – alle Styles inkl. Dark Mode
  db/
    schema.ts              – Dexie-DB, Typen Item/Photo/Outfit/MetaEntry
    meta.ts                – Schlüssel/Wert-Einstellungen (letztes Backup, Persistenz)
    items.ts               – Teile + Fotos: CRUD, Abfragen
    outfits.ts             – Outfits: CRUD, Abfragen, Validierung
  lib/
    constants.ts           – Kategorien/Farben/Saisons, Typen, Prüf-Funktionen
    id.ts                  – UUID (auch ohne sicheren Kontext)
    describe.ts            – Beschriftung eines Teils, Plural-Helfer
    filters.ts             – Filterlogik (rein)
    backup.ts              – Export/Validierung/Import
    backupReminder.ts      – Erinnerungsregel (rein)
    image.ts               – Foto verkleinern, Vorschaubild
    errors.ts              – Fehler → deutsche Meldung
    storage.ts             – persistenter Speicher, Speicherverbrauch, Standalone-Erkennung
    files.ts               – Teilen/Herunterladen, Datei als Text lesen
    route.ts               – Hash-Routing (parse, navigate, Hook)
    useObjectUrl.ts        – Blob → Object-URL mit Aufräumen
  components/
    TabBar.tsx, ChipGroup.tsx, FilterBar.tsx, ItemPhoto.tsx, ItemGrid.tsx,
    FilePicker.tsx, NotFound.tsx, OutfitPreview.tsx
  screens/
    WardrobeScreen.tsx, ItemFormScreen.tsx, ItemDetailScreen.tsx,
    OutfitsScreen.tsx, OutfitEditorScreen.tsx, OutfitDetailScreen.tsx, SettingsScreen.tsx
  test/
    setup.ts               – fake-indexeddb, jsdom-Anpassungen, DB-Reset
    factories.ts           – Test-Hilfen
```

---

### Task 1: Projektgerüst, Konstanten und Datenbankschema

**Files:**
- Create: `package.json`, `.gitignore`, `.gitattributes`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx` (vorläufig, wird in Task 8 ersetzt), `src/styles.css`
- Create: `src/lib/constants.ts`, `src/db/schema.ts`, `src/test/setup.ts`
- Test: `src/lib/constants.test.ts`, `src/db/schema.test.ts`

**Interfaces:**
- Consumes: –
- Produces:
  - `constants.ts`: `CATEGORIES`, `COLORS`, `SEASONS` (readonly Arrays von `{ id, label }`, Farben zusätzlich `swatch: string`); Typen `CategoryId`, `ColorId`, `SeasonId`; `labelOf(list, id): string`; `isCategoryId(v): v is CategoryId`, `isColorId`, `isSeasonId`.
  - `schema.ts`: Interfaces `Item { id; category: CategoryId; colors: ColorId[]; seasons: SeasonId[]; note: string; createdAt: string; updatedAt: string }`, `Photo { itemId: string; full: Blob; thumb: Blob }`, `Outfit { id; name: string; itemIds: string[]; createdAt: string; updatedAt: string }`, `MetaEntry { key: string; value: string }`; `db: WardrobeDB` mit Tabellen `items`, `photos`, `outfits`, `meta`.
  - Test-Setup leert vor jedem Test alle Tabellen.

- [ ] **Step 1: Projektdateien anlegen**

`package.json`:
```json
{
  "name": "kleiderschrank",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`.gitignore`:
```
node_modules/
dist/
*.log
.DS_Store
```

`.gitattributes`:
```
* text=auto eol=lf
*.png binary
*.ico binary
```

- [ ] **Step 2: Abhängigkeiten installieren**

Run:
```bash
npm install -E react@18.3.1 react-dom@18.3.1 dexie@4.0.10 dexie-react-hooks@1.1.7
npm install -E -D vite@5.4.11 @vitejs/plugin-react@4.3.4 typescript@5.6.3 @types/react@18.3.12 @types/react-dom@18.3.1 @types/node@22.10.2 vitest@2.1.9 jsdom@25.0.1 fake-indexeddb@6.0.0 @testing-library/react@16.1.0 @testing-library/dom@10.4.0 @testing-library/user-event@14.5.2 @testing-library/jest-dom@6.6.3
```
Expected: `package-lock.json` entsteht, keine `ERR!`-Zeilen.

- [ ] **Step 3: Konfiguration und Einstieg anlegen**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client", "node"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/kleiderschrank/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['src/**/*.test.tsx', 'jsdom']],
    setupFiles: ['src/test/setup.ts'],
  },
});
```

`index.html`:
```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Kleiderschrank" />
    <meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
    <title>Kleiderschrank</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (vorläufig; Task 8 ersetzt die Datei vollständig):
```tsx
export default function App() {
  return (
    <div className="app">
      <section className="screen-content">
        <h1>Kleiderschrank</h1>
      </section>
    </div>
  );
}
```

`src/styles.css` (vollständig – spätere Tasks verwenden diese Klassen):
```css
:root {
  color-scheme: light dark;
  --bg: #f2f2f7;
  --surface: #ffffff;
  --text: #1c1c1e;
  --muted: #6e6e73;
  --border: #d1d1d6;
  --accent: #b5476b;
  --accent-text: #ffffff;
  --chip-bg: #e5e5ea;
  --danger: #d70015;
  --success: #1e7d32;
  --radius: 12px;
  --tabbar-h: 56px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000;
    --surface: #1c1c1e;
    --text: #f2f2f7;
    --muted: #98989f;
    --border: #38383a;
    --accent: #e3799b;
    --accent-text: #000000;
    --chip-bg: #2c2c2e;
    --danger: #ff6961;
    --success: #5fd068;
  }
}

* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--text); -webkit-text-size-adjust: 100%; }
body { min-height: 100dvh; }
button, input, textarea { font: inherit; color: inherit; }

.app { min-height: 100dvh; padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 80px); }
.screen-content { padding: calc(env(safe-area-inset-top) + 12px) 16px 24px; max-width: 720px; margin: 0 auto; }
.screen-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; min-height: 44px; }
.screen-header h1 { font-size: 28px; margin: 0; flex: 1; }
h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); margin: 20px 0 8px; font-weight: 600; }
.muted { color: var(--muted); }
.empty { text-align: center; color: var(--muted); padding: 48px 16px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.empty p { margin: 0; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.button { min-height: 44px; padding: 10px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
.button--primary { background: var(--accent); color: var(--accent-text); border-color: transparent; font-weight: 600; width: 100%; }
.button--danger { color: var(--danger); }
.button:disabled { opacity: 0.45; cursor: default; }
.link-button { background: none; border: none; color: var(--accent); min-height: 44px; padding: 0 4px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
.link-button:disabled { opacity: 0.45; }
.actions { display: flex; gap: 12px; margin-top: 24px; }
.actions > * { flex: 1; }

.fab { position: fixed; right: 20px; bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 16px); width: 56px; height: 56px; border-radius: 50%; background: var(--accent); color: var(--accent-text); font-size: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); cursor: pointer; }

.tab-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; background: var(--surface); border-top: 1px solid var(--border); padding-bottom: env(safe-area-inset-bottom); }
.tab { flex: 1; height: var(--tabbar-h); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; color: var(--muted); text-decoration: none; }
.tab__icon { font-size: 22px; line-height: 1; }
.tab--active { color: var(--accent); }

.chip-group { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 6px; scrollbar-width: none; }
.form .chip-group { flex-wrap: wrap; overflow: visible; }
.chip { flex: none; min-height: 36px; padding: 6px 14px; border-radius: 18px; border: 1px solid transparent; background: var(--chip-bg); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.chip--on { background: var(--accent); color: var(--accent-text); }
.chip__swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(128, 128, 128, 0.5); }
.filter-bar { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.filter-bar .link-button { align-self: flex-start; min-height: 32px; }

.item-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.item-grid--large { grid-template-columns: repeat(2, 1fr); gap: 8px; }
.tile { position: relative; display: block; width: 100%; aspect-ratio: 1; padding: 0; border: none; border-radius: 8px; overflow: hidden; background: var(--chip-bg); cursor: pointer; }
.tile--selected { outline: 3px solid var(--accent); outline-offset: -3px; }
.tile__check { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%; background: var(--accent); color: var(--accent-text); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
.photo { display: block; width: 100%; height: 100%; object-fit: cover; background: var(--chip-bg); }
.photo--full { height: auto; max-height: 60vh; object-fit: contain; border-radius: var(--radius); }
.photo--empty { aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center; color: var(--muted); }
.photo--loading { aspect-ratio: 1; }

.form__photo { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; margin-top: 20px; }
.field span { font-size: 15px; color: var(--muted); }
.field input, .field textarea { padding: 12px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); font-size: 16px; }
.form .button--primary { margin-top: 24px; }
.error { color: var(--danger); }
.success { color: var(--success); }

.details { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 16px 0; }
.details dt { color: var(--muted); }
.details dd { margin: 0; white-space: pre-wrap; }
.link-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }

.outfit-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.outfit-card { width: 100%; text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; }
.outfit-card__name { font-weight: 600; font-size: 17px; }
.outfit-preview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.outfit-preview__cell { aspect-ratio: 1; border-radius: 6px; overflow: hidden; }
.outfit-preview__more { display: flex; align-items: center; justify-content: center; background: var(--chip-bg); color: var(--muted); font-weight: 600; }

.banner { width: 100%; text-align: left; background: color-mix(in srgb, var(--accent) 15%, var(--surface)); border: 1px solid var(--accent); border-radius: var(--radius); padding: 12px; margin-bottom: 12px; cursor: pointer; min-height: 44px; }
.section { background: var(--surface); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; }
.section h2 { margin: 0; }
.section p { margin: 0; }
.notice { font-size: 14px; color: var(--muted); }
```

- [ ] **Step 4: Test-Setup anlegen**

`src/test/setup.ts`:
```ts
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { beforeEach } from 'vitest';
import { db } from '../db/schema';

if (typeof window !== 'undefined') {
  // fake-indexeddb kann jsdom-Blobs nicht klonen (sie kommen leer zurück), Nodes Blob schon.
  globalThis.Blob = NodeBlob as unknown as typeof Blob;
  let counter = 0;
  URL.createObjectURL = () => `blob:test/${++counter}`;
  URL.revokeObjectURL = () => {};
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});
```

- [ ] **Step 5: Fehlschlagende Tests schreiben**

`src/lib/constants.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CATEGORIES, COLORS, SEASONS, isCategoryId, isColorId, isSeasonId, labelOf } from './constants';

describe('constants', () => {
  it('has the agreed options in order', () => {
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      'Oberteil', 'Hose', 'Rock', 'Kleid', 'Jacke/Mantel', 'Schuhe', 'Tasche', 'Accessoire', 'Sonstiges',
    ]);
    expect(COLORS.map((c) => c.label)).toEqual([
      'Schwarz', 'Weiß', 'Grau', 'Beige', 'Braun', 'Rot', 'Rosa', 'Orange', 'Gelb', 'Grün', 'Blau', 'Lila', 'Bunt/Muster', 'Metallic',
    ]);
    expect(SEASONS.map((s) => s.label)).toEqual(['Frühling', 'Sommer', 'Herbst', 'Winter']);
  });

  it('looks up labels and falls back to the id', () => {
    expect(labelOf(CATEGORIES, 'jacket')).toBe('Jacke/Mantel');
    expect(labelOf(COLORS, 'unknown')).toBe('unknown');
  });

  it('validates ids', () => {
    expect(isCategoryId('shoes')).toBe(true);
    expect(isCategoryId('hat')).toBe(false);
    expect(isColorId('blue')).toBe(true);
    expect(isColorId(42)).toBe(false);
    expect(isSeasonId('winter')).toBe(true);
    expect(isSeasonId('Winter')).toBe(false);
  });
});
```

`src/db/schema.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { db } from './schema';

describe('schema', () => {
  it('stores an item with its photo blobs', async () => {
    await db.items.put({
      id: 'a', category: 'top', colors: ['blue'], seasons: ['winter'], note: '',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await db.photos.put({
      itemId: 'a',
      full: new Blob(['full'], { type: 'image/jpeg' }),
      thumb: new Blob(['thumb'], { type: 'image/jpeg' }),
    });
    expect((await db.items.get('a'))?.category).toBe('top');
    expect(await (await db.photos.get('a'))!.full.text()).toBe('full');
  });

  it('starts every test with empty tables', async () => {
    expect(await db.items.count()).toBe(0);
    expect(await db.photos.count()).toBe(0);
  });

  it('finds outfits by contained item id', async () => {
    await db.outfits.put({
      id: 'o1', name: 'Test', itemIds: ['a', 'b'],
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(await db.outfits.where('itemIds').equals('b').count()).toBe(1);
  });
});
```

- [ ] **Step 6: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test`
Expected: FAIL – `Failed to resolve import "./constants"` bzw. `"../db/schema"`.

- [ ] **Step 7: Konstanten und Schema implementieren**

`src/lib/constants.ts`:
```ts
export const CATEGORIES = [
  { id: 'top', label: 'Oberteil' },
  { id: 'pants', label: 'Hose' },
  { id: 'skirt', label: 'Rock' },
  { id: 'dress', label: 'Kleid' },
  { id: 'jacket', label: 'Jacke/Mantel' },
  { id: 'shoes', label: 'Schuhe' },
  { id: 'bag', label: 'Tasche' },
  { id: 'accessory', label: 'Accessoire' },
  { id: 'other', label: 'Sonstiges' },
] as const;

export const COLORS = [
  { id: 'black', label: 'Schwarz', swatch: '#1c1c1e' },
  { id: 'white', label: 'Weiß', swatch: '#ffffff' },
  { id: 'grey', label: 'Grau', swatch: '#8e8e93' },
  { id: 'beige', label: 'Beige', swatch: '#e8d8bd' },
  { id: 'brown', label: 'Braun', swatch: '#8b5a2b' },
  { id: 'red', label: 'Rot', swatch: '#e0262f' },
  { id: 'pink', label: 'Rosa', swatch: '#f4a6c1' },
  { id: 'orange', label: 'Orange', swatch: '#f28c28' },
  { id: 'yellow', label: 'Gelb', swatch: '#f5d327' },
  { id: 'green', label: 'Grün', swatch: '#3a9d4f' },
  { id: 'blue', label: 'Blau', swatch: '#2f6fdb' },
  { id: 'purple', label: 'Lila', swatch: '#8a4fc9' },
  { id: 'pattern', label: 'Bunt/Muster', swatch: 'conic-gradient(#e0262f, #f5d327, #3a9d4f, #2f6fdb, #8a4fc9, #e0262f)' },
  { id: 'metallic', label: 'Metallic', swatch: 'linear-gradient(135deg, #d9d9d9, #8c8c8c, #f2f2f2)' },
] as const;

export const SEASONS = [
  { id: 'spring', label: 'Frühling' },
  { id: 'summer', label: 'Sommer' },
  { id: 'autumn', label: 'Herbst' },
  { id: 'winter', label: 'Winter' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type ColorId = (typeof COLORS)[number]['id'];
export type SeasonId = (typeof SEASONS)[number]['id'];

export function labelOf(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((option) => option.id === id)?.label ?? id;
}

export const isCategoryId = (value: unknown): value is CategoryId => CATEGORIES.some((c) => c.id === value);
export const isColorId = (value: unknown): value is ColorId => COLORS.some((c) => c.id === value);
export const isSeasonId = (value: unknown): value is SeasonId => SEASONS.some((s) => s.id === value);
```

`src/db/schema.ts`:
```ts
import Dexie, { type Table } from 'dexie';
import type { CategoryId, ColorId, SeasonId } from '../lib/constants';

export interface Item {
  id: string;
  category: CategoryId;
  colors: ColorId[];
  seasons: SeasonId[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  itemId: string;
  full: Blob;
  thumb: Blob;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MetaEntry {
  key: string;
  value: string;
}

export class WardrobeDB extends Dexie {
  items!: Table<Item, string>;
  photos!: Table<Photo, string>;
  outfits!: Table<Outfit, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super('kleiderschrank');
    this.version(1).stores({
      items: 'id, category, createdAt',
      photos: 'itemId',
      outfits: 'id, *itemIds, createdAt',
      meta: 'key',
    });
  }
}

export const db = new WardrobeDB();
```

- [ ] **Step 8: Tests und Build prüfen**

Run: `npm test`
Expected: PASS (2 Dateien, 6 Tests).

Run: `npm run build`
Expected: `tsc` ohne Fehler, Vite meldet `✓ built in …`, `dist/index.html` existiert.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite/React project with constants and Dexie schema"
```

---

### Task 2: Filterlogik und Beschriftungen

**Files:**
- Create: `src/lib/filters.ts`, `src/lib/describe.ts`, `src/test/factories.ts`
- Test: `src/lib/filters.test.ts`, `src/lib/describe.test.ts`

**Interfaces:**
- Consumes: `Item` (schema.ts), `CATEGORIES`, `COLORS`, `labelOf`, Typen aus constants.ts.
- Produces:
  - `filters.ts`: `interface FilterState { categories: CategoryId[]; colors: ColorId[]; seasons: SeasonId[] }`, `EMPTY_FILTER: FilterState`, `isFilterActive(f): boolean`, `matchesFilter(item, f): boolean`, `applyFilter(items: Item[], f): Item[]`, `toggleValue<T>(list: readonly T[], value: T): T[]`.
  - `describe.ts`: `describeItem(item: Pick<Item, 'category' | 'colors'>): string` (z. B. „Oberteil, Blau“ oder „Oberteil“), `plural(n: number, one: string, many: string): string` (z. B. „1 Teil“, „3 Teile“).
  - `test/factories.ts`: `makeItem(overrides?: Partial<Item>): Item`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/test/factories.ts`:
```ts
import type { Item } from '../db/schema';

let sequence = 0;

export function makeItem(overrides: Partial<Item> = {}): Item {
  sequence += 1;
  return {
    id: `item-${sequence}`,
    category: 'top',
    colors: [],
    seasons: [],
    note: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
```

`src/lib/filters.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { makeItem } from '../test/factories';
import { EMPTY_FILTER, applyFilter, isFilterActive, matchesFilter, toggleValue } from './filters';

const blueWinterTop = makeItem({ id: 'a', category: 'top', colors: ['blue'], seasons: ['winter'] });
const redSummerTop = makeItem({ id: 'b', category: 'top', colors: ['red', 'white'], seasons: ['summer'] });
const blackPants = makeItem({ id: 'c', category: 'pants', colors: ['black'], seasons: [] });
const all = [blueWinterTop, redSummerTop, blackPants];

describe('filters', () => {
  it('returns everything for the empty filter', () => {
    expect(applyFilter(all, EMPTY_FILTER)).toEqual(all);
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
  });

  it('combines values within one dimension with OR', () => {
    const result = applyFilter(all, { ...EMPTY_FILTER, colors: ['blue', 'black'] });
    expect(result.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('combines dimensions with AND', () => {
    const f = { categories: ['top' as const], colors: ['blue' as const], seasons: ['winter' as const] };
    expect(applyFilter(all, f).map((i) => i.id)).toEqual(['a']);
    expect(isFilterActive(f)).toBe(true);
  });

  it('matches multi-colour items if any colour is selected', () => {
    expect(matchesFilter(redSummerTop, { ...EMPTY_FILTER, colors: ['white'] })).toBe(true);
  });

  it('excludes items without seasons when a season is selected', () => {
    expect(matchesFilter(blackPants, { ...EMPTY_FILTER, seasons: ['winter'] })).toBe(false);
  });

  it('returns an empty list when nothing matches', () => {
    expect(applyFilter(all, { ...EMPTY_FILTER, categories: ['dress'] })).toEqual([]);
  });

  it('toggles values without mutating the input', () => {
    const list = ['a', 'b'];
    expect(toggleValue(list, 'c')).toEqual(['a', 'b', 'c']);
    expect(toggleValue(list, 'a')).toEqual(['b']);
    expect(list).toEqual(['a', 'b']);
  });
});
```

`src/lib/describe.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { describeItem, plural } from './describe';

describe('describeItem', () => {
  it('names category and colours', () => {
    expect(describeItem({ category: 'top', colors: ['blue', 'white'] })).toBe('Oberteil, Blau, Weiß');
  });

  it('names only the category when there are no colours', () => {
    expect(describeItem({ category: 'shoes', colors: [] })).toBe('Schuhe');
  });
});

describe('plural', () => {
  it('uses singular only for exactly one', () => {
    expect(plural(1, 'Teil', 'Teile')).toBe('1 Teil');
    expect(plural(0, 'Teil', 'Teile')).toBe('0 Teile');
    expect(plural(12, 'Outfit', 'Outfits')).toBe('12 Outfits');
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/lib/filters.test.ts src/lib/describe.test.ts`
Expected: FAIL – `Failed to resolve import "./filters"` bzw. `"./describe"`.

- [ ] **Step 3: Implementieren**

`src/lib/filters.ts`:
```ts
import type { Item } from '../db/schema';
import type { CategoryId, ColorId, SeasonId } from './constants';

export interface FilterState {
  categories: CategoryId[];
  colors: ColorId[];
  seasons: SeasonId[];
}

export const EMPTY_FILTER: FilterState = { categories: [], colors: [], seasons: [] };

export function isFilterActive(filter: FilterState): boolean {
  return filter.categories.length + filter.colors.length + filter.seasons.length > 0;
}

export function matchesFilter(item: Item, filter: FilterState): boolean {
  if (filter.categories.length > 0 && !filter.categories.includes(item.category)) return false;
  if (filter.colors.length > 0 && !item.colors.some((c) => filter.colors.includes(c))) return false;
  if (filter.seasons.length > 0 && !item.seasons.some((s) => filter.seasons.includes(s))) return false;
  return true;
}

export function applyFilter(items: Item[], filter: FilterState): Item[] {
  return items.filter((item) => matchesFilter(item, filter));
}

export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
```

`src/lib/describe.ts`:
```ts
import type { Item } from '../db/schema';
import { CATEGORIES, COLORS, labelOf } from './constants';

export function describeItem(item: Pick<Item, 'category' | 'colors'>): string {
  const category = labelOf(CATEGORIES, item.category);
  const colors = item.colors.map((c) => labelOf(COLORS, c));
  return colors.length > 0 ? `${category}, ${colors.join(', ')}` : category;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add filter logic and item descriptions"
```

---

### Task 3: Teile-Datenmodul (items, meta, IDs)

**Files:**
- Create: `src/lib/id.ts`, `src/db/meta.ts`, `src/db/items.ts`
- Modify: `src/test/factories.ts` (Helfer anhängen)
- Test: `src/lib/id.test.ts`, `src/db/meta.test.ts`, `src/db/items.test.ts`

**Interfaces:**
- Consumes: `db`, `Item`, `Photo` (schema.ts); `isCategoryId`, `isColorId`, `isSeasonId`, Typen (constants.ts).
- Produces:
  - `id.ts`: `newId(): string` (UUID v4; funktioniert auch ohne sicheren Kontext, z. B. beim Testen über `http://<PC-IP>` am iPhone).
  - `meta.ts`: `getMeta(key: string): Promise<string | undefined>`, `setMeta(key: string, value: string): Promise<void>`, Konstanten `META_LAST_BACKUP = 'lastBackupAt'`, `META_PERSIST = 'persistGranted'`.
  - `items.ts`: `interface ItemInput { category: CategoryId; colors: ColorId[]; seasons: SeasonId[]; note: string }`, `interface PhotoBlobs { full: Blob; thumb: Blob }`, `createItem(input, photo: PhotoBlobs): Promise<string>`, `updateItem(id, input, photo?: PhotoBlobs): Promise<void>`, `deleteItem(id): Promise<void>`, `getItem(id): Promise<Item | undefined>`, `getItemsByIds(ids: string[]): Promise<Item[]>`, `listItems(): Promise<Item[]>` (neueste zuerst), `countItems(): Promise<number>`, `getPhoto(itemId): Promise<Photo | undefined>`.
  - `factories.ts`: `fakePhoto(label?: string): PhotoBlobs` (Blobs mit Inhalt `${label}-full` / `${label}-thumb`), `seedItem(input?: Partial<ItemInput>): Promise<string>`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

An `src/test/factories.ts` anhängen:
```ts
import { createItem, type ItemInput, type PhotoBlobs } from '../db/items';

export function fakePhoto(label = 'photo'): PhotoBlobs {
  return {
    full: new Blob([`${label}-full`], { type: 'image/jpeg' }),
    thumb: new Blob([`${label}-thumb`], { type: 'image/jpeg' }),
  };
}

export function seedItem(input: Partial<ItemInput> = {}): Promise<string> {
  return createItem({ category: 'top', colors: [], seasons: [], note: '', ...input }, fakePhoto());
}
```
(Die `import`-Zeile gehört an den Dateianfang zu den übrigen Imports.)

`src/lib/id.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { newId } from './id';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newId', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns a v4 UUID', () => {
    expect(newId()).toMatch(UUID_V4);
  });

  it('falls back to getRandomValues when randomUUID is unavailable', () => {
    const real = globalThis.crypto;
    vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) });
    const a = newId();
    const b = newId();
    expect(a).toMatch(UUID_V4);
    expect(a).not.toBe(b);
  });
});
```

`src/db/meta.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { META_LAST_BACKUP, getMeta, setMeta } from './meta';

describe('meta', () => {
  it('returns undefined for unknown keys', async () => {
    expect(await getMeta(META_LAST_BACKUP)).toBeUndefined();
  });

  it('stores and overwrites values', async () => {
    await setMeta(META_LAST_BACKUP, '2026-10-01T00:00:00.000Z');
    await setMeta(META_LAST_BACKUP, '2026-10-02T00:00:00.000Z');
    expect(await getMeta(META_LAST_BACKUP)).toBe('2026-10-02T00:00:00.000Z');
  });
});
```

`src/db/items.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CategoryId, ColorId } from '../lib/constants';
import { fakePhoto } from '../test/factories';
import {
  countItems, createItem, deleteItem, getItem, getItemsByIds, getPhoto, listItems, updateItem,
  type ItemInput,
} from './items';
import { db } from './schema';

const input: ItemInput = { category: 'top', colors: ['blue'], seasons: ['winter'], note: '' };

afterEach(() => vi.useRealTimers());

describe('createItem', () => {
  it('stores the item and its photos together', async () => {
    const id = await createItem({ ...input, note: '  Lieblingspulli  ' }, fakePhoto('a'));
    const item = await getItem(id);
    expect(item).toMatchObject({ id, category: 'top', colors: ['blue'], seasons: ['winter'], note: 'Lieblingspulli' });
    expect(item!.createdAt).toBe(item!.updatedAt);
    expect(await (await getPhoto(id))!.full.text()).toBe('a-full');
    expect(await (await getPhoto(id))!.thumb.text()).toBe('a-thumb');
  });

  it('removes duplicate and unknown colours and seasons', async () => {
    const id = await createItem(
      { ...input, colors: ['blue', 'blue', 'neon' as ColorId], seasons: ['winter', 'winter'] },
      fakePhoto(),
    );
    expect(await getItem(id)).toMatchObject({ colors: ['blue'], seasons: ['winter'] });
  });

  it('rejects an unknown category and stores nothing', async () => {
    await expect(createItem({ ...input, category: 'hat' as CategoryId }, fakePhoto())).rejects.toThrow('Unbekannte Kategorie');
    expect(await countItems()).toBe(0);
    expect(await db.photos.count()).toBe(0);
  });
});

describe('updateItem', () => {
  it('updates fields, keeps createdAt and keeps the photo when none is given', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));
    const id = await createItem(input, fakePhoto('old'));
    vi.setSystemTime(new Date('2026-01-02T10:00:00.000Z'));
    await updateItem(id, { ...input, category: 'pants', note: 'neu' });
    expect(await getItem(id)).toMatchObject({
      category: 'pants', note: 'neu',
      createdAt: '2026-01-01T10:00:00.000Z', updatedAt: '2026-01-02T10:00:00.000Z',
    });
    expect(await (await getPhoto(id))!.full.text()).toBe('old-full');
  });

  it('replaces the photo when a new one is given', async () => {
    const id = await createItem(input, fakePhoto('old'));
    await updateItem(id, input, fakePhoto('new'));
    expect(await (await getPhoto(id))!.full.text()).toBe('new-full');
  });

  it('throws for an unknown id', async () => {
    await expect(updateItem('missing', input)).rejects.toThrow('Teil nicht gefunden');
  });
});

describe('deleteItem', () => {
  it('removes item, photo and references in outfits but keeps emptied outfits', async () => {
    const keep = await createItem(input, fakePhoto());
    const gone = await createItem(input, fakePhoto());
    const stamp = '2026-01-01T00:00:00.000Z';
    await db.outfits.bulkAdd([
      { id: 'o1', name: 'Mix', itemIds: [keep, gone], createdAt: stamp, updatedAt: stamp },
      { id: 'o2', name: 'Solo', itemIds: [gone], createdAt: stamp, updatedAt: stamp },
    ]);
    await deleteItem(gone);
    expect(await getItem(gone)).toBeUndefined();
    expect(await getPhoto(gone)).toBeUndefined();
    expect((await db.outfits.get('o1'))!.itemIds).toEqual([keep]);
    expect((await db.outfits.get('o2'))!.itemIds).toEqual([]);
  });
});

describe('queries', () => {
  it('lists newest items first and counts them', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const older = await createItem(input, fakePhoto());
    vi.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
    const newer = await createItem(input, fakePhoto());
    expect((await listItems()).map((i) => i.id)).toEqual([newer, older]);
    expect(await countItems()).toBe(2);
  });

  it('gets items by ids in the given order and skips missing ones', async () => {
    const a = await createItem(input, fakePhoto());
    const b = await createItem(input, fakePhoto());
    expect((await getItemsByIds([b, 'missing', a])).map((i) => i.id)).toEqual([b, a]);
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/lib/id.test.ts src/db`
Expected: FAIL – `Failed to resolve import "./id"`, `"./meta"`, `"./items"`.

- [ ] **Step 3: Implementieren**

`src/lib/id.ts`:
```ts
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // randomUUID fehlt außerhalb sicherer Kontexte (z. B. http://192.168.x.x beim Testen am iPhone).
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
```

`src/db/meta.ts`:
```ts
import { db } from './schema';

export const META_LAST_BACKUP = 'lastBackupAt';
export const META_PERSIST = 'persistGranted';

export async function getMeta(key: string): Promise<string | undefined> {
  return (await db.meta.get(key))?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value });
}
```

`src/db/items.ts`:
```ts
import {
  isCategoryId, isColorId, isSeasonId,
  type CategoryId, type ColorId, type SeasonId,
} from '../lib/constants';
import { newId } from '../lib/id';
import { db, type Item, type Photo } from './schema';

export interface ItemInput {
  category: CategoryId;
  colors: ColorId[];
  seasons: SeasonId[];
  note: string;
}

export interface PhotoBlobs {
  full: Blob;
  thumb: Blob;
}

function normalize(input: ItemInput): ItemInput {
  if (!isCategoryId(input.category)) throw new Error(`Unbekannte Kategorie: ${String(input.category)}`);
  return {
    category: input.category,
    colors: [...new Set(input.colors)].filter(isColorId),
    seasons: [...new Set(input.seasons)].filter(isSeasonId),
    note: input.note.trim(),
  };
}

export async function createItem(input: ItemInput, photo: PhotoBlobs): Promise<string> {
  const data = normalize(input);
  const id = newId();
  const now = new Date().toISOString();
  await db.transaction('rw', db.items, db.photos, async () => {
    await db.items.add({ id, ...data, createdAt: now, updatedAt: now });
    await db.photos.add({ itemId: id, full: photo.full, thumb: photo.thumb });
  });
  return id;
}

export async function updateItem(id: string, input: ItemInput, photo?: PhotoBlobs): Promise<void> {
  const data = normalize(input);
  await db.transaction('rw', db.items, db.photos, async () => {
    const existing = await db.items.get(id);
    if (!existing) throw new Error(`Teil nicht gefunden: ${id}`);
    await db.items.put({ ...existing, ...data, updatedAt: new Date().toISOString() });
    if (photo) await db.photos.put({ itemId: id, full: photo.full, thumb: photo.thumb });
  });
}

export async function deleteItem(id: string): Promise<void> {
  await db.transaction('rw', db.items, db.photos, db.outfits, async () => {
    await db.items.delete(id);
    await db.photos.delete(id);
    const affected = await db.outfits.where('itemIds').equals(id).toArray();
    const now = new Date().toISOString();
    for (const outfit of affected) {
      await db.outfits.put({ ...outfit, itemIds: outfit.itemIds.filter((x) => x !== id), updatedAt: now });
    }
  });
}

export function getItem(id: string): Promise<Item | undefined> {
  return db.items.get(id);
}

export async function getItemsByIds(ids: string[]): Promise<Item[]> {
  const found = await db.items.bulkGet(ids);
  return found.filter((item): item is Item => item !== undefined);
}

export function listItems(): Promise<Item[]> {
  return db.items.orderBy('createdAt').reverse().toArray();
}

export function countItems(): Promise<number> {
  return db.items.count();
}

export function getPhoto(itemId: string): Promise<Photo | undefined> {
  return db.photos.get(itemId);
}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add items and meta data modules"
```

---

### Task 4: Outfit-Datenmodul

**Files:**
- Create: `src/db/outfits.ts`
- Test: `src/db/outfits.test.ts`

**Interfaces:**
- Consumes: `db`, `Outfit` (schema.ts); `newId` (id.ts); in Tests `seedItem`, `deleteItem`.
- Produces: `class OutfitValidationError extends Error` (Meldungen: „Bitte gib dem Outfit einen Namen.“ / „Bitte wähle mindestens ein Teil aus.“), `createOutfit(name: string, itemIds: string[]): Promise<string>`, `updateOutfit(id: string, name: string, itemIds: string[]): Promise<void>`, `deleteOutfit(id: string): Promise<void>`, `getOutfit(id: string): Promise<Outfit | undefined>`, `listOutfits(): Promise<Outfit[]>` (neueste zuerst), `listOutfitsWithItem(itemId: string): Promise<Outfit[]>`, `countOutfits(): Promise<number>`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/db/outfits.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedItem } from '../test/factories';
import { deleteItem } from './items';
import {
  OutfitValidationError, countOutfits, createOutfit, deleteOutfit, getOutfit,
  listOutfits, listOutfitsWithItem, updateOutfit,
} from './outfits';

afterEach(() => vi.useRealTimers());

describe('createOutfit', () => {
  it('stores a trimmed name and de-duplicated item ids in selection order', async () => {
    const a = await seedItem();
    const b = await seedItem();
    const id = await createOutfit('  Büro  ', [b, a, b]);
    expect(await getOutfit(id)).toMatchObject({ name: 'Büro', itemIds: [b, a] });
  });

  it('rejects a name made only of spaces', async () => {
    const a = await seedItem();
    await expect(createOutfit('   ', [a])).rejects.toThrow(OutfitValidationError);
    await expect(createOutfit('   ', [a])).rejects.toThrow('Bitte gib dem Outfit einen Namen.');
    expect(await countOutfits()).toBe(0);
  });

  it('rejects an empty selection', async () => {
    await expect(createOutfit('Leer', [])).rejects.toThrow('Bitte wähle mindestens ein Teil aus.');
  });

  it('drops ids of items that do not exist and rejects if none remain', async () => {
    const a = await seedItem();
    const id = await createOutfit('Mix', [a, 'missing']);
    expect((await getOutfit(id))!.itemIds).toEqual([a]);
    await expect(createOutfit('Nur Geister', ['missing'])).rejects.toThrow(OutfitValidationError);
  });
});

describe('updateOutfit / deleteOutfit', () => {
  it('renames and changes items, keeping createdAt', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const a = await seedItem();
    const b = await seedItem();
    const id = await createOutfit('Alt', [a]);
    vi.setSystemTime(new Date('2026-01-05T00:00:00.000Z'));
    await updateOutfit(id, 'Neu', [a, b]);
    expect(await getOutfit(id)).toMatchObject({
      name: 'Neu', itemIds: [a, b],
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-05T00:00:00.000Z',
    });
  });

  it('validates on update and throws for unknown outfits', async () => {
    const a = await seedItem();
    const id = await createOutfit('Alt', [a]);
    await expect(updateOutfit(id, ' ', [a])).rejects.toThrow(OutfitValidationError);
    await expect(updateOutfit('missing', 'X', [a])).rejects.toThrow('Outfit nicht gefunden');
  });

  it('deletes an outfit but not its items', async () => {
    const a = await seedItem();
    const id = await createOutfit('Weg', [a]);
    await deleteOutfit(id);
    expect(await getOutfit(id)).toBeUndefined();
    expect(await listOutfitsWithItem(a)).toEqual([]);
  });
});

describe('queries', () => {
  it('lists newest first and finds outfits containing an item', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const a = await seedItem();
    const b = await seedItem();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const first = await createOutfit('Erstes', [a]);
    vi.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
    const second = await createOutfit('Zweites', [a, b]);
    expect((await listOutfits()).map((o) => o.id)).toEqual([second, first]);
    expect((await listOutfitsWithItem(b)).map((o) => o.id)).toEqual([second]);
  });

  it('keeps an outfit with no items left after its items are deleted', async () => {
    const a = await seedItem();
    const id = await createOutfit('Einzeln', [a]);
    await deleteItem(a);
    expect(await getOutfit(id)).toMatchObject({ name: 'Einzeln', itemIds: [] });
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/db/outfits.test.ts`
Expected: FAIL – `Failed to resolve import "./outfits"`.

- [ ] **Step 3: Implementieren**

`src/db/outfits.ts`:
```ts
import { newId } from '../lib/id';
import { db, type Outfit } from './schema';

export class OutfitValidationError extends Error {}

async function normalize(name: string, itemIds: string[]): Promise<{ name: string; itemIds: string[] }> {
  const trimmed = name.trim();
  if (!trimmed) throw new OutfitValidationError('Bitte gib dem Outfit einen Namen.');
  const unique = [...new Set(itemIds)];
  const existing = await db.items.bulkGet(unique);
  const ids = unique.filter((_, index) => existing[index] !== undefined);
  if (ids.length === 0) throw new OutfitValidationError('Bitte wähle mindestens ein Teil aus.');
  return { name: trimmed, itemIds: ids };
}

export async function createOutfit(name: string, itemIds: string[]): Promise<string> {
  const id = newId();
  await db.transaction('rw', db.items, db.outfits, async () => {
    const data = await normalize(name, itemIds);
    const now = new Date().toISOString();
    await db.outfits.add({ id, ...data, createdAt: now, updatedAt: now });
  });
  return id;
}

export async function updateOutfit(id: string, name: string, itemIds: string[]): Promise<void> {
  await db.transaction('rw', db.items, db.outfits, async () => {
    const existing = await db.outfits.get(id);
    if (!existing) throw new Error(`Outfit nicht gefunden: ${id}`);
    const data = await normalize(name, itemIds);
    await db.outfits.put({ ...existing, ...data, updatedAt: new Date().toISOString() });
  });
}

export async function deleteOutfit(id: string): Promise<void> {
  await db.outfits.delete(id);
}

export function getOutfit(id: string): Promise<Outfit | undefined> {
  return db.outfits.get(id);
}

export function listOutfits(): Promise<Outfit[]> {
  return db.outfits.orderBy('createdAt').reverse().toArray();
}

export function listOutfitsWithItem(itemId: string): Promise<Outfit[]> {
  return db.outfits.where('itemIds').equals(itemId).toArray();
}

export function countOutfits(): Promise<number> {
  return db.outfits.count();
}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add outfits data module with validation"
```

---

### Task 5: Backup (Export, Validierung, Import) und Erinnerungsregel

**Files:**
- Create: `src/lib/backup.ts`, `src/lib/backupReminder.ts`
- Test: `src/lib/backup.test.ts`, `src/lib/backupReminder.test.ts`

**Interfaces:**
- Consumes: `db`, `Item`, `Outfit` (schema.ts); `isCategoryId`, `isColorId`, `isSeasonId`; in Tests `createItem`, `createOutfit`, `fakePhoto`.
- Produces:
  - `backup.ts`: `class BackupError extends Error`, `BACKUP_APP = 'kleiderschrank'`, `BACKUP_VERSION = 1`, `blobToBase64(blob: Blob): Promise<string>`, `base64ToBlob(b64: string, type?: string): Blob`, `exportBackup(now?: Date): Promise<string>` (JSON-Text), `backupFileName(now?: Date): string`, `interface ParsedBackup { items: Item[]; outfits: Outfit[]; photos: { itemId: string; full: Blob }[] }`, `parseBackup(text: string): ParsedBackup`, `importBackup(text: string, makeThumb: (full: Blob) => Promise<Blob>): Promise<{ items: number; outfits: number }>`.
  - `backupReminder.ts`: `needsBackupReminder(lastBackupAt: string | undefined, itemCount: number, now?: Date): boolean`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/lib/backupReminder.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { needsBackupReminder } from './backupReminder';

const now = new Date('2026-10-10T12:00:00.000Z');

describe('needsBackupReminder', () => {
  it('reminds when the last backup is older than 30 days', () => {
    expect(needsBackupReminder('2026-09-09T11:00:00.000Z', 5, now)).toBe(true);
  });

  it('does not remind within 30 days', () => {
    expect(needsBackupReminder('2026-09-11T12:00:00.000Z', 50, now)).toBe(false);
  });

  it('reminds without any backup only from 10 items on', () => {
    expect(needsBackupReminder(undefined, 9, now)).toBe(false);
    expect(needsBackupReminder(undefined, 10, now)).toBe(true);
  });

  it('treats an unreadable date like no backup', () => {
    expect(needsBackupReminder('kaputt', 10, now)).toBe(true);
  });

  it('never reminds for an empty wardrobe', () => {
    expect(needsBackupReminder('2020-01-01T00:00:00.000Z', 0, now)).toBe(false);
  });
});
```

`src/lib/backup.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createItem } from '../db/items';
import { createOutfit } from '../db/outfits';
import { db, type Item } from '../db/schema';
import { fakePhoto } from '../test/factories';
import { BackupError, backupFileName, exportBackup, importBackup } from './backup';

const fakeThumb = async (full: Blob) => new Blob([`thumb-of-${await full.text()}`], { type: 'image/jpeg' });
const byId = (a: Item, b: Item) => a.id.localeCompare(b.id);

async function seedWardrobe() {
  const a = await createItem({ category: 'top', colors: ['blue'], seasons: ['winter'], note: 'Wolle' }, fakePhoto('a'));
  const b = await createItem({ category: 'pants', colors: ['black'], seasons: [], note: '' }, fakePhoto('b'));
  const outfit = await createOutfit('Büro', [a, b]);
  return { a, b, outfit };
}

async function clearAll() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

async function expectRejectedWithoutChanges(text: string) {
  const items = await db.items.count();
  const outfits = await db.outfits.count();
  await expect(importBackup(text, fakeThumb)).rejects.toBeInstanceOf(BackupError);
  expect(await db.items.count()).toBe(items);
  expect(await db.outfits.count()).toBe(outfits);
}

describe('export + import', () => {
  it('restores items, outfits and photos exactly', async () => {
    const { a, b } = await seedWardrobe();
    const itemsBefore = (await db.items.toArray()).sort(byId);
    const outfitsBefore = await db.outfits.toArray();
    const json = await exportBackup(new Date('2026-10-10T12:00:00.000Z'));
    await clearAll();

    expect(await importBackup(json, fakeThumb)).toEqual({ items: 2, outfits: 1 });
    expect((await db.items.toArray()).sort(byId)).toEqual(itemsBefore);
    expect(await db.outfits.toArray()).toEqual(outfitsBefore);
    expect(await (await db.photos.get(a))!.full.text()).toBe('a-full');
    expect(await (await db.photos.get(b))!.thumb.text()).toBe('thumb-of-b-full');
  });

  it('writes the agreed header', async () => {
    const parsed = JSON.parse(await exportBackup(new Date('2026-10-10T12:00:00.000Z')));
    expect(parsed).toMatchObject({ app: 'kleiderschrank', version: 1, exportedAt: '2026-10-10T12:00:00.000Z' });
  });

  it('round-trips an empty wardrobe', async () => {
    const json = await exportBackup();
    expect(await importBackup(json, fakeThumb)).toEqual({ items: 0, outfits: 0 });
  });

  it('replaces existing data instead of merging', async () => {
    await seedWardrobe();
    const json = await exportBackup();
    await createItem({ category: 'shoes', colors: [], seasons: [], note: '' }, fakePhoto('extra'));
    await importBackup(json, fakeThumb);
    expect(await db.items.count()).toBe(2);
  });

  it('removes outfit references to missing items and drops orphan photos', async () => {
    const { a } = await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    raw.outfits[0].itemIds = [a, 'missing', a];
    raw.photos.push({ itemId: 'nobody', full: raw.photos[0].full });
    await clearAll();
    await importBackup(JSON.stringify(raw), fakeThumb);
    expect((await db.outfits.toArray())[0].itemIds).toEqual([a]);
    expect(await db.photos.get('nobody')).toBeUndefined();
  });
});

describe('invalid backups', () => {
  it('rejects text that is not JSON', async () => {
    await seedWardrobe();
    await expectRejectedWithoutChanges('das ist kein backup');
  });

  it('rejects files of another app or version', async () => {
    await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, app: 'andere-app' }));
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, version: 2 }));
  });

  it('rejects unknown categories, missing photos and broken base64', async () => {
    await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, items: [{ ...raw.items[0], category: 'hut' }, raw.items[1]] }));
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, photos: raw.photos.slice(1) }));
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, photos: raw.photos.map((p: object) => ({ ...p, full: '###' })) }));
  });

  it('rejects duplicate item ids', async () => {
    await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, items: [raw.items[0], raw.items[0]] }));
  });

  it('keeps data when thumbnails cannot be created', async () => {
    await seedWardrobe();
    const json = await exportBackup();
    const failingThumb = async () => { throw new Error('canvas kaputt'); };
    await expect(importBackup(json, failingThumb)).rejects.toBeInstanceOf(BackupError);
    expect(await db.items.count()).toBe(2);
  });
});

describe('backupFileName', () => {
  it('uses the local date', () => {
    expect(backupFileName(new Date(2026, 9, 5, 23, 30))).toBe('kleiderschrank-backup-2026-10-05.json');
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/lib/backup.test.ts src/lib/backupReminder.test.ts`
Expected: FAIL – `Failed to resolve import "./backup"` bzw. `"./backupReminder"`.

- [ ] **Step 3: Implementieren**

`src/lib/backupReminder.ts`:
```ts
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_AGE_DAYS = 30;
const MIN_ITEMS_WITHOUT_BACKUP = 10;

export function needsBackupReminder(lastBackupAt: string | undefined, itemCount: number, now = new Date()): boolean {
  if (itemCount === 0) return false;
  const last = lastBackupAt ? Date.parse(lastBackupAt) : Number.NaN;
  if (Number.isNaN(last)) return itemCount >= MIN_ITEMS_WITHOUT_BACKUP;
  return now.getTime() - last > MAX_AGE_DAYS * DAY_MS;
}
```

`src/lib/backup.ts`:
```ts
import { db, type Item, type Outfit, type Photo } from '../db/schema';
import { isCategoryId, isColorId, isSeasonId } from './constants';

export const BACKUP_APP = 'kleiderschrank';
export const BACKUP_VERSION = 1;

export class BackupError extends Error {}

interface BackupFile {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  items: Item[];
  outfits: Outfit[];
  photos: { itemId: string; full: string }[];
}

export interface ParsedBackup {
  items: Item[];
  outfits: Outfit[];
  photos: { itemId: string; full: Blob }[];
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBlob(b64: string, type = 'image/jpeg'): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function exportBackup(now = new Date()): Promise<string> {
  const [items, outfits, photos] = await db.transaction('r', db.items, db.outfits, db.photos, () =>
    Promise.all([db.items.toArray(), db.outfits.toArray(), db.photos.toArray()]),
  );
  const encoded: BackupFile['photos'] = [];
  for (const photo of photos) {
    encoded.push({ itemId: photo.itemId, full: await blobToBase64(photo.full) });
  }
  const file: BackupFile = {
    app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), items, outfits, photos: encoded,
  };
  return JSON.stringify(file);
}

export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `kleiderschrank-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string';
const fail = (detail: string): never => { throw new BackupError(`Ungültige Sicherung: ${detail}`); };

function parseItem(raw: unknown): Item {
  if (!isRecord(raw)) return fail('Teil ist kein Objekt');
  const { id, category, colors, seasons, note, createdAt, updatedAt } = raw;
  if (!isText(id) || !id) return fail('Teil ohne ID');
  if (!isCategoryId(category)) return fail(`unbekannte Kategorie ${String(category)}`);
  if (!Array.isArray(colors) || !Array.isArray(seasons)) return fail('Farben/Saisons fehlen');
  if (!isText(note) || !isText(createdAt) || !isText(updatedAt)) return fail('Teil unvollständig');
  return {
    id, category, note, createdAt, updatedAt,
    colors: [...new Set(colors.filter(isColorId))],
    seasons: [...new Set(seasons.filter(isSeasonId))],
  };
}

function parseOutfit(raw: unknown, knownItems: Set<string>): Outfit {
  if (!isRecord(raw)) return fail('Outfit ist kein Objekt');
  const { id, name, itemIds, createdAt, updatedAt } = raw;
  if (!isText(id) || !id || !isText(name) || !isText(createdAt) || !isText(updatedAt) || !Array.isArray(itemIds)) {
    return fail('Outfit unvollständig');
  }
  const ids = [...new Set(itemIds.filter(isText))].filter((x) => knownItems.has(x));
  return { id, name, itemIds: ids, createdAt, updatedAt };
}

export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail('keine JSON-Datei');
  }
  if (!isRecord(raw) || raw.app !== BACKUP_APP) return fail('keine Kleiderschrank-Sicherung');
  if (raw.version !== BACKUP_VERSION) return fail(`unbekannte Version ${String(raw.version)}`);
  if (!Array.isArray(raw.items) || !Array.isArray(raw.outfits) || !Array.isArray(raw.photos)) {
    return fail('Listen fehlen');
  }

  const items = raw.items.map(parseItem);
  const itemIds = new Set(items.map((i) => i.id));
  if (itemIds.size !== items.length) return fail('doppelte Teil-IDs');

  const photos = new Map<string, Blob>();
  for (const p of raw.photos) {
    if (!isRecord(p) || !isText(p.itemId) || !isText(p.full)) return fail('Foto unvollständig');
    if (!itemIds.has(p.itemId)) continue;
    try {
      photos.set(p.itemId, base64ToBlob(p.full));
    } catch {
      return fail('Foto beschädigt');
    }
  }
  for (const id of itemIds) {
    if (!photos.has(id)) return fail('Teil ohne Foto');
  }

  const outfits = raw.outfits.map((o) => parseOutfit(o, itemIds));
  if (new Set(outfits.map((o) => o.id)).size !== outfits.length) return fail('doppelte Outfit-IDs');

  return { items, outfits, photos: [...photos].map(([itemId, full]) => ({ itemId, full })) };
}

export async function importBackup(
  text: string,
  makeThumb: (full: Blob) => Promise<Blob>,
): Promise<{ items: number; outfits: number }> {
  const parsed = parseBackup(text);
  const photos: Photo[] = [];
  // Nacheinander statt parallel, um den Speicher auf dem iPhone zu schonen.
  for (const photo of parsed.photos) {
    try {
      photos.push({ itemId: photo.itemId, full: photo.full, thumb: await makeThumb(photo.full) });
    } catch {
      throw new BackupError('Ungültige Sicherung: Foto konnte nicht gelesen werden');
    }
  }
  await db.transaction('rw', db.items, db.photos, db.outfits, async () => {
    await Promise.all([db.items.clear(), db.photos.clear(), db.outfits.clear()]);
    await db.items.bulkAdd(parsed.items);
    await db.photos.bulkAdd(photos);
    await db.outfits.bulkAdd(parsed.outfits);
  });
  return { items: parsed.items.length, outfits: parsed.outfits.length };
}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add backup export/import with validation and reminder rule"
```

---

### Task 6: Browser-Hilfen (Fotoverarbeitung, Fehlermeldungen, Speicher, Dateien)

**Files:**
- Create: `src/lib/image.ts`, `src/lib/errors.ts`, `src/lib/storage.ts`, `src/lib/files.ts`
- Test: `src/lib/image.test.ts`, `src/lib/errors.test.ts`

**Interfaces:**
- Consumes: `PhotoBlobs` (items.ts), `BackupError` (backup.ts), `OutfitValidationError` (outfits.ts), `setMeta`, `META_PERSIST` (meta.ts).
- Produces:
  - `image.ts`: `FULL_MAX = 1200`, `THUMB_SIZE = 300`, `class PhotoError extends Error`, `fitWithin(width, height, max): { width; height }`, `centerSquare(width, height): { sx; sy; size }`, `processPhoto(file: Blob): Promise<PhotoBlobs>`, `makeThumb(full: Blob): Promise<Blob>`.
  - `errors.ts`: `isQuotaError(e: unknown): boolean`, `userMessage(e: unknown): string`.
  - `storage.ts`: `requestPersistence(): Promise<boolean>`, `storageUsageMB(): Promise<number | undefined>`, `isStandalone(): boolean`.
  - `files.ts`: `type ShareResult = 'shared' | 'downloaded' | 'cancelled'`, `shareOrDownload(content: string, fileName: string): Promise<ShareResult>` (muss **direkt** im Klick-Handler aufgerufen werden, ohne vorheriges `await`, sonst blockiert Safari das Teilen), `readFileText(file: Blob): Promise<string>`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/lib/image.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { FULL_MAX, centerSquare, fitWithin } from './image';

describe('fitWithin', () => {
  it('scales a 48 MP iPhone photo down to 1200 px on the long edge', () => {
    expect(fitWithin(8064, 6048, FULL_MAX)).toEqual({ width: 1200, height: 900 });
  });

  it('scales portrait photos by their height', () => {
    expect(fitWithin(3024, 4032, FULL_MAX)).toEqual({ width: 900, height: 1200 });
  });

  it('never enlarges small images', () => {
    expect(fitWithin(640, 480, FULL_MAX)).toEqual({ width: 640, height: 480 });
  });

  it('keeps at least one pixel for extreme panoramas', () => {
    expect(fitWithin(20000, 10, FULL_MAX)).toEqual({ width: 1200, height: 1 });
  });
});

describe('centerSquare', () => {
  it('crops landscape images in the middle', () => {
    expect(centerSquare(4032, 3024)).toEqual({ sx: 504, sy: 0, size: 3024 });
  });

  it('crops portrait images in the middle', () => {
    expect(centerSquare(3024, 4032)).toEqual({ sx: 0, sy: 504, size: 3024 });
  });
});
```

`src/lib/errors.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { OutfitValidationError } from '../db/outfits';
import { BackupError } from './backup';
import { isQuotaError, userMessage } from './errors';
import { PhotoError } from './image';

const quota = Object.assign(new Error('full'), { name: 'QuotaExceededError' });

describe('errors', () => {
  it('detects quota errors directly and wrapped by Dexie', () => {
    expect(isQuotaError(quota)).toBe(true);
    expect(isQuotaError(Object.assign(new Error('wrapped'), { name: 'AbortError', inner: quota }))).toBe(true);
    expect(isQuotaError(new Error('other'))).toBe(false);
    expect(isQuotaError(null)).toBe(false);
  });

  it('turns errors into German messages', () => {
    expect(userMessage(quota)).toMatch(/Speicher auf dem iPhone ist voll/);
    expect(userMessage(new PhotoError('x'))).toBe('Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.');
    expect(userMessage(new BackupError('x'))).toBe('Das ist keine gültige Kleiderschrank-Sicherung.');
    expect(userMessage(new OutfitValidationError('Bitte gib dem Outfit einen Namen.'))).toBe('Bitte gib dem Outfit einen Namen.');
    expect(userMessage(new Error('boom'))).toBe('Etwas ist schiefgelaufen. Bitte versuche es noch einmal.');
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/lib/image.test.ts src/lib/errors.test.ts`
Expected: FAIL – `Failed to resolve import "./image"` bzw. `"./errors"`.

- [ ] **Step 3: Implementieren**

`src/lib/image.ts`:
```ts
import type { PhotoBlobs } from '../db/items';

export const FULL_MAX = 1200;
export const THUMB_SIZE = 300;
const JPEG_QUALITY = 0.85;

export class PhotoError extends Error {}

export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function centerSquare(width: number, height: number): { sx: number; sy: number; size: number } {
  const size = Math.min(width, height);
  return { sx: Math.floor((width - size) / 2), sy: Math.floor((height - size) / 2), size };
}

type Source = ImageBitmap | HTMLImageElement;

async function decode(blob: Blob): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Fallback unten
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new PhotoError('Foto konnte nicht gelesen werden');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sizeOf(source: Source): { width: number; height: number } {
  return source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };
}

function release(source: Source): void {
  if (!(source instanceof HTMLImageElement)) source.close();
}

function draw(
  source: Source, sx: number, sy: number, sw: number, sh: number, dw: number, dh: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new PhotoError('Canvas nicht verfügbar'));
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      // Canvas sofort freigeben: iOS begrenzt den gesamten Canvas-Speicher.
      canvas.width = 0;
      canvas.height = 0;
      if (blob) resolve(blob);
      else reject(new PhotoError('Foto konnte nicht verarbeitet werden'));
    }, 'image/jpeg', JPEG_QUALITY);
  });
}

function drawThumb(source: Source, width: number, height: number): Promise<Blob> {
  const { sx, sy, size } = centerSquare(width, height);
  return draw(source, sx, sy, size, size, THUMB_SIZE, THUMB_SIZE);
}

export async function processPhoto(file: Blob): Promise<PhotoBlobs> {
  const source = await decode(file);
  try {
    const { width, height } = sizeOf(source);
    if (!width || !height) throw new PhotoError('Foto hat keine Größe');
    const target = fitWithin(width, height, FULL_MAX);
    const full = await draw(source, 0, 0, width, height, target.width, target.height);
    const thumb = await drawThumb(source, width, height);
    return { full, thumb };
  } finally {
    release(source);
  }
}

export async function makeThumb(full: Blob): Promise<Blob> {
  const source = await decode(full);
  try {
    const { width, height } = sizeOf(source);
    return await drawThumb(source, width, height);
  } finally {
    release(source);
  }
}
```

`src/lib/errors.ts`:
```ts
import { OutfitValidationError } from '../db/outfits';
import { BackupError } from './backup';
import { PhotoError } from './image';

export function isQuotaError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (typeof current !== 'object') return false;
    if ((current as { name?: unknown }).name === 'QuotaExceededError') return true;
    current = (current as { inner?: unknown }).inner;
  }
  return false;
}

export function userMessage(error: unknown): string {
  if (isQuotaError(error)) {
    return 'Der Speicher auf dem iPhone ist voll. Mach ein Backup und lösche ein paar Teile, um Platz zu schaffen.';
  }
  if (error instanceof PhotoError) return 'Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.';
  if (error instanceof BackupError) return 'Das ist keine gültige Kleiderschrank-Sicherung.';
  if (error instanceof OutfitValidationError) return error.message;
  return 'Etwas ist schiefgelaufen. Bitte versuche es noch einmal.';
}
```

`src/lib/storage.ts`:
```ts
import { META_PERSIST, setMeta } from '../db/meta';

export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  const granted = (await navigator.storage.persisted()) || (await navigator.storage.persist());
  await setMeta(META_PERSIST, String(granted));
  return granted;
}

export async function storageUsageMB(): Promise<number | undefined> {
  if (!navigator.storage?.estimate) return undefined;
  const { usage } = await navigator.storage.estimate();
  return usage === undefined ? undefined : usage / (1024 * 1024);
}

export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true;
}
```

`src/lib/files.ts`:
```ts
export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

export async function shareOrDownload(content: string, fileName: string): Promise<ShareResult> {
  const file = new File([content], fileName, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Kleiderschrank-Backup' });
      return 'shared';
    } catch (error) {
      if ((error as Error).name === 'AbortError') return 'cancelled';
      // z. B. NotAllowedError → auf Download ausweichen
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}

export function readFileText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
```

- [ ] **Step 4: Tests und Typprüfung laufen lassen**

Run: `npm test`
Expected: PASS (alle Tests).

Run: `npx tsc --noEmit`
Expected: keine Ausgabe (keine Typfehler).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add photo processing, error messages, storage and file helpers"
```

---

### Task 7: Gemeinsame UI-Bausteine

**Files:**
- Create: `src/lib/useObjectUrl.ts`, `src/lib/route.ts`, `src/components/ChipGroup.tsx`, `src/components/FilterBar.tsx`, `src/components/ItemPhoto.tsx`, `src/components/ItemGrid.tsx`, `src/components/FilePicker.tsx`, `src/components/NotFound.tsx`
- Test: `src/components/components.test.tsx`

**Interfaces:**
- Consumes: `FilterState`, `EMPTY_FILTER`, `isFilterActive`, `toggleValue` (filters.ts); `CATEGORIES`, `COLORS`, `SEASONS`; `describeItem`; `getPhoto` (items.ts); `Item`.
- Produces:
  - `useObjectUrl(blob: Blob | undefined): string | undefined`
  - `<ChipGroup<T extends string> label: string; options: readonly { id: T; label: string; swatch?: string }[]; selected: readonly T[]; onToggle: (id: T) => void />` – `role="group"` mit `aria-label={label}`, Chips sind Buttons mit `aria-pressed`.
  - `<FilterBar value: FilterState; onChange: (f: FilterState) => void />` – drei ChipGroups („Kategorie“, „Farbe“, „Saison“) + Button „Filter zurücksetzen“, nur wenn aktiv.
  - `<ItemPhoto itemId: string; alt: string; variant?: 'thumb' | 'full' />`
  - `<ItemGrid items: Item[]; onItemClick: (item: Item) => void; selectedIds?: readonly string[]; size?: 'normal' | 'large' />` – Kachel-Buttons mit `aria-label={describeItem(item)}`, im Auswahlmodus mit `aria-pressed`.
  - `<FilePicker label: string; accept: string; onPick: (file: File) => void; className?: string; children: ReactNode />` – `<label>` mit verstecktem `<input type="file" aria-label={label}>`.
  - `<NotFound text: string; backTo: string />` (`backTo` ist ein Pfad wie `/` oder `/outfits`).
  - `route.ts`: `type Route`, `type TabId = 'wardrobe' | 'outfits' | 'settings'`, `parseRoute(hash: string): Route`, `tabOf(route): TabId`, `navigate(path: string, options?: { replace?: boolean }): void`, `useRoute(): Route` (Tests dazu in Task 8).

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/components/components.test.tsx`:
```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createItem } from '../db/items';
import { EMPTY_FILTER } from '../lib/filters';
import { fakePhoto, makeItem } from '../test/factories';
import { ChipGroup } from './ChipGroup';
import { FilePicker } from './FilePicker';
import { FilterBar } from './FilterBar';
import { ItemGrid } from './ItemGrid';
import { ItemPhoto } from './ItemPhoto';

describe('ChipGroup', () => {
  it('marks selected chips and reports taps', async () => {
    const onToggle = vi.fn();
    render(
      <ChipGroup
        label="Saison"
        options={[{ id: 'summer', label: 'Sommer' }, { id: 'winter', label: 'Winter' }]}
        selected={['winter']}
        onToggle={onToggle}
      />,
    );
    const group = screen.getByRole('group', { name: 'Saison' });
    expect(within(group).getByRole('button', { name: 'Winter' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'Sommer' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(within(group).getByRole('button', { name: 'Sommer' }));
    expect(onToggle).toHaveBeenCalledWith('summer');
  });
});

describe('FilterBar', () => {
  it('toggles values and offers a reset only when active', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<FilterBar value={EMPTY_FILTER} onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Filter zurücksetzen' })).not.toBeInTheDocument();

    await userEvent.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Hose' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTER, categories: ['pants'] });

    rerender(<FilterBar value={{ ...EMPTY_FILTER, categories: ['pants'] }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter zurücksetzen' }));
    expect(onChange).toHaveBeenLastCalledWith(EMPTY_FILTER);
  });
});

describe('ItemGrid', () => {
  it('labels tiles, shows selection and reports taps', async () => {
    const blueTop = makeItem({ category: 'top', colors: ['blue'] });
    const shoes = makeItem({ category: 'shoes' });
    const onItemClick = vi.fn();
    render(<ItemGrid items={[blueTop, shoes]} selectedIds={[shoes.id]} onItemClick={onItemClick} />);
    expect(screen.getByRole('button', { name: 'Schuhe' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Oberteil, Blau' }));
    expect(onItemClick).toHaveBeenCalledWith(blueTop);
  });
});

describe('ItemPhoto', () => {
  it('shows the stored thumbnail', async () => {
    const id = await createItem({ category: 'top', colors: [], seasons: [], note: '' }, fakePhoto());
    render(<ItemPhoto itemId={id} alt="Bluse" />);
    expect(await screen.findByRole('img', { name: 'Bluse' })).toHaveAttribute('src', expect.stringMatching(/^blob:test\//));
  });
});

describe('FilePicker', () => {
  it('passes the chosen file on', async () => {
    const onPick = vi.fn();
    render(<FilePicker label="Foto wählen" accept="image/*" onPick={onPick}>Foto wählen</FilePicker>);
    const file = new File(['x'], 'shirt.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText('Foto wählen'), file);
    expect(onPick).toHaveBeenCalledWith(file);
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/components`
Expected: FAIL – `Failed to resolve import "./ChipGroup"`.

- [ ] **Step 3: Implementieren**

`src/lib/useObjectUrl.ts`:
```ts
import { useEffect, useState } from 'react';

export function useObjectUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return undefined;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}
```

`src/components/ChipGroup.tsx`:
```tsx
interface ChipOption<T extends string> {
  id: T;
  label: string;
  swatch?: string;
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onToggle: (id: T) => void;
}

export function ChipGroup<T extends string>({ label, options, selected, onToggle }: ChipGroupProps<T>) {
  return (
    <div className="chip-group" role="group" aria-label={label}>
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            className={on ? 'chip chip--on' : 'chip'}
            aria-pressed={on}
            onClick={() => onToggle(option.id)}
          >
            {option.swatch && <span className="chip__swatch" style={{ background: option.swatch }} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
```

`src/components/FilterBar.tsx`:
```tsx
import { CATEGORIES, COLORS, SEASONS } from '../lib/constants';
import { EMPTY_FILTER, isFilterActive, toggleValue, type FilterState } from '../lib/filters';
import { ChipGroup } from './ChipGroup';

interface FilterBarProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <ChipGroup
        label="Kategorie"
        options={CATEGORIES}
        selected={value.categories}
        onToggle={(id) => onChange({ ...value, categories: toggleValue(value.categories, id) })}
      />
      <ChipGroup
        label="Farbe"
        options={COLORS}
        selected={value.colors}
        onToggle={(id) => onChange({ ...value, colors: toggleValue(value.colors, id) })}
      />
      <ChipGroup
        label="Saison"
        options={SEASONS}
        selected={value.seasons}
        onToggle={(id) => onChange({ ...value, seasons: toggleValue(value.seasons, id) })}
      />
      {isFilterActive(value) && (
        <button type="button" className="link-button" onClick={() => onChange(EMPTY_FILTER)}>
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
```

`src/components/ItemPhoto.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { getPhoto } from '../db/items';
import { useObjectUrl } from '../lib/useObjectUrl';

interface ItemPhotoProps {
  itemId: string;
  alt: string;
  variant?: 'thumb' | 'full';
}

export function ItemPhoto({ itemId, alt, variant = 'thumb' }: ItemPhotoProps) {
  const photo = useLiveQuery(() => getPhoto(itemId), [itemId]);
  const url = useObjectUrl(photo?.[variant]);
  if (!url) return <div className={`photo photo--${variant} photo--loading`} aria-hidden="true" />;
  return <img className={`photo photo--${variant}`} src={url} alt={alt} />;
}
```

`src/components/ItemGrid.tsx`:
```tsx
import type { Item } from '../db/schema';
import { describeItem } from '../lib/describe';
import { ItemPhoto } from './ItemPhoto';

interface ItemGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedIds?: readonly string[];
  size?: 'normal' | 'large';
}

export function ItemGrid({ items, onItemClick, selectedIds, size = 'normal' }: ItemGridProps) {
  return (
    <ul className={size === 'large' ? 'item-grid item-grid--large' : 'item-grid'}>
      {items.map((item) => {
        const selected = selectedIds?.includes(item.id) ?? false;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={selected ? 'tile tile--selected' : 'tile'}
              aria-label={describeItem(item)}
              aria-pressed={selectedIds ? selected : undefined}
              onClick={() => onItemClick(item)}
            >
              <ItemPhoto itemId={item.id} alt="" />
              {selected && <span className="tile__check" aria-hidden="true">✓</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

`src/components/FilePicker.tsx`:
```tsx
import type { ReactNode } from 'react';

interface FilePickerProps {
  label: string;
  accept: string;
  onPick: (file: File) => void;
  className?: string;
  children: ReactNode;
}

export function FilePicker({ label, accept, onPick, className, children }: FilePickerProps) {
  return (
    <label className={className}>
      {children}
      <input
        type="file"
        accept={accept}
        aria-label={label}
        className="visually-hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = ''; // dieselbe Datei kann erneut gewählt werden
          if (file) onPick(file);
        }}
      />
    </label>
  );
}
```

`src/components/NotFound.tsx`:
```tsx
import { navigate } from '../lib/route';

interface NotFoundProps {
  text: string;
  backTo: string;
}

export function NotFound({ text, backTo }: NotFoundProps) {
  return (
    <section className="screen-content">
      <div className="empty">
        <p>{text}</p>
        <button type="button" className="button" onClick={() => navigate(backTo, { replace: true })}>
          Zurück
        </button>
      </div>
    </section>
  );
}
```

`NotFound` braucht `navigate` aus `src/lib/route.ts`; lege die Datei schon jetzt vollständig an (Task 8 testet und nutzt sie):

`src/lib/route.ts`:
```ts
import { useEffect, useMemo, useState } from 'react';

export type Route =
  | { name: 'wardrobe' }
  | { name: 'itemNew' }
  | { name: 'item'; id: string }
  | { name: 'itemEdit'; id: string }
  | { name: 'outfits' }
  | { name: 'outfitNew' }
  | { name: 'outfit'; id: string }
  | { name: 'outfitEdit'; id: string }
  | { name: 'settings' };

export type TabId = 'wardrobe' | 'outfits' | 'settings';

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [section, id, action] = parts;
  if (section === 'item' && id === 'new' && !action) return { name: 'itemNew' };
  if (section === 'item' && id && !action) return { name: 'item', id };
  if (section === 'item' && id && action === 'edit' && parts.length === 3) return { name: 'itemEdit', id };
  if (section === 'outfits' && !id) return { name: 'outfits' };
  if (section === 'outfit' && id === 'new' && !action) return { name: 'outfitNew' };
  if (section === 'outfit' && id && !action) return { name: 'outfit', id };
  if (section === 'outfit' && id && action === 'edit' && parts.length === 3) return { name: 'outfitEdit', id };
  if (section === 'settings' && !id) return { name: 'settings' };
  return { name: 'wardrobe' };
}

export function tabOf(route: Route): TabId {
  switch (route.name) {
    case 'outfits':
    case 'outfitNew':
    case 'outfit':
    case 'outfitEdit':
      return 'outfits';
    case 'settings':
      return 'settings';
    default:
      return 'wardrobe';
  }
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  const hash = `#${path}`;
  if (options.replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return useMemo(() => parseRoute(hash), [hash]);
}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components and hash routing"
```

---

### Task 8: App-Gerüst, Schrank-Bildschirm und Teil erfassen

**Files:**
- Create: `src/components/TabBar.tsx`, `src/screens/WardrobeScreen.tsx`, `src/screens/ItemFormScreen.tsx`
- Modify: `src/App.tsx` (vollständig ersetzen)
- Test: `src/lib/route.test.ts`, `src/screens/WardrobeScreen.test.tsx`, `src/screens/ItemFormScreen.test.tsx`

**Interfaces:**
- Consumes: alles aus Tasks 1–7, insbesondere `useRoute`, `navigate`, `tabOf`, `listItems`, `getItem`, `createItem`, `updateItem`, `processPhoto`, `userMessage`, `FilterBar`, `ItemGrid`, `ItemPhoto`, `FilePicker`, `ChipGroup`, `NotFound`.
- Produces:
  - `<TabBar active: TabId />` – Links „Schrank“ (`#/`), „Outfits“ (`#/outfits`), „Einstellungen“ (`#/settings`).
  - `<WardrobeScreen filter: FilterState; onFilterChange: (f: FilterState) => void; onPickPhoto: (file: File) => void />` – Upload-Feld mit Label „Teil hinzufügen“.
  - `<ItemFormScreen itemId?: string; initialFile?: File | null />` – Überschrift „Neues Teil“ bzw. „Teil bearbeiten“; Button „Speichern“; Fehler in `role="alert"`.
  - `App` hält den Schrank-Filter (bleibt beim Wechsel zur Detailansicht erhalten) und den Foto-Entwurf.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/lib/route.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseRoute, tabOf } from './route';

describe('parseRoute', () => {
  it.each([
    ['', { name: 'wardrobe' }],
    ['#/', { name: 'wardrobe' }],
    ['#/item/new', { name: 'itemNew' }],
    ['#/item/abc', { name: 'item', id: 'abc' }],
    ['#/item/abc/edit', { name: 'itemEdit', id: 'abc' }],
    ['#/outfits', { name: 'outfits' }],
    ['#/outfit/new', { name: 'outfitNew' }],
    ['#/outfit/xyz', { name: 'outfit', id: 'xyz' }],
    ['#/outfit/xyz/edit', { name: 'outfitEdit', id: 'xyz' }],
    ['#/settings', { name: 'settings' }],
    ['#/irgendwas/ganz/anderes', { name: 'wardrobe' }],
    ['#/item/abc/edit/zuviel', { name: 'wardrobe' }],
  ])('parses %s', (hash, expected) => {
    expect(parseRoute(hash)).toEqual(expected);
  });

  it('maps routes to tabs', () => {
    expect(tabOf({ name: 'item', id: 'a' })).toBe('wardrobe');
    expect(tabOf({ name: 'outfitEdit', id: 'a' })).toBe('outfits');
    expect(tabOf({ name: 'settings' })).toBe('settings');
  });
});
```

`src/screens/WardrobeScreen.test.tsx`:
```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { seedItem } from '../test/factories';

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Schrank', () => {
  it('shows a friendly empty state', async () => {
    render(<App />);
    expect(await screen.findByText('Noch keine Teile – tippe auf +, um dein erstes Teil zu erfassen.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Schrank/ })).toHaveAttribute('aria-current', 'page');
  });

  it('filters items and resets the filter', async () => {
    await seedItem({ category: 'top', colors: ['blue'] });
    await seedItem({ category: 'pants', colors: ['black'] });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText('2 Teile')).toBeInTheDocument();

    const categories = screen.getByRole('group', { name: 'Kategorie' });
    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    expect(screen.queryByRole('button', { name: 'Oberteil, Blau' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();

    await user.click(within(categories).getByRole('button', { name: 'Kleid' }));
    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    expect(screen.getByText('Keine Teile passen zu diesen Filtern.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Alle Teile anzeigen' }));
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();
  });
});
```

`src/screens/ItemFormScreen.test.tsx`:
```tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { db } from '../db/schema';
import { PhotoError, processPhoto } from '../lib/image';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processPhoto: vi.fn(async () => ({
    full: new Blob(['full'], { type: 'image/jpeg' }),
    thumb: new Blob(['thumb'], { type: 'image/jpeg' }),
  })),
}));

const photoFile = () => new File(['x'], 'shirt.jpg', { type: 'image/jpeg' });

async function startNewItem(user: ReturnType<typeof userEvent.setup>) {
  render(<App />);
  await user.upload(await screen.findByLabelText('Teil hinzufügen'), photoFile());
  await screen.findByRole('heading', { name: 'Neues Teil' });
}

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Teil erfassen', () => {
  it('saves a new item with category and colour', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    const save = screen.getByRole('button', { name: 'Speichern' });
    expect(save).toBeDisabled();

    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));
    await user.click(within(screen.getByRole('group', { name: 'Farbe' })).getByRole('button', { name: 'Blau' }));
    await user.click(within(screen.getByRole('group', { name: 'Saison' })).getByRole('button', { name: 'Winter' }));
    await user.type(screen.getByLabelText('Notiz'), 'Von Oma');
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    expect(await screen.findByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
    const items = await db.items.toArray();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ category: 'top', colors: ['blue'], seasons: ['winter'], note: 'Von Oma' });
    expect(await (await db.photos.get(items[0].id))!.full.text()).toBe('full');
  });

  it('saves only once when Speichern is tapped twice', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));
    await user.click(within(screen.getByRole('group', { name: 'Farbe' })).getByRole('button', { name: 'Blau' }));
    const save = screen.getByRole('button', { name: 'Speichern' });
    await waitFor(() => expect(save).toBeEnabled());
    await user.dblClick(save);
    await screen.findByRole('button', { name: 'Oberteil, Blau' });
    expect(await db.items.count()).toBe(1);
  });

  it('explains when a photo cannot be read and lets the user pick another', async () => {
    vi.mocked(processPhoto).mockRejectedValueOnce(new PhotoError('kaputt'));
    const user = userEvent.setup();
    await startNewItem(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.');
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeDisabled();

    await user.upload(screen.getByLabelText('Foto wählen'), photoFile());
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('can be cancelled without saving', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(await screen.findByText(/Noch keine Teile/)).toBeInTheDocument();
    expect(await db.items.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/screens src/lib/route.test.ts`
Expected: Die `route`-Tests bestehen bereits (Datei aus Task 7). Die Bildschirm-Tests schlagen fehl, weil `App` nur „Kleiderschrank“ anzeigt (z. B. `Unable to find an element with the text: Noch keine Teile …`).

- [ ] **Step 3: Implementieren**

`src/components/TabBar.tsx`:
```tsx
import type { TabId } from '../lib/route';

const TABS: { id: TabId; label: string; icon: string; href: string }[] = [
  { id: 'wardrobe', label: 'Schrank', icon: '👗', href: '#/' },
  { id: 'outfits', label: 'Outfits', icon: '✨', href: '#/outfits' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️', href: '#/settings' },
];

export function TabBar({ active }: { active: TabId }) {
  return (
    <nav className="tab-bar" aria-label="Hauptnavigation">
      {TABS.map((tab) => (
        <a
          key={tab.id}
          href={tab.href}
          className={tab.id === active ? 'tab tab--active' : 'tab'}
          aria-current={tab.id === active ? 'page' : undefined}
        >
          <span className="tab__icon" aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
```

`src/screens/WardrobeScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { FilePicker } from '../components/FilePicker';
import { FilterBar } from '../components/FilterBar';
import { ItemGrid } from '../components/ItemGrid';
import { listItems } from '../db/items';
import { plural } from '../lib/describe';
import { EMPTY_FILTER, applyFilter, type FilterState } from '../lib/filters';
import { navigate } from '../lib/route';

interface WardrobeScreenProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onPickPhoto: (file: File) => void;
}

export function WardrobeScreen({ filter, onFilterChange, onPickPhoto }: WardrobeScreenProps) {
  const items = useLiveQuery(listItems, []);
  if (!items) return null;
  const visible = applyFilter(items, filter);

  return (
    <section className="screen-content">
      <header className="screen-header">
        <h1>Schrank</h1>
        <span className="muted">{plural(items.length, 'Teil', 'Teile')}</span>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <p>Noch keine Teile – tippe auf +, um dein erstes Teil zu erfassen.</p>
        </div>
      ) : (
        <>
          <FilterBar value={filter} onChange={onFilterChange} />
          {visible.length === 0 ? (
            <div className="empty">
              <p>Keine Teile passen zu diesen Filtern.</p>
              <button type="button" className="button" onClick={() => onFilterChange(EMPTY_FILTER)}>
                Alle Teile anzeigen
              </button>
            </div>
          ) : (
            <ItemGrid items={visible} onItemClick={(item) => navigate(`/item/${item.id}`)} />
          )}
        </>
      )}

      <FilePicker className="fab" label="Teil hinzufügen" accept="image/*" onPick={onPickPhoto}>
        <span aria-hidden="true">+</span>
      </FilePicker>
    </section>
  );
}
```

`src/screens/ItemFormScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChipGroup } from '../components/ChipGroup';
import { FilePicker } from '../components/FilePicker';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { createItem, getItem, updateItem, type PhotoBlobs } from '../db/items';
import {
  CATEGORIES, COLORS, SEASONS, type CategoryId, type ColorId, type SeasonId,
} from '../lib/constants';
import { userMessage } from '../lib/errors';
import { toggleValue } from '../lib/filters';
import { processPhoto } from '../lib/image';
import { navigate } from '../lib/route';
import { useObjectUrl } from '../lib/useObjectUrl';

interface ItemFormScreenProps {
  itemId?: string;
  initialFile?: File | null;
}

export function ItemFormScreen({ itemId, initialFile }: ItemFormScreenProps) {
  // undefined = lädt noch, null = neu bzw. nicht gefunden
  const existing = useLiveQuery(async () => (itemId ? (await getItem(itemId)) ?? null : null), [itemId]);
  const [photo, setPhoto] = useState<PhotoBlobs | null>(null);
  const [processing, setProcessing] = useState(false);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [colors, setColors] = useState<ColorId[]>([]);
  const [seasons, setSeasons] = useState<SeasonId[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!itemId);
  const savingRef = useRef(false);

  useEffect(() => {
    if (existing && !loaded) {
      setCategory(existing.category);
      setColors(existing.colors);
      setSeasons(existing.seasons);
      setNote(existing.note);
      setLoaded(true);
    }
  }, [existing, loaded]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setProcessing(true);
    try {
      setPhoto(await processPhoto(file));
    } catch (e) {
      setError(userMessage(e));
    } finally {
      setProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (initialFile) void handleFile(initialFile);
  }, [initialFile, handleFile]);

  const previewUrl = useObjectUrl(photo?.full);

  if (itemId && existing === undefined) return null;
  if (itemId && existing === null) return <NotFound text="Dieses Teil gibt es nicht mehr." backTo="/" />;

  const hasPhoto = photo !== null || Boolean(itemId);
  const canSave = hasPhoto && category !== null && !saving && !processing;
  const cancelTarget = itemId ? `/item/${itemId}` : '/';

  async function save() {
    if (!canSave || category === null || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    const input = { category, colors, seasons, note };
    try {
      if (itemId) {
        await updateItem(itemId, input, photo ?? undefined);
        navigate(`/item/${itemId}`, { replace: true });
      } else {
        await createItem(input, photo!);
        navigate('/', { replace: true });
      }
    } catch (e) {
      setError(userMessage(e));
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="screen-content form">
      <header className="screen-header">
        <button type="button" className="link-button" onClick={() => navigate(cancelTarget, { replace: true })}>
          Abbrechen
        </button>
        <h1>{itemId ? 'Teil bearbeiten' : 'Neues Teil'}</h1>
      </header>

      <div className="form__photo">
        {previewUrl ? (
          <img className="photo photo--full" src={previewUrl} alt="Vorschau" />
        ) : itemId ? (
          <ItemPhoto itemId={itemId} variant="full" alt="Aktuelles Foto" />
        ) : (
          <div className="photo photo--empty">{processing ? 'Foto wird verarbeitet …' : 'Noch kein Foto'}</div>
        )}
        <FilePicker className="button" label="Foto wählen" accept="image/*" onPick={handleFile}>
          {hasPhoto ? 'Foto ändern' : 'Foto wählen'}
        </FilePicker>
      </div>

      <h2>Kategorie</h2>
      <ChipGroup label="Kategorie" options={CATEGORIES} selected={category ? [category] : []} onToggle={setCategory} />
      <h2>Farbe</h2>
      <ChipGroup label="Farbe" options={COLORS} selected={colors} onToggle={(id) => setColors(toggleValue(colors, id))} />
      <h2>Saison</h2>
      <ChipGroup label="Saison" options={SEASONS} selected={seasons} onToggle={(id) => setSeasons(toggleValue(seasons, id))} />

      <label className="field">
        <span>Notiz</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="button" className="button button--primary" disabled={!canSave} onClick={save}>
        {saving ? 'Speichert …' : 'Speichern'}
      </button>
    </section>
  );
}
```

`src/App.tsx` (vollständig ersetzen):
```tsx
import { useState, type ReactElement } from 'react';
import { TabBar } from './components/TabBar';
import { EMPTY_FILTER, type FilterState } from './lib/filters';
import { navigate, tabOf, useRoute } from './lib/route';
import { ItemFormScreen } from './screens/ItemFormScreen';
import { WardrobeScreen } from './screens/WardrobeScreen';

export default function App() {
  const route = useRoute();
  const [draftPhoto, setDraftPhoto] = useState<File | null>(null);
  const [wardrobeFilter, setWardrobeFilter] = useState<FilterState>(EMPTY_FILTER);

  function startNewItem(file: File) {
    setDraftPhoto(file);
    navigate('/item/new');
  }

  let screen: ReactElement;
  switch (route.name) {
    case 'itemNew':
      screen = <ItemFormScreen key="new" initialFile={draftPhoto} />;
      break;
    case 'itemEdit':
      screen = <ItemFormScreen key={`edit-${route.id}`} itemId={route.id} />;
      break;
    default:
      screen = <WardrobeScreen filter={wardrobeFilter} onFilterChange={setWardrobeFilter} onPickPhoto={startNewItem} />;
  }

  return (
    <div className="app">
      {screen}
      <TabBar active={tabOf(route)} />
    </div>
  );
}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Manuell im Browser prüfen**

Run: `npm run dev`
Öffne `http://localhost:5173/kleiderschrank/`. Wähle über „+“ ein echtes Foto (z. B. ein großes JPEG). Prüfe: Vorschau erscheint, nach dem Speichern ist eine quadratische Kachel im Schrank zu sehen. Im Netzwerk/DevTools → Application → IndexedDB → `kleiderschrank` → `photos`: Der `full`-Blob ist deutlich kleiner als das Original. Server mit Strg+C beenden.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add app shell, wardrobe screen and item capture form"
```

---

### Task 9: Detailansicht eines Teils (Bearbeiten, Löschen)

**Files:**
- Create: `src/screens/ItemDetailScreen.tsx`
- Modify: `src/App.tsx` (Route `item` ergänzen)
- Test: `src/screens/ItemDetailScreen.test.tsx`

**Interfaces:**
- Consumes: `getItem`, `deleteItem` (items.ts); `listOutfitsWithItem`, `createOutfit` (outfits.ts); `describeItem`, `plural`; `ItemPhoto`, `NotFound`; `navigate`; `userMessage`.
- Produces: `<ItemDetailScreen itemId: string />` – Überschrift = Kategorie-Label; Aktionen „Bearbeiten“ (`#/item/<id>/edit`) und „Löschen“ (mit `window.confirm`); Liste „In diesen Outfits“.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/screens/ItemDetailScreen.test.tsx`:
```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { seedItem } from '../test/factories';

afterEach(() => vi.restoreAllMocks());

function open(path: string) {
  window.location.hash = `#${path}`;
  render(<App />);
}

describe('Teil-Details', () => {
  it('shows all details and the outfits containing the item', async () => {
    const id = await seedItem({ category: 'top', colors: ['blue', 'white'], seasons: ['summer'], note: 'Leinen' });
    await createOutfit('Strand', [id]);
    open(`/item/${id}`);
    expect(await screen.findByRole('heading', { name: 'Oberteil' })).toBeInTheDocument();
    expect(screen.getByText('Blau, Weiß')).toBeInTheDocument();
    expect(screen.getByText('Sommer')).toBeInTheDocument();
    expect(screen.getByText('Leinen')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Strand' })).toBeInTheDocument();
  });

  it('edits an item and keeps its photo', async () => {
    const id = await seedItem({ category: 'top', colors: ['blue'] });
    const user = userEvent.setup();
    open(`/item/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
    await screen.findByRole('heading', { name: 'Teil bearbeiten' });
    const categories = screen.getByRole('group', { name: 'Kategorie' });
    expect(within(categories).getByRole('button', { name: 'Oberteil' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByRole('heading', { name: 'Hose' })).toBeInTheDocument();
    expect(await (await db.photos.get(id))!.full.text()).toBe('photo-full');
  });

  it('deletes after confirmation and removes the item from outfits', async () => {
    const id = await seedItem();
    const outfitId = await createOutfit('Büro', [id]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    open(`/item/${id}`);
    await screen.findByRole('button', { name: 'Büro' });
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    expect(confirm).toHaveBeenCalledWith('Dieses Teil wirklich löschen? Es wird auch aus 1 Outfit entfernt.');
    expect(await screen.findByText(/Noch keine Teile/)).toBeInTheDocument();
    expect(await db.items.count()).toBe(0);
    expect((await db.outfits.get(outfitId))!.itemIds).toEqual([]);
  });

  it('keeps the item when deletion is not confirmed', async () => {
    const id = await seedItem();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    open(`/item/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Löschen' }));
    expect(await db.items.count()).toBe(1);
    expect(screen.getByRole('heading', { name: 'Oberteil' })).toBeInTheDocument();
  });

  it('shows a hint for an item that no longer exists', async () => {
    open('/item/gibt-es-nicht');
    expect(await screen.findByText('Dieses Teil gibt es nicht mehr.')).toBeInTheDocument();
  });

  it('shows a hint when editing an item that no longer exists', async () => {
    open('/item/gibt-es-nicht/edit');
    expect(await screen.findByText('Dieses Teil gibt es nicht mehr.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/screens/ItemDetailScreen.test.tsx`
Expected: FAIL – u. a. `Unable to find role="heading" and name "Oberteil"` (die Route `item` zeigt noch den Schrank).

- [ ] **Step 3: Implementieren**

`src/screens/ItemDetailScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { deleteItem, getItem } from '../db/items';
import { listOutfitsWithItem } from '../db/outfits';
import { CATEGORIES, COLORS, SEASONS, labelOf } from '../lib/constants';
import { describeItem, plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { navigate } from '../lib/route';

export function ItemDetailScreen({ itemId }: { itemId: string }) {
  const item = useLiveQuery(async () => (await getItem(itemId)) ?? null, [itemId]);
  const outfits = useLiveQuery(() => listOutfitsWithItem(itemId), [itemId]);
  const [error, setError] = useState<string | null>(null);

  if (item === undefined) return null;
  if (item === null) return <NotFound text="Dieses Teil gibt es nicht mehr." backTo="/" />;

  async function remove() {
    const count = outfits?.length ?? 0;
    const message = count > 0
      ? `Dieses Teil wirklich löschen? Es wird auch aus ${plural(count, 'Outfit', 'Outfits')} entfernt.`
      : 'Dieses Teil wirklich löschen?';
    if (!window.confirm(message)) return;
    try {
      await deleteItem(itemId);
      navigate('/', { replace: true });
    } catch (e) {
      setError(userMessage(e));
    }
  }

  const colorText = item.colors.map((c) => labelOf(COLORS, c)).join(', ') || '–';
  const seasonText = item.seasons.map((s) => labelOf(SEASONS, s)).join(', ') || '–';

  return (
    <section className="screen-content">
      <header className="screen-header">
        <a className="link-button" href="#/">‹ Schrank</a>
      </header>
      <ItemPhoto itemId={itemId} variant="full" alt={describeItem(item)} />
      <h1>{labelOf(CATEGORIES, item.category)}</h1>
      <dl className="details">
        <dt>Farben</dt>
        <dd>{colorText}</dd>
        <dt>Saison</dt>
        <dd>{seasonText}</dd>
        {item.note && (
          <>
            <dt>Notiz</dt>
            <dd>{item.note}</dd>
          </>
        )}
      </dl>

      {outfits && outfits.length > 0 && (
        <>
          <h2>In diesen Outfits</h2>
          <ul className="link-list">
            {outfits.map((outfit) => (
              <li key={outfit.id}>
                <button type="button" className="link-button" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                  {outfit.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      <div className="actions">
        <button type="button" className="button" onClick={() => navigate(`/item/${itemId}/edit`)}>
          Bearbeiten
        </button>
        <button type="button" className="button button--danger" onClick={remove}>
          Löschen
        </button>
      </div>
    </section>
  );
}
```

In `src/App.tsx` den Import ergänzen und im `switch` vor `case 'itemNew':` einfügen:
```tsx
import { ItemDetailScreen } from './screens/ItemDetailScreen';
```
```tsx
    case 'item':
      screen = <ItemDetailScreen key={route.id} itemId={route.id} />;
      break;
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add item detail screen with edit and delete"
```

---

### Task 10: Outfits (Liste, Editor, Detailansicht)

**Files:**
- Create: `src/components/OutfitPreview.tsx`, `src/screens/OutfitsScreen.tsx`, `src/screens/OutfitEditorScreen.tsx`, `src/screens/OutfitDetailScreen.tsx`
- Modify: `src/App.tsx` (Routen `outfits`, `outfitNew`, `outfit`, `outfitEdit`)
- Test: `src/screens/Outfits.test.tsx`

**Interfaces:**
- Consumes: `listOutfits`, `getOutfit`, `createOutfit`, `updateOutfit`, `deleteOutfit`, `OutfitValidationError` (outfits.ts); `listItems`, `getItemsByIds`, `deleteItem` (items.ts); `FilterBar`, `ItemGrid`, `ItemPhoto`, `NotFound`; `applyFilter`, `EMPTY_FILTER`, `toggleValue`; `plural`; `userMessage`; `navigate`.
- Produces:
  - `<OutfitPreview itemIds: string[] />` – bis zu 4 Vorschaubilder, danach „+n“, bei 0 Teilen der Text „Keine Teile mehr“.
  - `<OutfitsScreen />`, `<OutfitEditorScreen outfitId?: string />` (Schritt 1: Auswahl mit Zähler „n ausgewählt“ und Button „Weiter“; Schritt 2: Feld „Name des Outfits“, „Speichern“), `<OutfitDetailScreen outfitId: string />`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/screens/Outfits.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { deleteItem } from '../db/items';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { seedItem } from '../test/factories';

afterEach(() => vi.restoreAllMocks());

function open(path: string) {
  window.location.hash = `#${path}`;
  render(<App />);
}

describe('Outfits', () => {
  it('shows an empty state with a way to start', async () => {
    open('/outfits');
    expect(await screen.findByText(/Noch keine Outfits/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Neues Outfit' }).length).toBeGreaterThan(0);
  });

  it('creates an outfit from selected items', async () => {
    const top = await seedItem({ category: 'top', colors: ['blue'] });
    const pants = await seedItem({ category: 'pants', colors: ['black'] });
    await seedItem({ category: 'shoes', colors: ['white'] });
    const user = userEvent.setup();
    open('/outfit/new');

    const next = await screen.findByRole('button', { name: 'Weiter' });
    expect(next).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Oberteil, Blau' }));
    await user.click(screen.getByRole('button', { name: 'Hose, Schwarz' }));
    expect(screen.getByText('2 ausgewählt')).toBeInTheDocument();
    await user.click(next);

    const save = screen.getByRole('button', { name: 'Speichern' });
    const name = screen.getByLabelText('Name des Outfits');
    expect(save).toBeDisabled();
    await user.type(name, '   ');
    expect(save).toBeDisabled();
    await user.clear(name);
    await user.type(name, 'Büro-Look');
    await user.click(save);

    expect(await screen.findByRole('heading', { name: 'Büro-Look' })).toBeInTheDocument();
    const outfits = await db.outfits.toArray();
    expect(outfits).toHaveLength(1);
    expect(outfits[0]).toMatchObject({ name: 'Büro-Look', itemIds: [top, pants] });
  });

  it('lists outfits and marks those without items', async () => {
    const a = await seedItem();
    await createOutfit('Sommer', [a]);
    const b = await seedItem();
    await createOutfit('Weg', [b]);
    await deleteItem(b);
    open('/outfits');
    expect(await screen.findByText('Sommer')).toBeInTheDocument();
    expect(screen.getByText('Weg')).toBeInTheDocument();
    expect(screen.getByText('Keine Teile mehr')).toBeInTheDocument();
  });

  it('renames an outfit', async () => {
    const a = await seedItem();
    const id = await createOutfit('Alt', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
    expect(await screen.findByText('1 ausgewählt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    const name = screen.getByLabelText('Name des Outfits');
    expect(name).toHaveValue('Alt');
    await user.clear(name);
    await user.type(name, 'Neu');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByRole('heading', { name: 'Neu' })).toBeInTheDocument();
  });

  it('deletes an outfit after confirmation but keeps its items', async () => {
    const a = await seedItem();
    const id = await createOutfit('Weg damit', [a]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Löschen' }));
    expect(await screen.findByText(/Noch keine Outfits/)).toBeInTheDocument();
    expect(await db.outfits.count()).toBe(0);
    expect(await db.items.count()).toBe(1);
  });

  it('shows a hint for an outfit that no longer exists', async () => {
    open('/outfit/gibt-es-nicht');
    expect(await screen.findByText('Dieses Outfit gibt es nicht mehr.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/screens/Outfits.test.tsx`
Expected: FAIL – u. a. `Unable to find an element with the text: /Noch keine Outfits/`.

- [ ] **Step 3: Implementieren**

`src/components/OutfitPreview.tsx`:
```tsx
import { ItemPhoto } from './ItemPhoto';

const MAX_CELLS = 4;

export function OutfitPreview({ itemIds }: { itemIds: string[] }) {
  if (itemIds.length === 0) return <span className="muted">Keine Teile mehr</span>;
  const overflow = itemIds.length > MAX_CELLS;
  const shown = overflow ? itemIds.slice(0, MAX_CELLS - 1) : itemIds;
  return (
    <div className="outfit-preview" aria-hidden="true">
      {shown.map((id) => (
        <div key={id} className="outfit-preview__cell">
          <ItemPhoto itemId={id} alt="" />
        </div>
      ))}
      {overflow && (
        <div className="outfit-preview__cell outfit-preview__more">+{itemIds.length - shown.length}</div>
      )}
    </div>
  );
}
```

`src/screens/OutfitsScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { OutfitPreview } from '../components/OutfitPreview';
import { listOutfits } from '../db/outfits';
import { navigate } from '../lib/route';

export function OutfitsScreen() {
  const outfits = useLiveQuery(listOutfits, []);
  if (!outfits) return null;

  return (
    <section className="screen-content">
      <header className="screen-header">
        <h1>Outfits</h1>
        {outfits.length > 0 && (
          <button type="button" className="link-button" onClick={() => navigate('/outfit/new')}>
            Neues Outfit
          </button>
        )}
      </header>

      {outfits.length === 0 ? (
        <div className="empty">
          <p>Noch keine Outfits. Stell dein erstes aus deinen Teilen zusammen.</p>
          <button type="button" className="button" onClick={() => navigate('/outfit/new')}>
            Neues Outfit
          </button>
        </div>
      ) : (
        <ul className="outfit-list">
          {outfits.map((outfit) => (
            <li key={outfit.id}>
              <button type="button" className="outfit-card" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                <span className="outfit-card__name">{outfit.name}</span>
                <OutfitPreview itemIds={outfit.itemIds} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

`src/screens/OutfitEditorScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { FilterBar } from '../components/FilterBar';
import { ItemGrid } from '../components/ItemGrid';
import { NotFound } from '../components/NotFound';
import { OutfitPreview } from '../components/OutfitPreview';
import { listItems } from '../db/items';
import { createOutfit, getOutfit, updateOutfit } from '../db/outfits';
import { userMessage } from '../lib/errors';
import { EMPTY_FILTER, applyFilter, toggleValue, type FilterState } from '../lib/filters';
import { navigate } from '../lib/route';

export function OutfitEditorScreen({ outfitId }: { outfitId?: string }) {
  const existing = useLiveQuery(async () => (outfitId ? (await getOutfit(outfitId)) ?? null : null), [outfitId]);
  const items = useLiveQuery(listItems, []);
  const [step, setStep] = useState<'pick' | 'name'>('pick');
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [loaded, setLoaded] = useState(!outfitId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (existing && !loaded) {
      setSelected(existing.itemIds);
      setName(existing.name);
      setLoaded(true);
    }
  }, [existing, loaded]);

  if (items === undefined || (outfitId && existing === undefined)) return null;
  if (outfitId && existing === null) return <NotFound text="Dieses Outfit gibt es nicht mehr." backTo="/outfits" />;

  const cancelTarget = outfitId ? `/outfit/${outfitId}` : '/outfits';
  const canSave = name.trim().length > 0 && selected.length > 0 && !saving;

  async function save() {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      if (outfitId) {
        await updateOutfit(outfitId, name, selected);
        navigate(`/outfit/${outfitId}`, { replace: true });
      } else {
        const id = await createOutfit(name, selected);
        navigate(`/outfit/${id}`, { replace: true });
      }
    } catch (e) {
      setError(userMessage(e));
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (step === 'name') {
    return (
      <section className="screen-content form">
        <header className="screen-header">
          <button type="button" className="link-button" onClick={() => setStep('pick')}>‹ Zurück</button>
          <h1>{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
        </header>
        <OutfitPreview itemIds={selected} />
        <label className="field">
          <span>Name des Outfits</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="button" className="button button--primary" disabled={!canSave} onClick={save}>
          {saving ? 'Speichert …' : 'Speichern'}
        </button>
      </section>
    );
  }

  const visible = applyFilter(items, filter);
  return (
    <section className="screen-content">
      <header className="screen-header">
        <button type="button" className="link-button" onClick={() => navigate(cancelTarget, { replace: true })}>
          Abbrechen
        </button>
        <h1>{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
        <button type="button" className="link-button" disabled={selected.length === 0} onClick={() => setStep('name')}>
          Weiter
        </button>
      </header>
      <p className="muted">{selected.length} ausgewählt</p>
      {items.length === 0 ? (
        <div className="empty"><p>Du hast noch keine Teile im Schrank.</p></div>
      ) : (
        <>
          <FilterBar value={filter} onChange={setFilter} />
          <ItemGrid
            items={visible}
            selectedIds={selected}
            onItemClick={(item) => setSelected(toggleValue(selected, item.id))}
          />
        </>
      )}
    </section>
  );
}
```

`src/screens/OutfitDetailScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ItemGrid } from '../components/ItemGrid';
import { NotFound } from '../components/NotFound';
import { getItemsByIds } from '../db/items';
import { deleteOutfit, getOutfit } from '../db/outfits';
import { userMessage } from '../lib/errors';
import { navigate } from '../lib/route';

export function OutfitDetailScreen({ outfitId }: { outfitId: string }) {
  const outfit = useLiveQuery(async () => (await getOutfit(outfitId)) ?? null, [outfitId]);
  const items = useLiveQuery(async () => (outfit ? getItemsByIds(outfit.itemIds) : []), [outfit]);
  const [error, setError] = useState<string | null>(null);

  if (outfit === undefined || items === undefined) return null;
  if (outfit === null) return <NotFound text="Dieses Outfit gibt es nicht mehr." backTo="/outfits" />;

  async function remove() {
    if (!outfit || !window.confirm(`Outfit „${outfit.name}“ wirklich löschen? Die Teile bleiben erhalten.`)) return;
    try {
      await deleteOutfit(outfitId);
      navigate('/outfits', { replace: true });
    } catch (e) {
      setError(userMessage(e));
    }
  }

  return (
    <section className="screen-content">
      <header className="screen-header">
        <a className="link-button" href="#/outfits">‹ Outfits</a>
      </header>
      <h1>{outfit.name}</h1>
      {items.length === 0 ? (
        <p className="muted">Keine Teile mehr – alle Teile dieses Outfits wurden gelöscht.</p>
      ) : (
        <ItemGrid items={items} size="large" onItemClick={(item) => navigate(`/item/${item.id}`)} />
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="button" onClick={() => navigate(`/outfit/${outfitId}/edit`)}>
          Bearbeiten
        </button>
        <button type="button" className="button button--danger" onClick={remove}>
          Löschen
        </button>
      </div>
    </section>
  );
}
```

In `src/App.tsx` Imports ergänzen und im `switch` vor `default:` einfügen:
```tsx
import { OutfitDetailScreen } from './screens/OutfitDetailScreen';
import { OutfitEditorScreen } from './screens/OutfitEditorScreen';
import { OutfitsScreen } from './screens/OutfitsScreen';
```
```tsx
    case 'outfits':
      screen = <OutfitsScreen />;
      break;
    case 'outfitNew':
      screen = <OutfitEditorScreen key="new" />;
      break;
    case 'outfit':
      screen = <OutfitDetailScreen key={route.id} outfitId={route.id} />;
      break;
    case 'outfitEdit':
      screen = <OutfitEditorScreen key={`edit-${route.id}`} outfitId={route.id} />;
      break;
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add outfit list, editor and detail screens"
```

---

### Task 11: Einstellungen (Backup, Speicher) und Backup-Erinnerung

**Files:**
- Create: `src/screens/SettingsScreen.tsx`
- Modify: `src/App.tsx` (Route `settings`), `src/screens/WardrobeScreen.tsx` (Erinnerungsbanner)
- Test: `src/screens/SettingsScreen.test.tsx`, `src/screens/BackupReminder.test.tsx`

**Interfaces:**
- Consumes: `exportBackup`, `importBackup`, `backupFileName` (backup.ts); `makeThumb` (image.ts); `shareOrDownload`, `readFileText` (files.ts); `getMeta`, `setMeta`, `META_LAST_BACKUP`, `META_PERSIST` (meta.ts); `countItems`, `countOutfits`; `storageUsageMB`, `isStandalone`; `needsBackupReminder`; `plural`; `userMessage`; `FilePicker`.
- Produces: `<SettingsScreen />` mit Buttons „Backup erstellen“ → „Backup sichern“, Upload „Backup einspielen“, Statusmeldungen (`role="status"` bei Erfolg, `role="alert"` bei Fehler). Schrank zeigt den Banner-Button „Zeit für ein Backup – tippen, um deine Daten zu sichern.“

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`src/screens/SettingsScreen.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { META_LAST_BACKUP, getMeta } from '../db/meta';
import { createOutfit } from '../db/outfits';
import { db } from '../db/schema';
import { exportBackup } from '../lib/backup';
import { shareOrDownload } from '../lib/files';
import { seedItem } from '../test/factories';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  makeThumb: vi.fn(async () => new Blob(['thumb'], { type: 'image/jpeg' })),
}));

vi.mock('../lib/files', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/files')>()),
  shareOrDownload: vi.fn(async () => 'shared'),
}));

// Kein vi.restoreAllMocks(): Das würde die vi.fn()-Implementierungen aus vi.mock leeren.
// confirm wird in jedem Test, der es braucht, per spyOn neu gesetzt.
beforeEach(() => {
  window.location.hash = '#/settings';
});

describe('Einstellungen', () => {
  it('shows counts and that no backup exists yet', async () => {
    const a = await seedItem();
    await seedItem();
    await createOutfit('Büro', [a]);
    render(<App />);
    expect(await screen.findByText('2 Teile · 1 Outfit')).toBeInTheDocument();
    expect(screen.getByText('Noch kein Backup')).toBeInTheDocument();
  });

  it('exports a backup via the share sheet and remembers the date', async () => {
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await user.click(await screen.findByRole('button', { name: 'Backup sichern' }));
    expect(shareOrDownload).toHaveBeenCalledWith(
      expect.stringContaining('"app":"kleiderschrank"'),
      expect.stringMatching(/^kleiderschrank-backup-\d{4}-\d{2}-\d{2}\.json$/),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Backup gesichert.');
    expect(await getMeta(META_LAST_BACKUP)).toBeDefined();
    expect(await screen.findByText(/^Letztes Backup: /)).toBeInTheDocument();
  });

  it('does not remember a cancelled share', async () => {
    vi.mocked(shareOrDownload).mockResolvedValueOnce('cancelled');
    await seedItem();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Backup erstellen' }));
    await user.click(await screen.findByRole('button', { name: 'Backup sichern' }));
    expect(await getMeta(META_LAST_BACKUP)).toBeUndefined();
    expect(screen.getByRole('button', { name: 'Backup sichern' })).toBeInTheDocument();
  });

  it('replaces all data from a valid backup after confirmation', async () => {
    await seedItem({ category: 'top' });
    const json = await exportBackup();
    await seedItem({ category: 'shoes' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup einspielen'),
      new File([json], 'kleiderschrank-backup-2026-10-10.json', { type: 'application/json' }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Backup eingespielt: 1 Teil, 0 Outfits.');
    expect(await db.items.count()).toBe(1);
    expect((await db.items.toArray())[0].category).toBe('top');
  });

  it('rejects an invalid file and keeps the data', async () => {
    await seedItem();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup einspielen'),
      new File(['kein backup'], 'notiz.json', { type: 'application/json' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Das ist keine gültige Kleiderschrank-Sicherung.');
    expect(await db.items.count()).toBe(1);
  });

  it('does nothing when the import is not confirmed', async () => {
    await seedItem();
    const json = await exportBackup();
    await seedItem();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(
      await screen.findByLabelText('Backup einspielen'),
      new File([json], 'backup.json', { type: 'application/json' }),
    );
    expect(await db.items.count()).toBe(2);
  });
});
```

`src/screens/BackupReminder.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { META_LAST_BACKUP, setMeta } from '../db/meta';
import { seedItem } from '../test/factories';

async function seedMany(count: number) {
  for (let i = 0; i < count; i += 1) await seedItem();
}

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Backup-Erinnerung', () => {
  it('appears from 10 items without any backup and links to the settings', async () => {
    await seedMany(10);
    render(<App />);
    const banner = await screen.findByRole('button', { name: /Zeit für ein Backup/ });
    await userEvent.click(banner);
    expect(await screen.findByRole('heading', { name: 'Einstellungen' })).toBeInTheDocument();
  });

  it('stays hidden after a recent backup', async () => {
    await seedMany(10);
    await setMeta(META_LAST_BACKUP, new Date().toISOString());
    render(<App />);
    await screen.findByText('10 Teile');
    expect(screen.queryByRole('button', { name: /Zeit für ein Backup/ })).not.toBeInTheDocument();
  });

  it('stays hidden for a small wardrobe without backup', async () => {
    await seedMany(3);
    render(<App />);
    await screen.findByText('3 Teile');
    expect(screen.queryByRole('button', { name: /Zeit für ein Backup/ })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Tests laufen lassen – sie müssen fehlschlagen**

Run: `npm test -- src/screens/SettingsScreen.test.tsx src/screens/BackupReminder.test.tsx`
Expected: FAIL – u. a. `Unable to find an element with the text: 2 Teile · 1 Outfit` und `Unable to find role="button" and name /Zeit für ein Backup/`.

- [ ] **Step 3: Implementieren**

`src/screens/SettingsScreen.tsx`:
```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { FilePicker } from '../components/FilePicker';
import { countItems } from '../db/items';
import { META_LAST_BACKUP, META_PERSIST, getMeta, setMeta } from '../db/meta';
import { countOutfits } from '../db/outfits';
import { backupFileName, exportBackup, importBackup } from '../lib/backup';
import { plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { readFileText, shareOrDownload } from '../lib/files';
import { makeThumb } from '../lib/image';
import { isStandalone, storageUsageMB } from '../lib/storage';

type Message = { kind: 'ok' | 'error'; text: string };

function formatUsage(mb: number): string {
  return mb < 1 ? '< 1 MB' : `${Math.round(mb)} MB`;
}

export function SettingsScreen() {
  const itemCount = useLiveQuery(countItems, []);
  const outfitCount = useLiveQuery(countOutfits, []);
  const lastBackup = useLiveQuery(async () => (await getMeta(META_LAST_BACKUP)) ?? null, []);
  const persist = useLiveQuery(async () => (await getMeta(META_PERSIST)) ?? null, []);
  const [usage, setUsage] = useState<number>();
  const [prepared, setPrepared] = useState<{ json: string; fileName: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    storageUsageMB().then(setUsage).catch(() => setUsage(undefined));
  }, [itemCount]);

  async function prepare() {
    setBusy(true);
    setMessage(null);
    try {
      setPrepared({ json: await exportBackup(), fileName: backupFileName() });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  // Muss ohne vorheriges await laufen, sonst verweigert Safari das Teilen-Menü.
  async function share() {
    if (!prepared) return;
    try {
      const result = await shareOrDownload(prepared.json, prepared.fileName);
      if (result === 'cancelled') return;
      await setMeta(META_LAST_BACKUP, new Date().toISOString());
      setPrepared(null);
      setMessage({ kind: 'ok', text: result === 'shared' ? 'Backup gesichert.' : 'Backup heruntergeladen.' });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    }
  }

  async function importFile(file: File) {
    if (!window.confirm('Backup einspielen? Alle aktuellen Teile und Outfits werden dabei ersetzt.')) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await importBackup(await readFileText(file), makeThumb);
      setMessage({
        kind: 'ok',
        text: `Backup eingespielt: ${plural(result.items, 'Teil', 'Teile')}, ${plural(result.outfits, 'Outfit', 'Outfits')}.`,
      });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  const showInstallHint = !isStandalone() || persist === 'false';

  return (
    <section className="screen-content">
      <header className="screen-header">
        <h1>Einstellungen</h1>
      </header>

      <div className="section">
        <h2>Backup</h2>
        <p>
          {lastBackup
            ? `Letztes Backup: ${new Date(lastBackup).toLocaleDateString('de-DE')}`
            : lastBackup === null ? 'Noch kein Backup' : ''}
        </p>
        {prepared ? (
          <>
            <button type="button" className="button button--primary" onClick={share}>Backup sichern</button>
            <p className="notice">Tipp: Wähle „In Dateien sichern“ → iCloud Drive.</p>
          </>
        ) : (
          <button type="button" className="button" disabled={busy} onClick={prepare}>Backup erstellen</button>
        )}
        <FilePicker className="button" label="Backup einspielen" accept="application/json,.json" onPick={importFile}>
          Backup einspielen
        </FilePicker>
        {message && (
          <p className={message.kind === 'ok' ? 'success' : 'error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
            {message.text}
          </p>
        )}
      </div>

      <div className="section">
        <h2>Speicher</h2>
        {itemCount !== undefined && outfitCount !== undefined && (
          <p>
            {`${plural(itemCount, 'Teil', 'Teile')} · ${plural(outfitCount, 'Outfit', 'Outfits')}`}
            {usage !== undefined && ` · ${formatUsage(usage)}`}
          </p>
        )}
        {showInstallHint && (
          <p className="notice">
            Tipp: Füge die App zum Home-Bildschirm hinzu (Safari → Teilen → „Zum Home-Bildschirm“), damit deine Daten
            dauerhaft gespeichert bleiben. Mach trotzdem regelmäßig ein Backup.
          </p>
        )}
      </div>
    </section>
  );
}
```

Hinweis: Wenn `usage` gesetzt ist, entstehen im `<p>` zwei Textknoten. Der Test „2 Teile · 1 Outfit“ läuft in jsdom ohne `navigator.storage`, deshalb gibt es dort nur einen Textknoten.

In `src/App.tsx` den Import ergänzen und im `switch` vor `default:` einfügen:
```tsx
import { SettingsScreen } from './screens/SettingsScreen';
```
```tsx
    case 'settings':
      screen = <SettingsScreen />;
      break;
```

In `src/screens/WardrobeScreen.tsx` die Imports ergänzen:
```tsx
import { META_LAST_BACKUP, getMeta } from '../db/meta';
import { needsBackupReminder } from '../lib/backupReminder';
```
Direkt nach `const items = useLiveQuery(listItems, []);` einfügen:
```tsx
  // undefined = lädt noch, null = noch nie gesichert
  const lastBackup = useLiveQuery(async () => (await getMeta(META_LAST_BACKUP)) ?? null, []);
```
Direkt nach dem schließenden `</header>` einfügen:
```tsx
      {lastBackup !== undefined && needsBackupReminder(lastBackup ?? undefined, items.length) && (
        <button type="button" className="banner" onClick={() => navigate('/settings')}>
          Zeit für ein Backup – tippen, um deine Daten zu sichern.
        </button>
      )}
```

- [ ] **Step 4: Tests laufen lassen – sie müssen bestehen**

Run: `npm test`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add settings screen with backup export/import and reminder banner"
```

---

### Task 12: PWA (Icon, Manifest, Offline, dauerhafter Speicher)

**Files:**
- Create: `public/icon.svg`, generierte Icons in `public/`
- Modify: `vite.config.ts`, `index.html`, `src/App.tsx` (Persistenz anfragen)

**Interfaces:**
- Consumes: `requestPersistence` (storage.ts).
- Produces: Build mit `dist/manifest.webmanifest`, `dist/sw.js` und Icons; die App fragt beim Start nach dauerhaftem Speicher.

- [ ] **Step 1: Pakete installieren**

Run:
```bash
npm install -E -D vite-plugin-pwa@0.21.1 @vite-pwa/assets-generator@0.2.6
```
Expected: keine `ERR!`-Zeilen.

- [ ] **Step 2: App-Icon anlegen und PNGs erzeugen**

`public/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#f6e7ec"/>
  <path d="M220 168a36 36 0 1 1 52 32c-10 5-16 13-16 24v14" fill="none" stroke="#b5476b" stroke-width="24" stroke-linecap="round"/>
  <path d="M256 238 L104 348 Q86 362 106 372 H406 Q426 362 408 348 Z" fill="none" stroke="#b5476b" stroke-width="24" stroke-linejoin="round"/>
</svg>
```

Run:
```bash
npx pwa-assets-generator --preset minimal-2023 public/icon.svg
```
Expected: In `public/` liegen jetzt `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`.

- [ ] **Step 3: Vite-Konfiguration erweitern**

`vite.config.ts` (vollständig ersetzen):
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/kleiderschrank/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Kleiderschrank',
        short_name: 'Kleiderschrank',
        description: 'Lenas digitaler Kleiderschrank',
        lang: 'de',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#f2f2f7',
        theme_color: '#f2f2f7',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['src/**/*.test.tsx', 'jsdom']],
    setupFiles: ['src/test/setup.ts'],
  },
});
```

In `index.html` im `<head>` nach `<title>` ergänzen:
```html
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
```

- [ ] **Step 4: Persistenz beim Start anfragen**

In `src/App.tsx`: `useEffect` zum React-Import hinzufügen (`import { useEffect, useState, type ReactElement } from 'react';`), den Import ergänzen und direkt nach den `useState`-Zeilen einfügen:
```tsx
import { requestPersistence } from './lib/storage';
```
```tsx
  useEffect(() => {
    requestPersistence().catch(() => undefined);
  }, []);
```

- [ ] **Step 5: Tests und Build prüfen**

Run: `npm test`
Expected: PASS (alle Tests).

Run: `npm run build`
Expected: Erfolgreich; die Ausgabe nennt `PWA v0.21.1` und `files generated: dist/sw.js, dist/workbox-*.js`. `dist/manifest.webmanifest` existiert, und `dist/index.html` enthält `/kleiderschrank/apple-touch-icon-180x180.png` sowie `registerSW.js`.

- [ ] **Step 6: Offline-Verhalten im Browser prüfen**

Run: `npm run preview`
Öffne `http://localhost:4173/kleiderschrank/`. In den DevTools → Application: Das Manifest zeigt Name und Icons, der Service Worker ist „activated“. Schalte Network auf „Offline“ und lade neu: Die App startet trotzdem. Server mit Strg+C beenden.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: make the app an installable offline PWA"
```

---

### Task 13: Veröffentlichung auf GitHub Pages und Anleitung

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Consumes: `npm test`, `npm run build` (erzeugt `dist/`).
- Produces: öffentlich erreichbare App unter `https://<github-benutzername>.github.io/kleiderschrank/`.

**Achtung, nach außen wirkende Schritte:** Repository anlegen und pushen veröffentlicht den Code öffentlich. Lenas Daten sind nicht betroffen, die bleiben auf dem iPhone. Vor Step 3 die Nutzerin bzw. den Nutzer ausdrücklich fragen. `gh auth login` muss die Person selbst im eigenen Terminal ausführen.

- [ ] **Step 1: Workflow anlegen**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: README mit Anleitung anlegen**

`README.md`:
````markdown
# Kleiderschrank

Lenas digitaler Kleiderschrank als Web-App fürs iPhone. Alle Daten bleiben auf dem Gerät.

## Für Lena: Installation

1. Öffne in **Safari** den Link `https://<github-benutzername>.github.io/kleiderschrank/`.
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
````

- [ ] **Step 3: GitHub-Repository anlegen und pushen** (vorher ausdrücklich bestätigen lassen)

Die Nutzerin bzw. der Nutzer führt einmalig im eigenen Terminal aus:
```bash
gh auth login
```
(GitHub.com → HTTPS → Login with a web browser.)

Danach:
```bash
gh repo create kleiderschrank --public --source . --remote origin --push
gh api -X POST "repos/{owner}/kleiderschrank/pages" -f build_type=workflow
gh workflow run Deploy
```
Expected: Das Repository existiert, Pages ist auf „GitHub Actions“ gestellt.

- [ ] **Step 4: Deployment prüfen**

Run: `gh run watch --exit-status $(gh run list --workflow Deploy --limit 1 --json databaseId --jq '.[0].databaseId')`
Expected: Beide Jobs `build` und `deploy` sind grün.

Öffne `https://<github-benutzername>.github.io/kleiderschrank/` im Browser: Die App lädt, und die Tab-Leiste ist sichtbar.

- [ ] **Step 5: README-Link einsetzen und committen**

Ersetze in `README.md` `<github-benutzername>` durch den echten Benutzernamen (`gh api user --jq .login`).

```bash
git add -A
git commit -m "docs: add deployment workflow and usage guide"
git push
```

- [ ] **Step 6: Abnahme auf Lenas iPhone**

Gehe die „Abnahme-Checkliste auf dem iPhone“ aus der README gemeinsam mit Lena durch. Melde jede abweichende Beobachtung als Fehler zurück, bevor das Projekt als fertig gilt.
