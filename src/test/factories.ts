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
