# Outfit-Tragebild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jedes Outfit kann ein optionales Foto haben, auf dem Lena den Look trägt; es ersetzt überall die Collage und steht im Outfit-Detail über den einzelnen Teilen.

**Architecture:** Neue Dexie-Tabelle `outfitPhotos` (Schema-Version 2) mit Vollbild + 3:4-Vorschaubild (oben bündig zugeschnitten). Zugriff nur über `src/db/outfits.ts`; Outfit und Foto werden in einer Transaktion geschrieben. Backup bleibt Version 1 mit optionalem Schlüssel `outfitPhotos`. UI: neue Komponenten `OutfitLook` (Foto oder Collage) und `OutfitPhotoPicker` (gestrichelter, antippbarer Rahmen); Detail und Editor erhalten Foto-Funktionen.

**Tech Stack:** Vite 5, React 18, TypeScript strict, Dexie 4 + dexie-react-hooks, Vitest + jsdom + fake-indexeddb + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-11-outfit-tragebild-design.md`

## Global Constraints

- Bildschirme greifen nie direkt auf `db` zu, nur über `src/db/*.ts` und `src/lib/backup.ts`.
- Schreibvorgänge über mehrere Tabellen laufen in **einer** Dexie-Transaktion.
- Schema-Änderung nur über `this.version(2)`; `version(1)` bleibt unverändert stehen. Bestehende Daten müssen erhalten bleiben.
- Backup bleibt `version: 1`; `outfitPhotos` ist optional (fehlt = leer). Der Import prüft alles **vor** dem Ersetzen.
- Fotos: Vollbild-JPEG max. 1200 px lange Kante, Qualität 0.85; Vorschaubild 360×480. Tragebilder werden **oben bündig** zugeschnitten (`anchor: 'top'`), Teil-Fotos bleiben mittig.
- Oberfläche komplett Deutsch, Ton wie eine Freundin, „Look“. Texte exakt: „Zeig, wie du den Look trägst“, „Foto von dir im Look“, „optional“, „Foto ändern“, „Foto entfernen“, Blatt „Foto entfernen?“ / „Das Foto von dir im Look wird gelöscht. Das Outfit und seine Teile bleiben.“ / „Entfernen“ / „Behalten“, Toast „Foto gespeichert“, Alternativtext „Du im Look „<Name>““.
- Gestaltung nach `DESIGN.md`: keine Karten um Fotos, gestrichelte Linien nur als Naht, Fadenrot nur für Hauptaktion/aktiven Tab/Zerstörerisches/Fehler/Fokus, keine Emojis (Symbole in `components/Icon.tsx`).
- TDD: erst fehlschlagender Test, dann Code. Vor jedem Commit `npm test` und `npx tsc --noEmit`.
- `*.test.ts` laufen in Node, `*.test.tsx` in jsdom. In Testdateien mit `vi.mock(..., () => ({ x: vi.fn(...) }))` **kein** `vi.restoreAllMocks()`. Werte aus `useLiveQuery` mit `findBy…` abfragen.
- Commits mit Git-Identität des Repos; Nachricht endet mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nicht pushen.
- Bash: falls `npm` fehlt, `export PATH="/c/Program Files/nodejs:$PATH"`.

## Review Focus

1. **Sehr hohes Spiegel-Selfie (9:16, 1080×1920):** Das Vorschaubild muss den Kopf behalten (oben bündig) → Test in Task 3 (`topCrop(1080, 1920, 3/4)`).
2. **Outfit mit Foto nur umbenennen:** Das Foto muss bleiben (Foto-Änderung `undefined`) → Test in Task 2 (`updateOutfit` ohne Foto-Argument) und Task 7 (Editor umbenennen behält Foto).
3. **Alle Teile eines Outfits mit Foto gelöscht:** Foto bleibt, Liste zeigt das Foto statt „Keine Teile mehr“ → Tests in Task 2 und Task 5.
4. **Import eines alten Backups ohne `outfitPhotos`, während lokal Tragebilder existieren:** Lokale Tragebilder werden mit ersetzt (keine Waisen) → Test in Task 4.
5. **Unlesbares Foto im Detail (z. B. HEIC-Fehler):** Meldung erscheint, nichts wird gespeichert, der Rahmen ist wieder benutzbar → Test in Task 6.

---

## File Structure

| Datei | Aufgabe |
|---|---|
| `src/db/schema.ts` (ändern) | `OutfitPhoto`-Typ, Tabelle `outfitPhotos`, `version(2)`, Konstruktor nimmt optionalen DB-Namen (für den Upgrade-Test) |
| `src/db/schema.test.ts` (ändern) | Upgrade v1 → v2 erhält Daten |
| `src/db/outfits.ts` (ändern) | Foto-API, Foto in create/update/delete |
| `src/db/outfits.test.ts` (ändern) | Tests der Foto-API |
| `src/lib/image.ts` (ändern) | `topCrop`, `CropAnchor`, Option `anchor` für `processPhoto`/`makeThumb` |
| `src/lib/image.test.ts` (ändern) | `topCrop`-Tests |
| `src/lib/backup.ts` (ändern) | `outfitPhotos` exportieren, prüfen, importieren |
| `src/lib/backup.test.ts` (ändern) | Backup-Tests für Tragebilder |
| `src/components/Icon.tsx` (ändern) | Symbol `camera` |
| `src/components/OutfitLook.tsx` (neu) | Tragebild-Vorschau oder Collage |
| `src/components/OutfitPhotoPicker.tsx` (neu) | gestrichelter, antippbarer Foto-Rahmen |
| `src/screens/WardrobeScreen.tsx`, `src/screens/OutfitsScreen.tsx` (ändern) | `OutfitLook` statt `OutfitPreview` |
| `src/screens/OutfitDetailScreen.tsx` (ändern) | Tragebild, Ändern/Entfernen, Hinzufügen, Toast |
| `src/screens/OutfitEditorScreen.tsx` (ändern) | Foto im Namens-Schritt |
| `src/screens/OutfitPhoto.test.tsx` (neu) | Screen-Tests (mit `vi.mock('../lib/image')`) |
| `src/styles.css` (ändern) | Stile für Look-Foto, Rahmen, Aktionen |
| `DESIGN.md`, `CLAUDE.md`, `HANDOFF.md` (ändern) | Doku nachziehen |

---

### Task 1: Schema-Version 2 mit Tabelle `outfitPhotos`

**Files:**
- Modify: `src/db/schema.ts`
- Test: `src/db/schema.test.ts`

**Interfaces:**
- Produces: `interface OutfitPhoto { outfitId: string; full: Blob; thumb: Blob }`, `db.outfitPhotos: Table<OutfitPhoto, string>`, `new WardrobeDB(name?: string)`.

- [ ] **Step 1: Write the failing tests** – an `src/db/schema.test.ts` anhängen (Imports oben ergänzen: `import Dexie from 'dexie';` und `import { db, WardrobeDB } from './schema';`):

```ts
describe('schema version 2', () => {
  it('stores an outfit photo by outfit id', async () => {
    await db.outfitPhotos.put({
      outfitId: 'o1',
      full: new Blob(['full'], { type: 'image/jpeg' }),
      thumb: new Blob(['thumb'], { type: 'image/jpeg' }),
    });
    expect(await (await db.outfitPhotos.get('o1'))!.thumb.text()).toBe('thumb');
  });

  it('keeps all data of a version-1 database when upgrading', async () => {
    const name = `upgrade-${Date.now()}`;
    const old = new Dexie(name);
    old.version(1).stores({ items: 'id, category, createdAt', photos: 'itemId', outfits: 'id, *itemIds, createdAt', meta: 'key' });
    await old.open();
    await old.table('items').put({
      id: 'a', category: 'top', colors: [], seasons: [], note: 'alt',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await old.table('photos').put({ itemId: 'a', full: new Blob(['f']), thumb: new Blob(['t']) });
    await old.table('outfits').put({ id: 'o', name: 'Look', itemIds: ['a'], createdAt: 'x', updatedAt: 'x' });
    await old.table('meta').put({ key: 'userName', value: 'Lena' });
    old.close();

    const upgraded = new WardrobeDB(name);
    await upgraded.open();
    expect(upgraded.verno).toBe(2);
    expect((await upgraded.items.get('a'))?.note).toBe('alt');
    expect(await upgraded.photos.count()).toBe(1);
    expect((await upgraded.outfits.get('o'))?.itemIds).toEqual(['a']);
    expect((await upgraded.meta.get('userName'))?.value).toBe('Lena');
    expect(await upgraded.outfitPhotos.count()).toBe(0);
    upgraded.close();
    await Dexie.delete(name);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/db/schema.test.ts`
Expected: FAIL (TypeScript/Runtime: `outfitPhotos` undefined, `WardrobeDB` nimmt keinen Namen).

- [ ] **Step 3: Implement** – in `src/db/schema.ts` nach `interface Photo` einfügen:

```ts
/** Foto von Lena im Look. Eigene Tabelle (Version 2), getrennt von den Teil-Fotos. */
export interface OutfitPhoto {
  outfitId: string;
  full: Blob;
  thumb: Blob;
}
```

Klasse ändern:

```ts
export class WardrobeDB extends Dexie {
  items!: Table<Item, string>;
  photos!: Table<Photo, string>;
  outfits!: Table<Outfit, string>;
  meta!: Table<MetaEntry, string>;
  outfitPhotos!: Table<OutfitPhoto, string>;

