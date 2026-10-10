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
    ['#/settings/backup', { name: 'settingsBackup' }],
    ['#/irgendwas/ganz/anderes', { name: 'wardrobe' }],
    ['#/item/abc/edit/zuviel', { name: 'wardrobe' }],
  ])('parses %s', (hash, expected) => {
    expect(parseRoute(hash)).toEqual(expected);
  });

  it('maps routes to tabs', () => {
    expect(tabOf({ name: 'item', id: 'a' })).toBe('wardrobe');
    expect(tabOf({ name: 'outfitEdit', id: 'a' })).toBe('outfits');
    expect(tabOf({ name: 'settings' })).toBe('settings');
    expect(tabOf({ name: 'settingsBackup' })).toBe('settings');
  });

  it('falls back to the wardrobe for a malformed address', () => {
    expect(parseRoute('#/item/%E0')).toEqual({ name: 'wardrobe' });
  });
});
