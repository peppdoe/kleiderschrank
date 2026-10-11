import type { Item } from '../db/schema';
import { CATEGORIES, COLORS, labelOf } from './constants';

export function describeItem(item: Pick<Item, 'category' | 'colors'>): string {
  const category = labelOf(CATEGORIES, item.category);
  const colors = item.colors.map((c) => labelOf(COLORS, c));
  return colors.length > 0 ? `${category}, ${colors.join(', ')}` : category;
}

const TITLE_MAX = 40;

/** Name eines Teils: der eigene Name, sonst die erste Zeile der Notiz (gekürzt), sonst die Kategorie. */
export function itemTitle(item: Pick<Item, 'category' | 'note' | 'name'>): string {
  if (item.name) return item.name;
  const first = item.note.split('\n')[0].trim();
  if (!first) return labelOf(CATEGORIES, item.category);
  return first.length > TITLE_MAX ? `${first.slice(0, TITLE_MAX - 1)}…` : first;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Wann zuletzt gesichert wurde, in Alltagssprache: „heute“, „gestern“, „vor 3 Tagen“, später „am 1.9.2026“. */
export function sinceBackup(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(then)) / DAY);
  if (days <= 0) return 'heute';
  if (days === 1) return 'gestern';
  if (days < 14) return `vor ${days} Tagen`;
  return `am ${then.toLocaleDateString('de-DE')}`;
}
