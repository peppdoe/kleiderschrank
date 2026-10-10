import { describe, expect, it } from 'vitest';
import { OutfitValidationError } from '../db/outfits';
import { BackupError } from './backup';
import { isQuotaError, userMessage } from './errors';
import { PhotoError } from './image';

const quota = Object.assign(new Error('full'), { name: 'QuotaExceededError' });

describe('errors', () => {
  it('detects quota errors directly and wrapped by Dexie', () => {
    expect(isQuotaError(quota)).toBe(true);
    expect(isQuotaError(Object.assign(new Error('wrapped'), { name: 'AbortError', inner: quota }))).toBe(true);
    expect(isQuotaError(new Error('other'))).toBe(false);
    expect(isQuotaError(null)).toBe(false);
  });

  it('turns errors into German messages', () => {
    expect(userMessage(quota)).toMatch(/Speicher auf dem iPhone ist voll/);
    expect(userMessage(new PhotoError('x'))).toBe('Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.');
    expect(userMessage(new BackupError('x'))).toBe('Das ist keine gültige Kleiderschrank-Sicherung.');
    expect(userMessage(new OutfitValidationError('Bitte gib dem Outfit einen Namen.'))).toBe('Bitte gib dem Outfit einen Namen.');
    expect(userMessage(new Error('boom'))).toBe('Etwas ist schiefgelaufen. Bitte versuche es noch einmal.');
  });
});
