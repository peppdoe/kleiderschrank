import { db } from './schema';

export const META_LAST_BACKUP = 'lastBackupAt';
export const META_PERSIST = 'persistGranted';

export async function getMeta(key: string): Promise<string | undefined> {
  return (await db.meta.get(key))?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value });
}
