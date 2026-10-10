import { createItem, type ItemInput, type PhotoBlobs } from '../db/items';
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

export function fakePhoto(label = 'photo'): PhotoBlobs {
  return {
    full: new Blob([`${label}-full`], { type: 'image/jpeg' }),
    thumb: new Blob([`${label}-thumb`], { type: 'image/jpeg' }),
  };
}

export function seedItem(input: Partial<ItemInput> = {}): Promise<string> {
  return createItem({ category: 'top', colors: [], seasons: [], note: '', ...input }, fakePhoto());
}
