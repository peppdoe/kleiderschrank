import { newId } from '../lib/id';
import { db, type Outfit } from './schema';

export class OutfitValidationError extends Error {}

async function normalize(name: string, itemIds: string[]): Promise<{ name: string; itemIds: string[] }> {
  const trimmed = name.trim();
  if (!trimmed) throw new OutfitValidationError('Bitte gib dem Outfit einen Namen.');
  const unique = [...new Set(itemIds)];
  const existing = await db.items.bulkGet(unique);
  const ids = unique.filter((_, index) => existing[index] !== undefined);
  if (ids.length === 0) throw new OutfitValidationError('Bitte wähle mindestens ein Teil aus.');
  return { name: trimmed, itemIds: ids };
}

export async function createOutfit(name: string, itemIds: string[]): Promise<string> {
  const id = newId();
  await db.transaction('rw', db.items, db.outfits, async () => {
    const data = await normalize(name, itemIds);
    const now = new Date().toISOString();
    await db.outfits.add({ id, ...data, createdAt: now, updatedAt: now });
  });
  return id;
}

export async function updateOutfit(id: string, name: string, itemIds: string[]): Promise<void> {
  await db.transaction('rw', db.items, db.outfits, async () => {
    const existing = await db.outfits.get(id);
    if (!existing) throw new Error(`Outfit nicht gefunden: ${id}`);
    const data = await normalize(name, itemIds);
    await db.outfits.put({ ...existing, ...data, updatedAt: new Date().toISOString() });
  });
}

export async function deleteOutfit(id: string): Promise<void> {
  await db.outfits.delete(id);
}

export function getOutfit(id: string): Promise<Outfit | undefined> {
  return db.outfits.get(id);
}

export function listOutfits(): Promise<Outfit[]> {
  return db.outfits.orderBy('createdAt').reverse().toArray();
}

export function listOutfitsWithItem(itemId: string): Promise<Outfit[]> {
  return db.outfits.where('itemIds').equals(itemId).toArray();
}

export function countOutfits(): Promise<number> {
  return db.outfits.count();
}
