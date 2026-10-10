import { META_PERSIST, setMeta } from '../db/meta';

export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  const granted = (await navigator.storage.persisted()) || (await navigator.storage.persist());
  await setMeta(META_PERSIST, String(granted));
  return granted;
}

export async function storageUsageMB(): Promise<number | undefined> {
  if (!navigator.storage?.estimate) return undefined;
  const { usage } = await navigator.storage.estimate();
  return usage === undefined ? undefined : usage / (1024 * 1024);
}

export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true;
}
