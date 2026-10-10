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
