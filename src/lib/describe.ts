import type { Item } from '../db/schema';
import { CATEGORIES, COLORS, labelOf } from './constants';

export function describeItem(item: Pick<Item, 'category' | 'colors'>): string {
  const category = labelOf(CATEGORIES, item.category);
  const colors = item.colors.map((c) => labelOf(COLORS, c));
  return colors.length > 0 ? `${category}, ${colors.join(', ')}` : category;
}

const TITLE_MAX = 40;

/** Name eines Teils: erste Zeile der Notiz (gekürzt), sonst die Kategorie. */
export function itemTitle(item: Pick<Item, 'category' | 'note'>): string {
  const first = item.note.split('\n')[0].trim();
  if (!first) return labelOf(CATEGORIES, item.category);
  return first.length > TITLE_MAX ? `${first.slice(0, TITLE_MAX - 1)}…` : first;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
