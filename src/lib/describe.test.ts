import { describe, expect, it } from 'vitest';
import { describeItem, itemTitle, plural } from './describe';

describe('describeItem', () => {
  it('names category and colours', () => {
    expect(describeItem({ category: 'top', colors: ['blue', 'white'] })).toBe('Oberteil, Blau, Weiß');
  });

  it('names only the category when there are no colours', () => {
    expect(describeItem({ category: 'shoes', colors: [] })).toBe('Schuhe');
  });
});

describe('itemTitle', () => {
  it('uses the first line of the note as the name of the piece', () => {
    expect(itemTitle({ category: 'pants', note: 'Lieblingsjeans\nvon Mama' })).toBe('Lieblingsjeans');
  });

  it('falls back to the category and shortens very long notes', () => {
    expect(itemTitle({ category: 'bag', note: '' })).toBe('Tasche');
    expect(itemTitle({ category: 'bag', note: 'x'.repeat(60) })).toBe(`${'x'.repeat(39)}…`);
  });
});

describe('plural', () => {
  it('uses singular only for exactly one', () => {
    expect(plural(1, 'Teil', 'Teile')).toBe('1 Teil');
    expect(plural(0, 'Teil', 'Teile')).toBe('0 Teile');
    expect(plural(12, 'Outfit', 'Outfits')).toBe('12 Outfits');
  });
});
