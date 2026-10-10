import { describe, expect, it } from 'vitest';
import type { Outfit } from '../db/schema';
import { makeItem } from '../test/factories';
import { outfitsForSeason } from './today';

const stamp = '2026-01-01T00:00:00.000Z';
const outfit = (id: string, itemIds: string[]): Outfit => ({ id, name: id, itemIds, createdAt: stamp, updatedAt: stamp });

const coat = makeItem({ id: 'coat', seasons: ['autumn', 'winter'] });
const jeans = makeItem({ id: 'jeans', seasons: [] });
const sandals = makeItem({ id: 'sandals', seasons: ['summer'] });
const items = [coat, jeans, sandals];

describe('outfitsForSeason', () => {
  it('keeps outfits whose seasonal pieces all fit the season', () => {
    const result = outfitsForSeason([outfit('herbst', ['coat', 'jeans']), outfit('sommer', ['sandals', 'jeans'])], items, 'autumn');
    expect(result.map((o) => o.id)).toEqual(['herbst']);
  });

  it('treats pieces without seasons as always fitting', () => {
    expect(outfitsForSeason([outfit('basic', ['jeans'])], items, 'summer').map((o) => o.id)).toEqual(['basic']);
  });

  it('skips outfits without any remaining items', () => {
    expect(outfitsForSeason([outfit('leer', []), outfit('weg', ['gone'])], items, 'autumn')).toEqual([]);
  });

  it('ignores deleted pieces when judging the season', () => {
    expect(outfitsForSeason([outfit('mix', ['coat', 'gone'])], items, 'winter').map((o) => o.id)).toEqual(['mix']);
  });
});
