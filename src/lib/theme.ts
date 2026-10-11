/**
 * Hell oder dunkel: „Automatisch“ folgt dem iPhone, „Hell“/„Dunkel“ halten die Wahl fest.
 * Die Wahl ist eine Geräte-Einstellung und liegt im localStorage (nicht im Backup). Das Inline-Skript
 * in index.html liest denselben Schlüssel schon vor dem ersten Bild, damit nichts aufblitzt.
 */
export type ThemeChoice = 'auto' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'kleiderschrank-theme';
/** Grundfarbe für die Statusleiste (meta theme-color), wie --ground. */
export const THEME_COLORS: Record<Theme, string> = { light: '#f5f6f8', dark: '#0f1524' };

export const THEME_CHOICES: readonly { id: ThemeChoice; label: string }[] = [
  { id: 'auto', label: 'Automatisch' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
];

export function parseThemeChoice(value: string | null | undefined): ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'auto' ? value : 'auto';
}

export function resolveTheme(choice: ThemeChoice, systemDark: boolean): Theme {
  if (choice === 'auto') return systemDark ? 'dark' : 'light';
  return choice;
}

const darkQuery = () => (typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null);

export function getThemeChoice(): ThemeChoice {
  try {
    return parseThemeChoice(localStorage.getItem(THEME_KEY));
  } catch {
    return 'auto';
  }
}

/** Setzt data-theme am Root und die Farbe der Statusleiste. */
export function applyTheme(choice: ThemeChoice): void {
  const theme = resolveTheme(choice, darkQuery()?.matches ?? false);
  document.documentElement.dataset.theme = theme;
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
  }
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.removeAttribute('media');
    meta.setAttribute('content', THEME_COLORS[theme]);
  });
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Privater Modus o. Ä.: die Wahl gilt dann nur bis zum Schließen.
  }
  applyTheme(choice);
}

/**
 * Wechselt das iPhone zwischen hell und dunkel, zieht „Automatisch“ mit. Zusätzlich beim Zurückkehren
 * in die App prüfen: Lag sie beim Umschalten im Hintergrund, kommt das change-Ereignis nicht immer an.
 * Gibt das Abmelden zurück.
 */
export function watchSystemTheme(): () => void {
  const query = darkQuery();
  const onChange = () => {
    const choice = getThemeChoice();
    if (choice === 'auto') applyTheme(choice);
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };
  query?.addEventListener('change', onChange);
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    query?.removeEventListener('change', onChange);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
