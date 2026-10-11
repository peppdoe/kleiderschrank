import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { db, WardrobeDB } from './schema';

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
