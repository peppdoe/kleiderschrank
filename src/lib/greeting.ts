import type { SeasonId } from './constants';

// Höchstens 30 Zeichen: der Spruch muss auf eine Zeile des Namensbands passen.
export const GREETING_LINES: Record<'general' | SeasonId, readonly string[]> = {
  // Ton: wie eine Freundin, nicht wie Verkäuferin oder Eltern. Nie ein bestimmtes Teil nennen.
  general: [
    'Welcher Vibe heute?',
    'Heute eher cozy oder clean?',
    'Lieblingsteil oder was Neues?',
    'Schlicht oder mutig heute?',
    'Gestern mutig, heute basic?',
    'Mix oder Lieblingslook?',
    'Was Neues kombinieren?',
  ],
  spring: ['Farbe darf wieder raus.', 'Leichte Lagen, gute Laune.', 'Frühling, neue Kombis?'],
  summer: ['Heute darf es luftig sein.', 'Leicht, hell, fertig.', 'Welcher Sommer-Look heute?'],
  autumn: ['Layering-Saison ist eröffnet.', 'Cozy oder chic heute?', 'Herbstfarben stehen dir.'],
  winter: ['Cozy ist heute Programm.', 'Warm, aber mit Stil.', 'Welcher Winter-Look heute?'],
};

export function seasonOf(date: Date): SeasonId {
  const month = date.getMonth(); // 0 = Januar
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// Begrüßung je Tageszeit, die erste ist die klassische. Höchstens 12 Zeichen, damit „…, Lena“ ins Band passt.
// Endet sie auf „?“, rückt der Name davor: „Noch wach, Lena?“.
export const SALUTATIONS: Record<'morning' | 'day' | 'evening' | 'night', readonly string[]> = {
  morning: ['Guten Morgen', 'Morgen', 'Hey'],
  day: ['Hallo', 'Hey', 'Hi'],
  evening: ['Guten Abend', 'Hey', 'Na'],
  night: ['Noch wach?'],
};
// Klingt allein unfertig, nur mit Namen.
const NEEDS_NAME = new Set(['Na']);

function timeOfDay(hour: number): keyof typeof SALUTATIONS {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 23) return 'evening';
  return 'night';
}

const pickFrom = <T,>(pool: readonly T[], pick: number): T => pool[Math.min(pool.length - 1, Math.max(0, Math.floor(pick * pool.length)))];

function salutationTitle(hour: number, name: string, pick: number): string {
  const pool = SALUTATIONS[timeOfDay(hour)].filter((s) => name || !NEEDS_NAME.has(s));
  const hello = pickFrom(pool, pick);
  if (!name) return hello;
  return hello.endsWith('?') ? `${hello.slice(0, -1)}, ${name}?` : `${hello}, ${name}`;
}

/**
 * `pick` (Spruch) und `titlePick` (Begrüßung) sind Zufallszahlen in [0, 1], beim Öffnen der App einmal gezogen.
 * Ohne `titlePick` gilt die klassische Begrüßung der Tageszeit (Vorschau in den Einstellungen).
 * `season` ist die gewählte Saison; der Spruch passt dann zum Band in deren Farbe. Ohne Wahl gilt der Kalender.
 */
export function greetingFor({ name, now, pick, titlePick = 0, season }: { name: string; now: Date; pick: number; titlePick?: number; season?: SeasonId }): { title: string; line: string } {
  const pool = [...GREETING_LINES.general, ...GREETING_LINES[season ?? seasonOf(now)]];
  return { title: salutationTitle(now.getHours(), name.trim(), titlePick), line: pickFrom(pool, pick) };
}
