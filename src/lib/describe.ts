import type { Item } from '../db/schema';
import { CATEGORIES, COLORS, labelOf } from './constants';

export function describeItem(item: Pick<Item, 'category' | 'colors'>): string {
  const category = labelOf(CATEGORIES, item.category);
  const colors = item.colors.map((c) => labelOf(COLORS, c));
  return colors.length > 0 ? `${category}, ${colors.join(', ')}` : category;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
