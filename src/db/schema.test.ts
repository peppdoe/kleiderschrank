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
