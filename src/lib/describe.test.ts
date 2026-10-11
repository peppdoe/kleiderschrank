import { describe, expect, it } from 'vitest';
import { describeItem, itemTitle, plural, sinceBackup } from './describe';

describe('describeItem', () => {
  it('names category and colours', () => {
    expect(describeItem({ category: 'top', colors: ['blue', 'white'] })).toBe('Oberteil, Blau, Weiß');
  });

  it('names only the category when there are no colours', () => {
    expect(describeItem({ category: 'shoes', colors: [] })).toBe('Schuhe');
  });
});

describe('itemTitle', () => {
  it('never turns the note into a title: without a name it is the category', () => {
    expect(itemTitle({ category: 'pants', note: 'Lieblingsjeans\nvon Mama' })).toBe('Hose');
    expect(itemTitle({ category: 'bag', note: '' })).toBe('Tasche');
  });
});

describe('plural', () => {
  it('uses singular only for exactly one', () => {
    expect(plural(1, 'Teil', 'Teile')).toBe('1 Teil');
    expect(plural(0, 'Teil', 'Teile')).toBe('0 Teile');
    expect(plural(12, 'Look', 'Looks')).toBe('12 Looks');
  });
});

describe('sinceBackup', () => {
  const now = new Date('2026-10-11T09:00:00');
  it('says today, yesterday or how many days ago', () => {
    expect(sinceBackup('2026-10-11T07:00:00', now)).toBe('heute');
    expect(sinceBackup('2026-10-10T22:00:00', now)).toBe('gestern');
    expect(sinceBackup('2026-10-08T12:00:00', now)).toBe('vor 3 Tagen');
  });
  it('falls back to the date after two weeks', () => {
    expect(sinceBackup('2026-09-01T12:00:00', now)).toBe('am 1.9.2026');
  });
});

describe('itemTitle with a name', () => {
  it('prefers the name Lena gave the piece over the note', () => {
    expect(itemTitle({ category: 'top', note: 'Vintage-Fund', name: 'Grüne Strickjacke' })).toBe('Grüne Strickjacke');
  });
});
