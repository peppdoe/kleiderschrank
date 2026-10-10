import type { Item } from '../db/schema';
import type { CategoryId, ColorId, SeasonId } from './constants';

export interface FilterState {
  categories: CategoryId[];
  colors: ColorId[];
  seasons: SeasonId[];
}

export const EMPTY_FILTER: FilterState = { categories: [], colors: [], seasons: [] };

export function isFilterActive(filter: FilterState): boolean {
  return filter.categories.length + filter.colors.length + filter.seasons.length > 0;
}

export function matchesFilter(item: Item, filter: FilterState): boolean {
  if (filter.categories.length > 0 && !filter.categories.includes(item.category)) return false;
  if (filter.colors.length > 0 && !item.colors.some((c) => filter.colors.includes(c))) return false;
  if (filter.seasons.length > 0 && !item.seasons.some((s) => filter.seasons.includes(s))) return false;
  return true;
}

export function applyFilter(items: Item[], filter: FilterState): Item[] {
  return items.filter((item) => matchesFilter(item, filter));
}

export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
