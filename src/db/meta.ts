import { db } from './schema';

export const META_LAST_BACKUP = 'lastBackupAt';
export const META_PERSIST = 'persistGranted';
export const META_USER_NAME = 'userName';
export const META_INSTALL_HINT_DISMISSED = 'installHintDismissed';

export async function getMeta(key: string): Promise<string | undefined> {
  return (await db.meta.get(key))?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value });
}
