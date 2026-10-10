const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_AGE_DAYS = 30;
const MIN_ITEMS_WITHOUT_BACKUP = 10;

export function needsBackupReminder(lastBackupAt: string | undefined, itemCount: number, now = new Date()): boolean {
  if (itemCount === 0) return false;
  const last = lastBackupAt ? Date.parse(lastBackupAt) : Number.NaN;
  if (Number.isNaN(last)) return itemCount >= MIN_ITEMS_WITHOUT_BACKUP;
  return now.getTime() - last > MAX_AGE_DAYS * DAY_MS;
}
