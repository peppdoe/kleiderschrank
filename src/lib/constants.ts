export const CATEGORIES = [
  { id: 'top', label: 'Oberteil' },
  { id: 'pants', label: 'Hose' },
  { id: 'skirt', label: 'Rock' },
  { id: 'dress', label: 'Kleid' },
  { id: 'jacket', label: 'Jacke/Mantel' },
  { id: 'shoes', label: 'Schuhe' },
  { id: 'bag', label: 'Tasche' },
  { id: 'accessory', label: 'Accessoire' },
  { id: 'other', label: 'Sonstiges' },
] as const;

export const COLORS = [
  { id: 'black', label: 'Schwarz', swatch: '#1c1c1e' },
  { id: 'white', label: 'Weiß', swatch: '#ffffff' },
  { id: 'grey', label: 'Grau', swatch: '#8e8e93' },
  { id: 'beige', label: 'Beige', swatch: '#e8d8bd' },
  { id: 'brown', label: 'Braun', swatch: '#8b5a2b' },
  { id: 'red', label: 'Rot', swatch: '#e0262f' },
  { id: 'pink', label: 'Rosa', swatch: '#f4a6c1' },
  { id: 'orange', label: 'Orange', swatch: '#f28c28' },
  { id: 'yellow', label: 'Gelb', swatch: '#f5d327' },
  { id: 'green', label: 'Grün', swatch: '#3a9d4f' },
  { id: 'blue', label: 'Blau', swatch: '#2f6fdb' },
  { id: 'purple', label: 'Lila', swatch: '#8a4fc9' },
  { id: 'pattern', label: 'Bunt/Muster', swatch: 'conic-gradient(#e0262f, #f5d327, #3a9d4f, #2f6fdb, #8a4fc9, #e0262f)' },
  { id: 'metallic', label: 'Metallic', swatch: 'linear-gradient(135deg, #d9d9d9, #8c8c8c, #f2f2f2)' },
] as const;

export const SEASONS = [
  { id: 'spring', label: 'Frühling' },
  { id: 'summer', label: 'Sommer' },
  { id: 'autumn', label: 'Herbst' },
  { id: 'winter', label: 'Winter' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type ColorId = (typeof COLORS)[number]['id'];
export type SeasonId = (typeof SEASONS)[number]['id'];

export function labelOf(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((option) => option.id === id)?.label ?? id;
}

export const isCategoryId = (value: unknown): value is CategoryId => CATEGORIES.some((c) => c.id === value);
export const isColorId = (value: unknown): value is ColorId => COLORS.some((c) => c.id === value);
export const isSeasonId = (value: unknown): value is SeasonId => SEASONS.some((s) => s.id === value);
