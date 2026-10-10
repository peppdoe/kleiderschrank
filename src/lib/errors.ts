import { OutfitValidationError } from '../db/outfits';
import { BackupError } from './backup';
import { PhotoError } from './image';

export function isQuotaError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (typeof current !== 'object') return false;
    if ((current as { name?: unknown }).name === 'QuotaExceededError') return true;
    current = (current as { inner?: unknown }).inner;
  }
  return false;
}

export function userMessage(error: unknown): string {
  if (isQuotaError(error)) {
    return 'Der Speicher auf dem iPhone ist voll. Mach ein Backup und lösche ein paar Teile, um Platz zu schaffen.';
  }
  if (error instanceof PhotoError) return 'Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.';
  if (error instanceof BackupError) return 'Das ist keine gültige Kleiderschrank-Sicherung.';
  if (error instanceof OutfitValidationError) return error.message;
  return 'Etwas ist schiefgelaufen. Bitte versuche es noch einmal.';
}
