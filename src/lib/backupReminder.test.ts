import { describe, expect, it } from 'vitest';
import { needsBackupReminder } from './backupReminder';

const now = new Date('2026-10-10T12:00:00.000Z');

describe('needsBackupReminder', () => {
  it('reminds when the last backup is older than 30 days', () => {
    expect(needsBackupReminder('2026-09-09T11:00:00.000Z', 5, now)).toBe(true);
  });

  it('does not remind within 30 days', () => {
    expect(needsBackupReminder('2026-09-11T12:00:00.000Z', 50, now)).toBe(false);
  });

  it('reminds without any backup only from 10 items on', () => {
    expect(needsBackupReminder(undefined, 9, now)).toBe(false);
    expect(needsBackupReminder(undefined, 10, now)).toBe(true);
  });

  it('treats an unreadable date like no backup', () => {
    expect(needsBackupReminder('kaputt', 10, now)).toBe(true);
  });

  it('never reminds for an empty wardrobe', () => {
    expect(needsBackupReminder('2020-01-01T00:00:00.000Z', 0, now)).toBe(false);
  });
});
