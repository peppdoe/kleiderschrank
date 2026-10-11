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

function salutation(hour: number): string {
  if (hour >= 5 && hour < 11) return 'Guten Morgen';
  if (hour >= 17 && hour < 23) return 'Guten Abend';
  return 'Hallo';
}

/**
 * `pick` ist eine Zufallszahl in [0, 1], beim Öffnen der App einmal gezogen.
 * `season` ist die gewählte Saison; der Spruch passt dann zum Band in deren Farbe. Ohne Wahl gilt der Kalender.
 */
export function greetingFor({ name, now, pick, season }: { name: string; now: Date; pick: number; season?: SeasonId }): { title: string; line: string } {
  const trimmed = name.trim();
  const hello = salutation(now.getHours());
  const pool = [...GREETING_LINES.general, ...GREETING_LINES[season ?? seasonOf(now)]];
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(pick * pool.length)));
  return { title: trimmed ? `${hello}, ${trimmed}` : hello, line: pool[index] };
}
