import { describe, expect, it } from 'vitest';
import { describeItem, plural } from './describe';

describe('describeItem', () => {
  it('names category and colours', () => {
    expect(describeItem({ category: 'top', colors: ['blue', 'white'] })).toBe('Oberteil, Blau, Weiß');
  });

  it('names only the category when there are no colours', () => {
    expect(describeItem({ category: 'shoes', colors: [] })).toBe('Schuhe');
  });
});

describe('plural', () => {
  it('uses singular only for exactly one', () => {
    expect(plural(1, 'Teil', 'Teile')).toBe('1 Teil');
    expect(plural(0, 'Teil', 'Teile')).toBe('0 Teile');
    expect(plural(12, 'Outfit', 'Outfits')).toBe('12 Outfits');
  });
});
