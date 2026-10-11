import { describe, expect, it } from 'vitest';
import type { Outfit } from '../db/schema';
import { makeItem } from '../test/factories';
import { describeOutfitSeasons, outfitSeasons, outfitsForSeason } from './today';

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

describe('outfitSeasons', () => {
  it('lists the seasons all seasonal pieces share, in calendar order', () => {
    const scarf = makeItem({ id: 'scarf', seasons: ['winter', 'spring', 'autumn'] });
    expect(outfitSeasons(['scarf', 'coat', 'jeans'], [...items, scarf])).toEqual(['autumn', 'winter']);
  });

  it('is the whole year when no piece names a season', () => {
    expect(outfitSeasons(['jeans'], items)).toEqual(['spring', 'summer', 'autumn', 'winter']);
  });

  it('is empty when the pieces share no season', () => {
    expect(outfitSeasons(['coat', 'sandals'], items)).toEqual([]);
  });

  it('is empty without remaining pieces', () => {
    expect(outfitSeasons(['gone'], items)).toEqual([]);
  });
});

describe('describeOutfitSeasons', () => {
  it('names one or more seasons', () => {
    expect(describeOutfitSeasons(['summer'])).toBe('Erscheint im Sommer');
    expect(describeOutfitSeasons(['autumn', 'winter'])).toBe('Erscheint im Herbst und Winter');
    expect(describeOutfitSeasons(['spring', 'summer', 'autumn'])).toBe('Erscheint im Frühling, Sommer und Herbst');
  });

  it('says the whole year for all four seasons', () => {
    expect(describeOutfitSeasons(['spring', 'summer', 'autumn', 'winter'])).toBe('Erscheint das ganze Jahr');
  });

  it('explains when the outfit never shows up', () => {
    expect(describeOutfitSeasons([])).toBe('Die Teile teilen keine Saison, darum taucht der Look unter „Heute“ nicht auf.');
  });
});