  constructor(name = 'kleiderschrank') {
    super(name);
    this.version(1).stores({
      items: 'id, category, createdAt',
      photos: 'itemId',
      outfits: 'id, *itemIds, createdAt',
      meta: 'key',
    });
    // Version 2 fügt nur die Tragebilder hinzu; bestehende Tabellen und Daten bleiben unverändert.
    this.version(2).stores({ outfitPhotos: 'outfitId' });
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/db/schema.test.ts` → PASS. Dann `npm test` und `npx tsc --noEmit` → alles grün.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts src/db/schema.test.ts
git commit -m "feat(db): schema version 2 with an outfitPhotos table

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Foto-API in `db/outfits.ts`

**Files:**
- Modify: `src/db/outfits.ts`
- Test: `src/db/outfits.test.ts`

**Interfaces:**
- Consumes: `db.outfitPhotos`, `OutfitPhoto` (Task 1); `PhotoBlobs` aus `src/db/items.ts` (`{ full: Blob; thumb: Blob }`).
- Produces:
  - `type PhotoChange = PhotoBlobs | null | undefined`
  - `createOutfit(name: string, itemIds: string[], photo?: PhotoBlobs): Promise<string>`
  - `updateOutfit(id: string, name: string, itemIds: string[], photo?: PhotoChange): Promise<void>`
  - `setOutfitPhoto(outfitId: string, photo: PhotoBlobs): Promise<void>`
  - `removeOutfitPhoto(outfitId: string): Promise<void>`
  - `getOutfitPhoto(outfitId: string): Promise<OutfitPhoto | undefined>`
  - `deleteOutfit(id)` löscht auch das Foto.

- [ ] **Step 1: Write the failing tests** – an `src/db/outfits.test.ts` anhängen; Imports ergänzen um `fakePhoto` aus `../test/factories` und `getOutfitPhoto, removeOutfitPhoto, setOutfitPhoto` aus `./outfits`:

```ts
describe('outfit photos', () => {
  it('creates an outfit together with its photo', async () => {
    const a = await seedItem();
    const id = await createOutfit('Spiegel', [a], fakePhoto('look'));
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('look-full');
    expect(await (await getOutfitPhoto(id))!.thumb.text()).toBe('look-thumb');
  });

  it('stores no photo when none is given', async () => {
    const a = await seedItem();
    const id = await createOutfit('Ohne', [a]);
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('does not store a photo when the outfit is invalid', async () => {
    await expect(createOutfit(' ', ['missing'], fakePhoto())).rejects.toThrow(OutfitValidationError);
    const { db } = await import('./schema');
    expect(await db.outfitPhotos.count()).toBe(0);
  });

  it('keeps, replaces or removes the photo on update', async () => {
    const a = await seedItem();
    const id = await createOutfit('Look', [a], fakePhoto('one'));
    await updateOutfit(id, 'Umbenannt', [a]);
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('one-full');
    await updateOutfit(id, 'Umbenannt', [a], fakePhoto('two'));
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('two-full');
    await updateOutfit(id, 'Umbenannt', [a], null);
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('sets and removes a photo directly and touches updatedAt', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const a = await seedItem();
    const id = await createOutfit('Look', [a]);
    vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
    await setOutfitPhoto(id, fakePhoto('neu'));
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('neu-full');
    expect((await getOutfit(id))!.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    vi.setSystemTime(new Date('2026-01-03T00:00:00.000Z'));
    await removeOutfitPhoto(id);
    expect(await getOutfitPhoto(id)).toBeUndefined();
    expect((await getOutfit(id))!.updatedAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('refuses a photo for an unknown outfit', async () => {
    await expect(setOutfitPhoto('missing', fakePhoto())).rejects.toThrow('Outfit nicht gefunden');
  });

  it('deletes the photo together with the outfit', async () => {
    const a = await seedItem();
    const id = await createOutfit('Weg', [a], fakePhoto());
    await deleteOutfit(id);
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('keeps the photo when all pieces of the outfit are deleted', async () => {
    const a = await seedItem();
    const id = await createOutfit('Nur noch Foto', [a], fakePhoto('bleibt'));
    await deleteItem(a);
    expect((await getOutfit(id))!.itemIds).toEqual([]);
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('bleibt-full');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/db/outfits.test.ts`
Expected: FAIL (`getOutfitPhoto`/`setOutfitPhoto`/`removeOutfitPhoto` nicht exportiert).

- [ ] **Step 3: Implement** – `src/db/outfits.ts` vollständig so ersetzen (bestehende Funktionen bleiben, Foto kommt hinzu):

```ts
import { newId } from '../lib/id';
import type { PhotoBlobs } from './items';
import { db, type Outfit, type OutfitPhoto } from './schema';

export class OutfitValidationError extends Error {}

/** Foto setzen, entfernen (null) oder unverändert lassen (undefined). */
export type PhotoChange = PhotoBlobs | null | undefined;

async function normalize(name: string, itemIds: string[]): Promise<{ name: string; itemIds: string[] }> {
  const trimmed = name.trim();
  if (!trimmed) throw new OutfitValidationError('Bitte gib dem Outfit einen Namen.');
  const unique = [...new Set(itemIds)];
  const existing = await db.items.bulkGet(unique);
  const ids = unique.filter((_, index) => existing[index] !== undefined);
  if (ids.length === 0) throw new OutfitValidationError('Bitte wähle mindestens ein Teil aus.');
  return { name: trimmed, itemIds: ids };
}

async function applyPhoto(outfitId: string, photo: PhotoChange): Promise<void> {
  if (photo === null) await db.outfitPhotos.delete(outfitId);
  else if (photo) await db.outfitPhotos.put({ outfitId, full: photo.full, thumb: photo.thumb });
}

export async function createOutfit(name: string, itemIds: string[], photo?: PhotoBlobs): Promise<string> {
  const id = newId();
  await db.transaction('rw', db.items, db.outfits, db.outfitPhotos, async () => {
    const data = await normalize(name, itemIds);
    const now = new Date().toISOString();
    await db.outfits.add({ id, ...data, createdAt: now, updatedAt: now });
    await applyPhoto(id, photo);
  });
  return id;
}

export async function updateOutfit(id: string, name: string, itemIds: string[], photo?: PhotoChange): Promise<void> {
  await db.transaction('rw', db.items, db.outfits, db.outfitPhotos, async () => {
    const existing = await db.outfits.get(id);
    if (!existing) throw new Error(`Outfit nicht gefunden: ${id}`);
    const data = await normalize(name, itemIds);
    await db.outfits.put({ ...existing, ...data, updatedAt: new Date().toISOString() });
    await applyPhoto(id, photo);
  });
}

async function changePhoto(outfitId: string, photo: PhotoBlobs | null): Promise<void> {
  await db.transaction('rw', db.outfits, db.outfitPhotos, async () => {
    const existing = await db.outfits.get(outfitId);
    if (!existing) throw new Error(`Outfit nicht gefunden: ${outfitId}`);
    await applyPhoto(outfitId, photo);
    await db.outfits.put({ ...existing, updatedAt: new Date().toISOString() });
  });
}

export function setOutfitPhoto(outfitId: string, photo: PhotoBlobs): Promise<void> {
  return changePhoto(outfitId, photo);
}

export function removeOutfitPhoto(outfitId: string): Promise<void> {
  return changePhoto(outfitId, null);
}

export function getOutfitPhoto(outfitId: string): Promise<OutfitPhoto | undefined> {
  return db.outfitPhotos.get(outfitId);
}

export async function deleteOutfit(id: string): Promise<void> {
  await db.transaction('rw', db.outfits, db.outfitPhotos, async () => {
    await db.outfits.delete(id);
    await db.outfitPhotos.delete(id);
  });
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

Hinweis: `items.ts` importiert nichts aus `outfits.ts`; der Typ-Import `PhotoBlobs` erzeugt keinen Zyklus zur Laufzeit.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/db/outfits.test.ts` → PASS; `npm test`, `npx tsc --noEmit` → grün.

- [ ] **Step 5: Commit**

```bash
git add src/db/outfits.ts src/db/outfits.test.ts
git commit -m "feat(db): wear photo per outfit, written in the same transaction

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Oben bündiger Zuschnitt in `lib/image.ts`

**Files:**
- Modify: `src/lib/image.ts`
- Test: `src/lib/image.test.ts`

**Interfaces:**
- Produces:
  - `type CropAnchor = 'center' | 'top'`
  - `interface CropOptions { anchor?: CropAnchor }`
  - `topCrop(width: number, height: number, ratio: number): { sx: number; sy: number; sw: number; sh: number }`
  - `processPhoto(file: Blob, options?: CropOptions): Promise<PhotoBlobs>`
  - `makeThumb(full: Blob, options?: CropOptions): Promise<Blob>`

- [ ] **Step 1: Write the failing tests** – an `src/lib/image.test.ts` anhängen, `topCrop` zum Import hinzufügen:

```ts
describe('topCrop', () => {
  it('keeps the head of a tall mirror selfie (9:16)', () => {
    expect(topCrop(1080, 1920, 3 / 4)).toEqual({ sx: 0, sy: 0, sw: 1080, sh: 1440 });
  });

  it('centres a landscape photo horizontally like centerCrop', () => {
    expect(topCrop(4032, 3024, 3 / 4)).toEqual(centerCrop(4032, 3024, 3 / 4));
  });

  it('keeps an exact 3:4 photo whole', () => {
    expect(topCrop(3024, 4032, 3 / 4)).toEqual({ sx: 0, sy: 0, sw: 3024, sh: 4032 });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/lib/image.test.ts` → FAIL (`topCrop` nicht exportiert).

- [ ] **Step 3: Implement** – in `src/lib/image.ts` nach `centerCrop` einfügen:

```ts
export type CropAnchor = 'center' | 'top';
export interface CropOptions { anchor?: CropAnchor }

/** Wie centerCrop, aber oben bündig: bei Spiegel-Selfies bleibt der Kopf im Bild. */
export function topCrop(width: number, height: number, ratio: number): { sx: number; sy: number; sw: number; sh: number } {
  return { ...centerCrop(width, height, ratio), sy: 0 };
}
```

`drawThumb`, `processPhoto`, `makeThumb` ersetzen durch:

```ts
function drawThumb(source: Source, width: number, height: number, anchor: CropAnchor): Promise<Blob> {
  const crop = anchor === 'top' ? topCrop : centerCrop;
  const { sx, sy, sw, sh } = crop(width, height, THUMB_WIDTH / THUMB_HEIGHT);
  return draw(source, sx, sy, sw, sh, THUMB_WIDTH, THUMB_HEIGHT);
}

export async function processPhoto(file: Blob, { anchor = 'center' }: CropOptions = {}): Promise<PhotoBlobs> {
  const source = await decode(file);
  try {
    const { width, height } = sizeOf(source);
    if (!width || !height) throw new PhotoError('Foto hat keine Größe');
    const target = fitWithin(width, height, FULL_MAX);
    const full = await draw(source, 0, 0, width, height, target.width, target.height);
    const thumb = await drawThumb(source, width, height, anchor);
    return { full, thumb };
  } finally {
    release(source);
  }
}

export async function makeThumb(full: Blob, { anchor = 'center' }: CropOptions = {}): Promise<Blob> {
  const source = await decode(full);
  try {
    const { width, height } = sizeOf(source);
    return await drawThumb(source, width, height, anchor);
  } finally {
    release(source);
  }
}
```

Hinweis: `ItemFormScreen` ruft `processPhoto(file)` auf, `SettingsScreen` reicht `makeThumb` an `importBackup` weiter – beide bleiben ohne Änderung mittig.

- [ ] **Step 4: Run tests** – `npx vitest run src/lib/image.test.ts` → PASS; `npm test`, `npx tsc --noEmit` → grün.

- [ ] **Step 5: Commit**

```bash
git add src/lib/image.ts src/lib/image.test.ts
git commit -m "feat(image): top-anchored thumbnails for wear photos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Tragebilder im Backup

**Files:**
- Modify: `src/lib/backup.ts`
- Test: `src/lib/backup.test.ts`

**Interfaces:**
- Consumes: `db.outfitPhotos`, `OutfitPhoto` (Task 1); `CropOptions` aus `./image` (Task 3, nur als Typ); `createOutfit(name, ids, photo?)` (Task 2).
- Produces:
  - `ParsedBackup.outfitPhotos: { outfitId: string; full: Blob }[]`
  - `importBackup(text: string, makeThumb: (full: Blob, options?: CropOptions) => Promise<Blob>): Promise<{ items: number; outfits: number }>` – ruft für Tragebilder `makeThumb(full, { anchor: 'top' })`, für Teil-Fotos `makeThumb(full)`.

- [ ] **Step 1: Write the failing tests** – an `src/lib/backup.test.ts` anhängen:

```ts
describe('wear photos in the backup', () => {
  const anchorThumb = async (full: Blob, options?: { anchor?: string }) =>
    new Blob([`thumb-${options?.anchor ?? 'center'}-of-${await full.text()}`], { type: 'image/jpeg' });

  it('exports outfitPhotos and restores them with a top-anchored thumbnail, still as version 1', async () => {
    const { a } = await seedWardrobe();
    const look = await createOutfit('Spiegel', [a], fakePhoto('look'));
    const json = await exportBackup();
    const raw = JSON.parse(json);
    expect(raw.version).toBe(1);
    expect(raw.outfitPhotos).toHaveLength(1);
    expect(raw.outfitPhotos[0].outfitId).toBe(look);
    await clearAll();

    await importBackup(json, anchorThumb);
    const photo = await db.outfitPhotos.get(look);
    expect(await photo!.full.text()).toBe('look-full');
    expect(await photo!.thumb.text()).toBe('thumb-top-of-look-full');
    expect(await (await db.photos.get(a))!.thumb.text()).toBe('thumb-center-of-a-full');
  });

  it('accepts an older backup without outfitPhotos and clears local wear photos', async () => {
    const { a } = await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    delete raw.outfitPhotos;
    await createOutfit('Lokal', [a], fakePhoto('lokal'));
    expect(await db.outfitPhotos.count()).toBe(1);

    expect(await importBackup(JSON.stringify(raw), fakeThumb)).toEqual({ items: 2, outfits: 1 });
    expect(await db.outfitPhotos.count()).toBe(0);
    expect(parseBackup(JSON.stringify(raw)).outfitPhotos).toEqual([]);
  });

  it('drops wear photos of outfits that are not in the backup', async () => {
    await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    raw.outfitPhotos = [{ outfitId: 'gibt-es-nicht', full: raw.photos[0].full }];
    await clearAll();
    await importBackup(JSON.stringify(raw), fakeThumb);
    expect(await db.outfitPhotos.count()).toBe(0);
  });

  it('rejects broken outfitPhotos without touching the data', async () => {
    const { outfit } = await seedWardrobe();
    const raw = JSON.parse(await exportBackup());
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, outfitPhotos: 'kaputt' }));
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, outfitPhotos: [{ outfitId: outfit }] }));
    await expectRejectedWithoutChanges(JSON.stringify({ ...raw, outfitPhotos: [{ outfitId: outfit, full: '###' }] }));
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/lib/backup.test.ts` → FAIL (`outfitPhotos` fehlt im Export, `ParsedBackup.outfitPhotos` undefined).

- [ ] **Step 3: Implement** – in `src/lib/backup.ts`:

Import ergänzen:

```ts
import { db, type Item, type Outfit, type OutfitPhoto, type Photo } from '../db/schema';
import type { CropOptions } from './image';
```

Typen erweitern:

```ts
interface BackupFile {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  items: Item[];
  outfits: Outfit[];
  photos: { itemId: string; full: string }[];
  /** Optional seit dem Tragebild; ältere Sicherungen haben den Schlüssel nicht. Version bleibt 1. */
  outfitPhotos: { outfitId: string; full: string }[];
}

export interface ParsedBackup {
  exportedAt: string;
  items: Item[];
  outfits: Outfit[];
  photos: { itemId: string; full: Blob }[];
  outfitPhotos: { outfitId: string; full: Blob }[];
}
```

`exportBackup` ersetzen:

```ts
export async function exportBackup(now = new Date()): Promise<string> {
  const [items, outfits, photos, outfitPhotos] = await db.transaction(
    'r', db.items, db.outfits, db.photos, db.outfitPhotos,
    () => Promise.all([db.items.toArray(), db.outfits.toArray(), db.photos.toArray(), db.outfitPhotos.toArray()]),
  );
  const encoded: BackupFile['photos'] = [];
  for (const photo of photos) {
    encoded.push({ itemId: photo.itemId, full: await blobToBase64(photo.full) });
  }
  const encodedLooks: BackupFile['outfitPhotos'] = [];
  for (const photo of outfitPhotos) {
    encodedLooks.push({ outfitId: photo.outfitId, full: await blobToBase64(photo.full) });
  }
  const file: BackupFile = {
    app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(),
    items, outfits, photos: encoded, outfitPhotos: encodedLooks,
  };
  return JSON.stringify(file);
}
```

In `parseBackup` nach der Prüfung auf doppelte Outfit-IDs (vor `const exportedAt`) einfügen und das Rückgabeobjekt erweitern:

```ts
  const outfitIds = new Set(outfits.map((o) => o.id));
  const outfitPhotos = new Map<string, Blob>();
  if (raw.outfitPhotos !== undefined) {
    if (!Array.isArray(raw.outfitPhotos)) return fail('Outfit-Fotos sind keine Liste');
    for (const p of raw.outfitPhotos) {
      if (!isRecord(p) || !isText(p.outfitId) || !isText(p.full)) return fail('Outfit-Foto unvollständig');
      if (!outfitIds.has(p.outfitId)) continue;
      try {
        outfitPhotos.set(p.outfitId, base64ToBlob(p.full));
      } catch {
        return fail('Foto beschädigt');
      }
    }
  }

  const exportedAt = isText(raw.exportedAt) ? raw.exportedAt : '';
  return {
    exportedAt, items, outfits,
    photos: [...photos].map(([itemId, full]) => ({ itemId, full })),
    outfitPhotos: [...outfitPhotos].map(([outfitId, full]) => ({ outfitId, full })),
  };
```

(Die bisherige Zeile `const exportedAt …` und das bisherige `return` werden dadurch ersetzt.)

`importBackup` ersetzen:

```ts
export async function importBackup(
  text: string,
  makeThumb: (full: Blob, options?: CropOptions) => Promise<Blob>,
): Promise<{ items: number; outfits: number }> {
  const parsed = parseBackup(text);
  const photos: Photo[] = [];
  const outfitPhotos: OutfitPhoto[] = [];
  // Nacheinander statt parallel, um den Speicher auf dem iPhone zu schonen.
  try {
    for (const photo of parsed.photos) {
      photos.push({ itemId: photo.itemId, full: photo.full, thumb: await makeThumb(photo.full) });
    }
    for (const photo of parsed.outfitPhotos) {
      outfitPhotos.push({ outfitId: photo.outfitId, full: photo.full, thumb: await makeThumb(photo.full, { anchor: 'top' }) });
    }
  } catch {
    throw new BackupError('Ungültige Sicherung: Foto konnte nicht gelesen werden');
  }
  await db.transaction('rw', [db.items, db.photos, db.outfits, db.outfitPhotos], async () => {
    await Promise.all([db.items.clear(), db.photos.clear(), db.outfits.clear(), db.outfitPhotos.clear()]);
    await db.items.bulkAdd(parsed.items);
    await db.photos.bulkAdd(photos);
    await db.outfits.bulkAdd(parsed.outfits);
    await db.outfitPhotos.bulkAdd(outfitPhotos);
  });
  return { items: parsed.items.length, outfits: parsed.outfits.length };
}
```

Hinweis: `SettingsScreen` übergibt `makeThumb` aus `lib/image` direkt – passt durch die Signatur aus Task 3 ohne Änderung. `lib/image` wird nur als Typ importiert, damit `backup.ts` in Node-Tests kein Canvas braucht.

- [ ] **Step 4: Run tests** – `npx vitest run src/lib/backup.test.ts` → PASS; `npm test`, `npx tsc --noEmit` → grün (inkl. `SettingsScreen.test.tsx`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/backup.ts src/lib/backup.test.ts
git commit -m "feat(backup): carry wear photos as optional outfitPhotos, format stays v1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `OutfitLook` unter „Heute“ und in der Outfit-Liste

**Files:**
- Create: `src/components/OutfitLook.tsx`
- Modify: `src/components/Icon.tsx`, `src/screens/WardrobeScreen.tsx`, `src/screens/OutfitsScreen.tsx`, `src/styles.css`
- Test: `src/screens/OutfitPhoto.test.tsx` (neu)

**Interfaces:**
- Consumes: `getOutfitPhoto` (Task 2), `useObjectUrl` (`src/lib/useObjectUrl.ts`), `OutfitPreview`.
- Produces: `<OutfitLook outfitId={string} itemIds={string[]} />`; Icon-Name `'camera'`.

- [ ] **Step 1: Write the failing tests** – neue Datei `src/screens/OutfitPhoto.test.tsx` (diese Datei wird in Task 6 und 7 erweitert; **kein** `vi.restoreAllMocks()`):

```tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { deleteItem } from '../db/items';
import { createOutfit, getOutfitPhoto } from '../db/outfits';
import { PhotoError, processPhoto } from '../lib/image';
import { fakePhoto, seedItem } from '../test/factories';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processPhoto: vi.fn(async () => ({
    full: new Blob(['look-full'], { type: 'image/jpeg' }),
    thumb: new Blob(['look-thumb'], { type: 'image/jpeg' }),
  })),
}));

const selfie = () => new File(['x'], 'spiegel.jpg', { type: 'image/jpeg' });

function open(path: string) {
  window.location.hash = `#${path}`;
  return render(<App />);
}

beforeEach(() => {
  vi.mocked(processPhoto).mockClear();
});

afterEach(() => vi.useRealTimers());

describe('OutfitLook', () => {
  it('shows the wear photo instead of the collage in the outfit list', async () => {
    const a = await seedItem();
    await createOutfit('Mit Foto', [a], fakePhoto('look'));
    await createOutfit('Ohne Foto', [a]);
    const { container } = open('/outfits');
    expect(await screen.findByText('Mit Foto')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('img.outfit-look')).toHaveLength(1));
    expect(container.querySelectorAll('.outfit-preview')).toHaveLength(1);
  });

  it('shows the wear photo even when all pieces are gone', async () => {
    const a = await seedItem();
    await createOutfit('Nur Foto', [a], fakePhoto('look'));
    await deleteItem(a);
    const { container } = open('/outfits');
    expect(await screen.findByText('Nur Foto')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('img.outfit-look')).not.toBeNull());
    expect(screen.queryByText('Keine Teile mehr')).not.toBeInTheDocument();
  });

  it('shows the wear photo under Heute on the wardrobe', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-11T08:00:00'));
    const coat = await seedItem({ category: 'jacket', seasons: ['autumn'] });
    await createOutfit('Herbst-Look', [coat], fakePhoto('look'));
    const { container } = open('/');
    expect(await screen.findByText('Herbst-Look')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('.today img.outfit-look')).not.toBeNull());
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/screens/OutfitPhoto.test.tsx` → FAIL (kein `img.outfit-look`).

- [ ] **Step 3: Implement**

`src/components/Icon.tsx` – im Objekt `PATHS` nach `heart` ergänzen:

```ts
  camera: 'M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9ZM12 10a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z',
```

`src/components/OutfitLook.tsx`:

```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { getOutfitPhoto } from '../db/outfits';
import { useObjectUrl } from '../lib/useObjectUrl';
import { OutfitPreview } from './OutfitPreview';

/** Ein Look: das Foto von Lena im Outfit, sonst die Collage aus den Teilen. */
export function OutfitLook({ outfitId, itemIds }: { outfitId: string; itemIds: string[] }) {
  const photo = useLiveQuery(async () => (await getOutfitPhoto(outfitId)) ?? null, [outfitId]);
  const url = useObjectUrl(photo?.thumb);
  // Während des Ladens eine ruhige 3:4-Fläche, damit nichts springt.
  if (photo === undefined) return <div className="outfit-look outfit-look--loading" aria-hidden="true" />;
  if (photo === null) return <OutfitPreview itemIds={itemIds} />;
  if (!url) return <div className="outfit-look outfit-look--loading" aria-hidden="true" />;
  return <img className="outfit-look" src={url} alt="" />;
}
```

`src/screens/OutfitsScreen.tsx`: Import `OutfitPreview` durch `import { OutfitLook } from '../components/OutfitLook';` ersetzen und `<OutfitPreview itemIds={outfit.itemIds} />` durch `<OutfitLook outfitId={outfit.id} itemIds={outfit.itemIds} />` ersetzen.

`src/screens/WardrobeScreen.tsx`: ebenso Import ersetzen und im „Heute“-Streifen `<OutfitPreview itemIds={outfit.itemIds} />` durch `<OutfitLook outfitId={outfit.id} itemIds={outfit.itemIds} />` ersetzen. (Prüfen mit `grep -n OutfitPreview src/screens/WardrobeScreen.tsx`, dass keine weitere Verwendung bleibt; sonst Import behalten.)

`src/styles.css` – nach der Zeile `.outfit-preview__more { … }` einfügen:

```css
.outfit-look { display: block; width: 100%; aspect-ratio: 3 / 4; object-fit: cover; border-radius: 4px; background: var(--chip); }
```

und nach `.today__strip .outfit-preview { height: 168px; width: auto; }` einfügen:

```css
.today__strip .outfit-look { height: 168px; width: auto; }
```

- [ ] **Step 4: Run tests** – `npx vitest run src/screens/OutfitPhoto.test.tsx` → PASS; `npm test`, `npx tsc --noEmit` → grün.

- [ ] **Step 5: Commit**

```bash
git add src/components/OutfitLook.tsx src/components/Icon.tsx src/screens/WardrobeScreen.tsx src/screens/OutfitsScreen.tsx src/styles.css src/screens/OutfitPhoto.test.tsx
git commit -m "feat(outfits): show the wear photo as the look under Heute and in the list

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Tragebild im Outfit-Detail

**Files:**
- Create: `src/components/OutfitPhotoPicker.tsx`
- Modify: `src/screens/OutfitDetailScreen.tsx`, `src/styles.css`
- Test: `src/screens/OutfitPhoto.test.tsx`

**Interfaces:**
- Consumes: `getOutfitPhoto`, `setOutfitPhoto`, `removeOutfitPhoto` (Task 2); `processPhoto(file, { anchor: 'top' })` (Task 3); `FilePicker`, `ConfirmSheet`, `Icon` (`'camera'`, Task 5); `userMessage`.
- Produces: `<OutfitPhotoPicker label={string} text={string} busy={boolean} onPick={(file: File) => void} />` – auch in Task 7 genutzt.

- [ ] **Step 1: Write the failing tests** – an `src/screens/OutfitPhoto.test.tsx` anhängen:

```tsx
describe('Outfit-Detail mit Tragebild', () => {
  it('shows the photo on top and the pieces once, without the collage', async () => {
    const a = await seedItem();
    const id = await createOutfit('Date Night', [a], fakePhoto('look'));
    const { container } = open(`/outfit/${id}`);
    expect(await screen.findByRole('img', { name: 'Du im Look „Date Night“' })).toBeInTheDocument();
    expect(container.querySelector('.outfit-preview')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Teile' })).toBeInTheDocument();
  });

  it('adds a photo from the dashed frame and confirms it', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.upload(await screen.findByLabelText('Zeig, wie du den Look trägst'), selfie());
    expect(await screen.findByRole('status')).toHaveTextContent('Foto gespeichert');
    expect(processPhoto).toHaveBeenCalledWith(expect.any(File), { anchor: 'top' });
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('look-full');
    expect(await screen.findByRole('img', { name: 'Du im Look „Uni“' })).toBeInTheDocument();
  });

  it('reports an unreadable photo and saves nothing', async () => {
    vi.mocked(processPhoto).mockRejectedValueOnce(new PhotoError('kaputt'));
    const a = await seedItem();
    const id = await createOutfit('Uni', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    const input = await screen.findByLabelText('Zeig, wie du den Look trägst');
    await user.upload(input, selfie());
    expect(await screen.findByRole('alert')).toHaveTextContent('Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.');
    expect(await getOutfitPhoto(id)).toBeUndefined();
    expect(input).toBeEnabled();
  });

  it('replaces the photo', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a], fakePhoto('alt'));
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.upload(await screen.findByLabelText('Foto ändern'), selfie());
    await waitFor(async () => expect(await (await getOutfitPhoto(id))!.full.text()).toBe('look-full'));
  });

  it('removes the photo only after confirmation', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a], fakePhoto('alt'));
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Foto entfernen' }));
    const sheet = await screen.findByRole('dialog', { name: 'Foto entfernen?' });
    await user.click(within(sheet).getByRole('button', { name: 'Behalten' }));
    expect(await getOutfitPhoto(id)).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Foto entfernen' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Foto entfernen?' })).getByRole('button', { name: 'Entfernen' }));
    await waitFor(async () => expect(await getOutfitPhoto(id)).toBeUndefined());
    expect(await screen.findByLabelText('Zeig, wie du den Look trägst')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/screens/OutfitPhoto.test.tsx` → FAIL (kein Bild, kein Rahmen).

- [ ] **Step 3: Implement**

`src/components/OutfitPhotoPicker.tsx`:

```tsx
import { FilePicker } from './FilePicker';
import { Icon } from './Icon';

interface OutfitPhotoPickerProps {
  /** Zugänglicher Name des Datei-Felds. */
  label: string;
  /** Sichtbarer Text im Rahmen. */
  text: string;
  busy: boolean;
  onPick: (file: File) => void;
}

/** Gestrichelter Rahmen (Naht) für das Foto von Lena im Look; die ganze Fläche ist antippbar. */
export function OutfitPhotoPicker({ label, text, busy, onPick }: OutfitPhotoPickerProps) {
  return (
    <FilePicker className={busy ? 'look-picker look-picker--busy' : 'look-picker'} label={label} accept="image/*" onPick={onPick} disabled={busy}>
      <Icon name="camera" size={22} />
      <span>{busy ? 'Foto wird vorbereitet …' : text}</span>
    </FilePicker>
  );
}
```

`src/screens/OutfitDetailScreen.tsx` vollständig ersetzen:

```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { FilePicker } from '../components/FilePicker';
import { Icon } from '../components/Icon';
import { ItemGrid } from '../components/ItemGrid';
import { NotFound } from '../components/NotFound';
import { OutfitPhotoPicker } from '../components/OutfitPhotoPicker';
import { OutfitPreview } from '../components/OutfitPreview';
import { OutfitSeasons } from '../components/OutfitSeasons';
import { getItemsByIds } from '../db/items';
import { deleteOutfit, getOutfit, getOutfitPhoto, removeOutfitPhoto, setOutfitPhoto } from '../db/outfits';
import { plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { processPhoto } from '../lib/image';
import { navigate } from '../lib/route';
import { useObjectUrl } from '../lib/useObjectUrl';

const SAVED_NOTICE_MS = 3500;

export function OutfitDetailScreen({ outfitId, justSaved = false }: { outfitId: string; justSaved?: boolean }) {
  const outfit = useLiveQuery(async () => (await getOutfit(outfitId)) ?? null, [outfitId]);
  const items = useLiveQuery(async () => (outfit ? getItemsByIds(outfit.itemIds) : []), [outfit]);
  const photo = useLiveQuery(async () => (await getOutfitPhoto(outfitId)) ?? null, [outfitId]);
  const photoUrl = useObjectUrl(photo?.full);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmingPhoto, setConfirmingPhoto] = useState(false);

  useEffect(() => {
    if (!photoSaved) return undefined;
    const timer = setTimeout(() => setPhotoSaved(false), SAVED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [photoSaved]);

  if (outfit === undefined || items === undefined || photo === undefined) return null;
  if (outfit === null) return <NotFound text="Dieses Outfit gibt es nicht mehr." backTo="/outfits" />;

  async function remove() {
    setConfirming(false);
    try {
      await deleteOutfit(outfitId);
      navigate('/outfits', { replace: true });
    } catch (e) {
      setError(userMessage(e));
    }
  }

  async function pickPhoto(file: File) {
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      await setOutfitPhoto(outfitId, await processPhoto(file, { anchor: 'top' }));
      setPhotoSaved(true);
    } catch (e) {
      setPhotoError(userMessage(e));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function dropPhoto() {
    setConfirmingPhoto(false);
    try {
      await removeOutfitPhoto(outfitId);
    } catch (e) {
      setPhotoError(userMessage(e));
    }
  }

  return (
    <section className="screen-content">
      <header className="form-header">
        <a className="text-button text-button--back" href="#/outfits">
          <Icon name="back" size={20} />
          Outfits
        </a>
      </header>
      {photo ? (
        photoUrl ? (
          <img className="photo photo--full look-photo" src={photoUrl} alt={`Du im Look „${outfit.name}“`} />
        ) : (
          <div className="photo photo--loading look-photo" aria-hidden="true" />
        )
      ) : (
        items.length > 0 && <OutfitPreview itemIds={items.map((item) => item.id)} />
      )}
      {/* Das eingenähte Etikett des Outfits, an die Unterkante des Looks genäht: Name, Anzahl, wann es unter „Heute“ erscheint */}
      <div className={`care-label care-label--outfit${justSaved ? ' care-label--new' : ''}`}>
        <h1 className="care-label__title">{outfit.name}</h1>
        <p className="care-label__kind">{plural(items.length, 'Teil', 'Teile')}</p>
        <OutfitSeasons itemIds={outfit.itemIds} items={items} />
      </div>
      {photo ? (
        <div className="look-photo__actions">
          <FilePicker className="quiet-link" label="Foto ändern" accept="image/*" onPick={(file) => void pickPhoto(file)} disabled={photoBusy}>
            {photoBusy ? 'Foto wird vorbereitet …' : 'Foto ändern'}
          </FilePicker>
          <button type="button" className="quiet-link" onClick={() => setConfirmingPhoto(true)}>
            Foto entfernen
          </button>
        </div>
      ) : (
        <OutfitPhotoPicker label="Zeig, wie du den Look trägst" text="Zeig, wie du den Look trägst" busy={photoBusy} onPick={(file) => void pickPhoto(file)} />
      )}
      {photoError && <p className="error" role="alert">{photoError}</p>}
      {items.length === 0 ? (
        <p className="muted">Keine Teile mehr – alle Teile dieses Outfits wurden gelöscht.</p>
      ) : (
        <>
          <h2 className="section-title">Teile</h2>
          <ItemGrid items={items} onItemClick={(item) => navigate(`/item/${item.id}`)} />
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="detail-actions">
        <button type="button" className="button button--wide" onClick={() => navigate(`/outfit/${outfitId}/edit`)}>
          Bearbeiten
        </button>
        <button type="button" className="text-button text-button--danger" onClick={() => setConfirming(true)}>
          Löschen
        </button>
      </div>

      {photoSaved && <p className="toast" role="status">Foto gespeichert</p>}

      {confirming && (
        <ConfirmSheet
          title="Outfit löschen?"
          message={`„${outfit.name}“ wird gelöscht. Die Teile bleiben in deinem Schrank.`}
          confirmLabel="Löschen"
          destructive
          onConfirm={() => void remove()}
          onCancel={() => setConfirming(false)}
        />
      )}
      {confirmingPhoto && (
        <ConfirmSheet
          title="Foto entfernen?"
          message="Das Foto von dir im Look wird gelöscht. Das Outfit und seine Teile bleiben."
          confirmLabel="Entfernen"
          cancelLabel="Behalten"
          destructive
          onConfirm={() => void dropPhoto()}
          onCancel={() => setConfirmingPhoto(false)}
        />
      )}
    </section>
  );
}
```

Hinweis zur Reihenfolge: Das Etikett wird – wie bisher an die Collage – an die Unterkante des Tragebilds genäht; die Links „Foto ändern“ · „Foto entfernen“ stehen direkt darunter (Spec §6, „Etikett angenäht“).

`src/styles.css` – nach `.outfit-preview + .care-label--outfit { margin: -14px 8px 0; }` einfügen:

```css
.look-photo { width: 100%; max-height: 70vh; }
.look-photo + .care-label--outfit { margin: -14px 8px 0; }
.look-photo__actions { display: flex; gap: 24px; margin-top: 6px; }
.look-photo__actions .quiet-link { display: inline-flex; align-items: center; }
.look-picker { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 88px; margin-top: 16px; padding: 12px 16px; border: 1.5px dashed var(--line-strong); border-radius: var(--radius); color: var(--muted); font-size: 15px; text-align: center; cursor: pointer; }
.look-picker:focus-within { outline: 2px solid var(--thread); outline-offset: 2px; }
.look-picker--busy { cursor: progress; opacity: 0.7; }
```

- [ ] **Step 4: Run tests** – `npx vitest run src/screens/OutfitPhoto.test.tsx src/screens/Outfits.test.tsx` → PASS; `npm test`, `npx tsc --noEmit` → grün.

- [ ] **Step 5: Commit**

```bash
git add src/components/OutfitPhotoPicker.tsx src/screens/OutfitDetailScreen.tsx src/styles.css src/screens/OutfitPhoto.test.tsx
git commit -m "feat(outfits): wear photo on the outfit detail with add, change and remove

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Tragebild im Editor (Namens-Schritt)

**Files:**
- Modify: `src/screens/OutfitEditorScreen.tsx`, `src/styles.css`
- Test: `src/screens/OutfitPhoto.test.tsx`

**Interfaces:**
- Consumes: `createOutfit(name, ids, photo?)`, `updateOutfit(id, name, ids, photo?: PhotoChange)`, `getOutfitPhoto` (Task 2); `processPhoto(file, { anchor: 'top' })` (Task 3); `OutfitPhotoPicker` (Task 6); `PhotoBlobs` aus `../db/items`; `useObjectUrl`.

- [ ] **Step 1: Write the failing tests** – an `src/screens/OutfitPhoto.test.tsx` anhängen:

```tsx
describe('Editor: Foto von dir im Look', () => {
  async function toNameStep(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole('button', { name: 'Oberteil' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
  }

  it('saves a new outfit together with its photo', async () => {
    await seedItem({ category: 'top' });
    const user = userEvent.setup();
    open('/outfit/new');
    await toNameStep(user);
    await user.upload(screen.getByLabelText('Foto von dir im Look'), selfie());
    expect(await screen.findByRole('img', { name: 'Vorschau: du im Look' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name des Outfits'), 'Spiegel-Look');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    const heading = await screen.findByRole('heading', { name: 'Spiegel-Look' });
    expect(heading).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Du im Look „Spiegel-Look“' })).toBeInTheDocument();
  });

  it('keeps the existing photo when only renaming', async () => {
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Alt', [a], fakePhoto('bleibt'));
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    expect(await screen.findByRole('img', { name: 'Vorschau: du im Look' })).toBeInTheDocument();
    const name = screen.getByLabelText('Name des Outfits');
    await user.clear(name);
    await user.type(name, 'Neu');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    await screen.findByRole('heading', { name: 'Neu' });
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('bleibt-full');
  });

  it('removes the photo only when saving', async () => {
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Look', [a], fakePhoto('weg'));
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    await user.click(await screen.findByRole('button', { name: 'Entfernen' }));
    expect(await getOutfitPhoto(id)).toBeDefined();
    expect(screen.getByLabelText('Foto von dir im Look')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    await screen.findByRole('heading', { name: 'Look' });
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('asks before discarding a chosen photo', async () => {
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Look', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    await user.upload(screen.getByLabelText('Foto von dir im Look'), selfie());
    await screen.findByRole('img', { name: 'Vorschau: du im Look' });
    await user.click(screen.getByRole('button', { name: 'Zurück' }));
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(await screen.findByRole('dialog', { name: 'Änderungen verwerfen?' })).toBeInTheDocument();
  });

  it('keeps name and selection when the photo cannot be read', async () => {
    vi.mocked(processPhoto).mockRejectedValueOnce(new PhotoError('kaputt'));
    await seedItem({ category: 'top' });
    const user = userEvent.setup();
    open('/outfit/new');
    await toNameStep(user);
    await user.type(screen.getByLabelText('Name des Outfits'), 'Trotzdem');
    await user.upload(screen.getByLabelText('Foto von dir im Look'), selfie());
    expect(await screen.findByRole('alert')).toHaveTextContent('Dieses Foto konnte nicht geladen werden');
    expect(screen.getByLabelText('Name des Outfits')).toHaveValue('Trotzdem');
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeEnabled();
  });
});
```

(Der Kachel-Name „Oberteil“ entsteht aus `tileLabel` für ein Teil der Kategorie `top` ohne Farben; falls der Test ihn nicht findet, mit `screen.debug()` den tatsächlichen Namen prüfen und im Helfer anpassen.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/screens/OutfitPhoto.test.tsx` → FAIL (kein Feld „Foto von dir im Look“).

- [ ] **Step 3: Implement** – in `src/screens/OutfitEditorScreen.tsx`:

Imports ergänzen:

```tsx
import { OutfitPhotoPicker } from '../components/OutfitPhotoPicker';
import type { PhotoBlobs } from '../db/items';
import { createOutfit, getOutfit, getOutfitPhoto, updateOutfit, type PhotoChange } from '../db/outfits';
import { processPhoto } from '../lib/image';
import { useObjectUrl } from '../lib/useObjectUrl';
```

(Die bisherige Zeile `import { createOutfit, getOutfit, updateOutfit } from '../db/outfits';` wird dadurch ersetzt.)

Nach `const savingRef = useRef(false);` einfügen (alle Hooks **vor** dem ersten `return`):

```tsx
  const existingPhoto = useLiveQuery(async () => (outfitId ? (await getOutfitPhoto(outfitId)) ?? null : null), [outfitId]);
  // Neu gewähltes Foto (Entwurf) und ob das gespeicherte Foto entfernt werden soll; wirksam erst beim Speichern.
  const [photo, setPhoto] = useState<PhotoBlobs | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const shownPhoto = photo?.full ?? (photoRemoved ? undefined : existingPhoto?.full);
  const photoUrl = useObjectUrl(shownPhoto);
```

Die Lade-Bedingung erweitern:

```tsx
  if (items === undefined || existingPhoto === undefined || (outfitId && existing === undefined)) return null;
```

`canSave` und `dirty` ersetzen:

```tsx
  const canSave = name.trim().length > 0 && selected.length > 0 && !saving && !processingPhoto;
  const dirty =
    !sameSet(selected, existing?.itemIds ?? []) ||
    name.trim() !== (existing?.name ?? '') ||
    photo !== null ||
    photoRemoved;
```

Nach `const selectedItems = …` einfügen:

```tsx
  async function pickPhoto(file: File) {
    setPhotoError(null);
    setProcessingPhoto(true);
    try {
      setPhoto(await processPhoto(file, { anchor: 'top' }));
      setPhotoRemoved(false);
    } catch (e) {
      setPhotoError(userMessage(e));
    } finally {
      setProcessingPhoto(false);
    }
  }

  function dropPhoto() {
    setPhoto(null);
    setPhotoRemoved(Boolean(existingPhoto));
  }

  const photoChange: PhotoChange = photo ?? (photoRemoved ? null : undefined);
```

In `save()` die beiden Aufrufe ersetzen:

```tsx
        await updateOutfit(outfitId, name, selected, photoChange);
```

```tsx
        const id = await createOutfit(name, selected, photo ?? undefined);
```

Im Namens-Schritt `<OutfitPreview itemIds={selected} />` ersetzen durch:

```tsx
        {photoUrl ? (
          <img className="photo photo--full look-photo look-photo--draft" src={photoUrl} alt="Vorschau: du im Look" />
        ) : (
          <OutfitPreview itemIds={selected} />
        )}
```

und nach dem `</label>` des Namensfelds (vor `{error && …}`) einfügen:

```tsx
        <div className="field">
          <span className="section-title">
            Foto von dir im Look <span className="section-meta">optional</span>
          </span>
          {shownPhoto ? (
            <div className="look-photo__actions">
              <FilePicker className="quiet-link" label="Foto von dir im Look ändern" accept="image/*" onPick={(file) => void pickPhoto(file)} disabled={processingPhoto}>
                {processingPhoto ? 'Foto wird vorbereitet …' : 'Ändern'}
              </FilePicker>
              <button type="button" className="quiet-link" onClick={dropPhoto}>Entfernen</button>
            </div>
          ) : (
            <OutfitPhotoPicker label="Foto von dir im Look" text="Zeig, wie du den Look trägst" busy={processingPhoto} onPick={(file) => void pickPhoto(file)} />
          )}
          {photoError && <p className="error" role="alert">{photoError}</p>}
        </div>
```

`FilePicker` importieren: `import { FilePicker } from '../components/FilePicker';`.

Hinweis im Aktionsbalken ergänzen – die Zeile mit `action-bar__hint` ersetzen:

```tsx
          {processingPhoto ? (
            <p className="action-bar__hint">Foto wird vorbereitet …</p>
          ) : (
            !name.trim() && <p className="action-bar__hint">Noch ein Name, dann ist der Look gespeichert.</p>
          )}
```

`src/styles.css` – nach `.form > .outfit-preview { width: min(62%, 260px); }` einfügen:

```css
.form > .look-photo--draft { width: min(62%, 260px); max-height: 40vh; }
.form > .look-photo--draft + .outfit-seasons { margin-top: 10px; }
.form .look-picker { margin-top: 0; }
```

- [ ] **Step 4: Run tests** – `npx vitest run src/screens/OutfitPhoto.test.tsx src/screens/Outfits.test.tsx` → PASS; `npm test`, `npx tsc --noEmit` → grün.

- [ ] **Step 5: Commit**

```bash
git add src/screens/OutfitEditorScreen.tsx src/styles.css src/screens/OutfitPhoto.test.tsx
git commit -m "feat(outfits): attach a wear photo while naming a look

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Browser-Prüfung, Detector und Doku

**Files:**
- Modify: `DESIGN.md`, `CLAUDE.md`, `HANDOFF.md`, ggf. `src/styles.css` (nur Befunde aus der Prüfung)

- [ ] **Step 1: Build und Tests**

Run: `npm test` und `npm run build`
Expected: alle Tests grün, Build ohne Fehler.

- [ ] **Step 2: Echte Bildverarbeitung im Browser prüfen** – Dev-Server über `.claude/launch.json` (`dev`) starten, http://localhost:5173/kleiderschrank/ öffnen und in der Konsole:

```js
const { processPhoto } = await import('/kleiderschrank/src/lib/image.ts');
const c = Object.assign(document.createElement('canvas'), { width: 1080, height: 1920 });
const g = c.getContext('2d'); g.fillStyle = '#c00'; g.fillRect(0, 0, 1080, 200); g.fillStyle = '#00c'; g.fillRect(0, 200, 1080, 1720);
const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg'));
const { thumb } = await processPhoto(blob, { anchor: 'top' });
const bmp = await createImageBitmap(thumb);
const t = Object.assign(document.createElement('canvas'), { width: bmp.width, height: bmp.height });
t.getContext('2d').drawImage(bmp, 0, 0);
[bmp.width, bmp.height, [...t.getContext('2d').getImageData(180, 5, 1, 1).data]];
```

Expected: `[360, 480, [~204, 0, 0, 255]]` – der rote obere Streifen ist im Vorschaubild erhalten.

- [ ] **Step 3: Sichtprüfung in Handygröße (375×812), hell und dunkel** – Demo-Daten anlegen (wie in `scripts/capture-review.mjs`), einem Outfit im Detail ein Foto geben und prüfen: Detail (Foto oben, Etikett angenäht, Links, Teile einmal), Outfit-Liste und „Heute“ (Foto statt Collage, gleiche Höhe wie Collagen), Editor-Namens-Schritt (Rahmen, Vorschau, „optional“). Gefundene Darstellungsfehler in `src/styles.css` beheben (ein Durchgang, dann eine Bestätigungsrunde).

- [ ] **Step 4: Detector**

Run: `"C:/Users/harin/.claude/plugins/cache/impeccable/impeccable/4.5.2/skills/impeccable/scripts/impeccable" detect --json src index.html`
Expected: `[]` (Exit 0). Befunde beheben oder begründen.

- [ ] **Step 5: Doku nachziehen**

- `DESIGN.md`, Abschnitt „Components“: neue Unterabschnitte „Outfit Look (wear photo)“ (3:4-Vorschau oben bündig, ersetzt die Collage überall; im Detail Vollbild bis 70vh, Etikett angenäht, leise Links „Foto ändern“ · „Foto entfernen“) und „Look Picker“ (1.5px gestrichelter Rahmen in `line-strong`, Kamera-Symbol, ganze Fläche antippbar, min. 88px hoch).
- `CLAUDE.md`, Abschnitt „Regeln“: Schema jetzt Version 2 (`outfitPhotos`); Backup-Format v1 mit optionalem Schlüssel `outfitPhotos: [{ outfitId, full }]`; Tragebilder oben bündig zugeschnitten. Abschnitt „Gestaltung“: Satz „Outfits erscheinen als Collage (`OutfitPreview`)“ ergänzen um „oder, falls vorhanden, als Tragebild (`OutfitLook`)“. Struktur-Liste: `OutfitLook`, `OutfitPhotoPicker` ergänzen.
- `HANDOFF.md`, Abschnitt 4: Eintrag „Erledigt (11.10.): Tragebild für Outfits“ mit Verweis auf Spec und Plan; nächster Schritt: die übrigen Kritik-Punkte (layout/distill, clarify, distill/quieter, layout/adapt, onboard, Etikett-Welt ganz durchziehen).

- [ ] **Step 6: Commit**

```bash
git add DESIGN.md CLAUDE.md HANDOFF.md src/styles.css
git commit -m "docs: record the outfit wear photo (schema v2, outfitPhotos, look picker)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
