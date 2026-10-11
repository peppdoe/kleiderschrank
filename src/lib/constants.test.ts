import { describe, expect, it } from 'vitest';
import { CATEGORIES, COLORS, SEASONS, isCategoryId, isColorId, isSeasonId, labelOf } from './constants';

describe('constants', () => {
  it('has the agreed options in order', () => {
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      'Oberteil', 'Hose', 'Rock', 'Kleid', 'Jacke & Mantel', 'Schuhe', 'Tasche', 'Accessoire', 'Sonstiges',
    ]);
    expect(COLORS.map((c) => c.label)).toEqual([
      'Schwarz', 'Weiß', 'Grau', 'Beige', 'Braun', 'Rot', 'Rosa', 'Orange', 'Gelb', 'Grün', 'Blau', 'Lila', 'Gemustert', 'Metallic',
    ]);
    expect(SEASONS.map((s) => s.label)).toEqual(['Frühling', 'Sommer', 'Herbst', 'Winter']);
  });

  it('looks up labels and falls back to the id', () => {
    expect(labelOf(CATEGORIES, 'jacket')).toBe('Jacke & Mantel');
    expect(labelOf(COLORS, 'unknown')).toBe('unknown');
  });

  it('validates ids', () => {
    expect(isCategoryId('shoes')).toBe(true);
    expect(isCategoryId('hat')).toBe(false);
    expect(isColorId('blue')).toBe(true);
    expect(isColorId(42)).toBe(false);
    expect(isSeasonId('winter')).toBe(true);
    expect(isSeasonId('Winter')).toBe(false);
  });
});
