import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CategoryId, ColorId } from '../lib/constants';
import { fakePhoto } from '../test/factories';
import {
  countItems, createItem, deleteItem, getItem, getItemsByIds, getPhoto, listItems, setFavorite, updateItem,
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

describe('setFavorite', () => {
  it('marks and unmarks a favorite and keeps it through edits', async () => {
    const id = await createItem(input, fakePhoto());
    expect((await getItem(id))!.favorite).toBeFalsy();
    await setFavorite(id, true);
    expect((await getItem(id))!.favorite).toBe(true);
    await updateItem(id, { ...input, note: 'neu' });
    expect((await getItem(id))!.favorite).toBe(true);
    await setFavorite(id, false);
    expect((await getItem(id))!.favorite).toBeFalsy();
  });
});
