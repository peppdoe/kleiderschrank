import { describe, expect, it } from 'vitest';
import { makeItem } from '../test/factories';
import { EMPTY_FILTER, applyFilter, isFilterActive, matchesFilter, toggleValue } from './filters';

const blueWinterTop = makeItem({ id: 'a', category: 'top', colors: ['blue'], seasons: ['winter'] });
const redSummerTop = makeItem({ id: 'b', category: 'top', colors: ['red', 'white'], seasons: ['summer'] });
const blackPants = makeItem({ id: 'c', category: 'pants', colors: ['black'], seasons: [] });
const all = [blueWinterTop, redSummerTop, blackPants];

describe('filters', () => {
  it('returns everything for the empty filter', () => {
    expect(applyFilter(all, EMPTY_FILTER)).toEqual(all);
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
  });

  it('combines values within one dimension with OR', () => {
    const result = applyFilter(all, { ...EMPTY_FILTER, colors: ['blue', 'black'] });
    expect(result.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('combines dimensions with AND', () => {
    const f = { categories: ['top' as const], colors: ['blue' as const], seasons: ['winter' as const] };
    expect(applyFilter(all, f).map((i) => i.id)).toEqual(['a']);
    expect(isFilterActive(f)).toBe(true);
  });

  it('matches multi-colour items if any colour is selected', () => {
    expect(matchesFilter(redSummerTop, { ...EMPTY_FILTER, colors: ['white'] })).toBe(true);
  });

  it('keeps items without seasons when a season is selected, because they are year-round', () => {
    expect(matchesFilter(blackPants, { ...EMPTY_FILTER, seasons: ['winter'] })).toBe(true);
  });

  it('still excludes items tagged only for other seasons', () => {
    expect(matchesFilter(redSummerTop, { ...EMPTY_FILTER, seasons: ['winter'] })).toBe(false);
  });

  it('returns an empty list when nothing matches', () => {
    expect(applyFilter(all, { ...EMPTY_FILTER, categories: ['dress'] })).toEqual([]);
  });

  it('toggles values without mutating the input', () => {
    const list = ['a', 'b'];
    expect(toggleValue(list, 'c')).toEqual(['a', 'b', 'c']);
    expect(toggleValue(list, 'a')).toEqual(['b']);
    expect(list).toEqual(['a', 'b']);
  });
});
