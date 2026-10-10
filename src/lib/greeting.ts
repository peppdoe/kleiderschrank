import type { SeasonId } from './constants';

export const GREETING_LINES: Record<'general' | SeasonId, readonly string[]> = {
  general: [
    'Was darf es heute sein?',
    'Worauf hast du heute Lust?',
    'Lieblingsteil oder mal was Neues?',
    'Dein Schrank wartet schon auf dich.',
    'Heute ist ein guter Tag für dein Lieblingsteil.',
    'Zeit für ein neues Outfit?',
    'Schlicht oder ein bisschen mutig heute?',
  ],
  spring: ['Zeit für leichte Jacken?', 'Frühling: Farbe darf wieder raus.', 'Übergangsjacke oder schon ohne?'],
  summer: ['Sonnenbrille nicht vergessen.', 'Leicht und luftig heute?', 'Sommerkleid-Wetter?'],
  autumn: ['Herbstzeit: Zeit für Lagen und Strick?', 'Ein guter Tag für deine Lederjacke?', 'Gemütlich oder schick in den Herbst?'],
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

export function wardrobeTitle(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Mein Kleiderschrank';
  // Namen auf s, ß, x oder z bekommen im Genitiv nur einen Apostroph (Jonas’, Max’).
  return /[sßxz]$/i.test(trimmed) ? `${trimmed}’ Kleiderschrank` : `${trimmed}s Kleiderschrank`;
}

/** `pick` ist eine Zufallszahl in [0, 1], beim Öffnen der App einmal gezogen. */
export function greetingFor({ name, now, pick }: { name: string; now: Date; pick: number }): { title: string; line: string } {
  const trimmed = name.trim();
  const hello = salutation(now.getHours());
  const pool = [...GREETING_LINES.general, ...GREETING_LINES[seasonOf(now)]];
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(pick * pool.length)));
  return { title: trimmed ? `${hello}, ${trimmed}` : hello, line: pool[index] };
}
