import { describe, expect, it } from 'vitest';
import { THEME_COLORS, parseThemeChoice, resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('follows the iPhone on automatic and the choice otherwise', () => {
    expect(resolveTheme('auto', true)).toBe('dark');
    expect(resolveTheme('auto', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('parseThemeChoice', () => {
  it('accepts the three choices and falls back to automatic', () => {
    expect(parseThemeChoice('light')).toBe('light');
    expect(parseThemeChoice('dark')).toBe('dark');
    expect(parseThemeChoice('auto')).toBe('auto');
    expect(parseThemeChoice(null)).toBe('auto');
    expect(parseThemeChoice('sepia')).toBe('auto');
  });
});

describe('THEME_COLORS', () => {
  it('uses the porcelain and night grounds for the status bar', () => {
    expect(THEME_COLORS).toEqual({ light: '#f5f6f8', dark: '#0f1524' });
  });
});
