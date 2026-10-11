import type { Item } from '../db/schema';
import type { CategoryId, ColorId, SeasonId } from './constants';

export interface FilterState {
  categories: CategoryId[];
  colors: ColorId[];
  seasons: SeasonId[];
  /** Nur Lieblingsteile zeigen. */
  favorites?: boolean;
}

export const EMPTY_FILTER: FilterState = { categories: [], colors: [], seasons: [] };

export function isFilterActive(filter: FilterState): boolean {
  return filter.categories.length + filter.colors.length + filter.seasons.length > 0 || filter.favorites === true;
}

export function matchesFilter(item: Item, filter: FilterState): boolean {
  if (filter.favorites && !item.favorite) return false;
  if (filter.categories.length > 0 && !filter.categories.includes(item.category)) return false;
  if (filter.colors.length > 0 && !item.colors.some((c) => filter.colors.includes(c))) return false;
  // Teile ohne Saison sind ganzjährig und passen zu jeder Saison.
  if (filter.seasons.length > 0 && item.seasons.length > 0 && !item.seasons.some((s) => filter.seasons.includes(s))) return false;
  return true;
}

export function applyFilter(items: Item[], filter: FilterState): Item[] {
  return items.filter((item) => matchesFilter(item, filter));
}

/**
 * Wie viele Teile jede Kategorie und Farbe hätte, gezählt unter den übrigen Filtern
 * (die eigene Gruppe zählt nicht mit, sonst könnte man nichts dazuwählen). Nur Werte mit Treffern.
 */
export function facetCounts(items: Item[], filter: FilterState): { categories: Map<CategoryId, number>; colors: Map<ColorId, number> } {
  const categories = new Map<CategoryId, number>();
  for (const item of applyFilter(items, { ...filter, categories: [] })) {
    categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
  }
  const colors = new Map<ColorId, number>();
  for (const item of applyFilter(items, { ...filter, colors: [] })) {
    for (const color of item.colors) colors.set(color, (colors.get(color) ?? 0) + 1);
  }
  return { categories, colors };
}

export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
