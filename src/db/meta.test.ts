import { describe, expect, it } from 'vitest';
import { META_LAST_BACKUP, getMeta, setMeta } from './meta';

describe('meta', () => {
  it('returns undefined for unknown keys', async () => {
    expect(await getMeta(META_LAST_BACKUP)).toBeUndefined();
  });

  it('stores and overwrites values', async () => {
    await setMeta(META_LAST_BACKUP, '2026-10-01T00:00:00.000Z');
    await setMeta(META_LAST_BACKUP, '2026-10-02T00:00:00.000Z');
    expect(await getMeta(META_LAST_BACKUP)).toBe('2026-10-02T00:00:00.000Z');
  });
});
