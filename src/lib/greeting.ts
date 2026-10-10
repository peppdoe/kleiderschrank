import type { SeasonId } from './constants';

// Höchstens 30 Zeichen: der Spruch muss auf eine Zeile des Namensbands passen.
export const GREETING_LINES: Record<'general' | SeasonId, readonly string[]> = {
  general: [
    'Was darf es heute sein?',
    'Worauf hast du heute Lust?',
    'Lieblingsteil oder was Neues?',
    'Dein Schrank wartet schon.',
    'Ein Tag für dein Lieblingsteil?',
    'Zeit für ein neues Outfit?',
    'Schlicht oder mutig heute?',
  ],
  spring: ['Zeit für leichte Jacken?', 'Farbe darf wieder raus.', 'Übergangsjacke oder ohne?'],
  summer: ['Sonnenbrille nicht vergessen.', 'Leicht und luftig heute?', 'Heute darf es luftig sein.'],
  autumn: ['Zeit für Lagen und Strick?', 'Zeit für Jacke und Schal?', 'Gemütlich oder schick?'],
  winter: ['Schal und Mütze bereit?', 'Warm eingepackt heute?', 'Zeit für den dicken Pulli?'],
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

/** `pick` ist eine Zufallszahl in [0, 1], beim Öffnen der App einmal gezogen. */
export function greetingFor({ name, now, pick }: { name: string; now: Date; pick: number }): { title: string; line: string } {
  const trimmed = name.trim();
  const hello = salutation(now.getHours());
  const pool = [...GREETING_LINES.general, ...GREETING_LINES[seasonOf(now)]];
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(pick * pool.length)));
  return { title: trimmed ? `${hello}, ${trimmed}` : hello, line: pool[index] };
}
