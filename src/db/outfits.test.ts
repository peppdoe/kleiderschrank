import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakePhoto, seedItem } from '../test/factories';
import { deleteItem } from './items';
import {
  OutfitValidationError, countOutfits, createOutfit, deleteOutfit, getOutfit,
  getOutfitPhoto, listOutfits, listOutfitsWithItem, removeOutfitPhoto, setOutfitPhoto, updateOutfit,
} from './outfits';

afterEach(() => vi.useRealTimers());

describe('createOutfit', () => {
  it('stores a trimmed name and de-duplicated item ids in selection order', async () => {
    const a = await seedItem();
    const b = await seedItem();
    const id = await createOutfit('  Büro  ', [b, a, b]);
    expect(await getOutfit(id)).toMatchObject({ name: 'Büro', itemIds: [b, a] });
  });

  it('rejects a name made only of spaces', async () => {
    const a = await seedItem();
    await expect(createOutfit('   ', [a])).rejects.toThrow(OutfitValidationError);
    await expect(createOutfit('   ', [a])).rejects.toThrow('Bitte gib dem Outfit einen Namen.');
    expect(await countOutfits()).toBe(0);
  });

  it('rejects an empty selection', async () => {
    await expect(createOutfit('Leer', [])).rejects.toThrow('Bitte wähle mindestens ein Teil aus.');
  });

  it('drops ids of items that do not exist and rejects if none remain', async () => {
    const a = await seedItem();
    const id = await createOutfit('Mix', [a, 'missing']);
    expect((await getOutfit(id))!.itemIds).toEqual([a]);
    await expect(createOutfit('Nur Geister', ['missing'])).rejects.toThrow(OutfitValidationError);
  });
});

describe('updateOutfit / deleteOutfit', () => {
  it('renames and changes items, keeping createdAt', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const a = await seedItem();
    const b = await seedItem();
    const id = await createOutfit('Alt', [a]);
    vi.setSystemTime(new Date('2026-01-05T00:00:00.000Z'));
    await updateOutfit(id, 'Neu', [a, b]);
    expect(await getOutfit(id)).toMatchObject({
      name: 'Neu', itemIds: [a, b],
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-05T00:00:00.000Z',
    });
  });

  it('validates on update and throws for unknown outfits', async () => {
    const a = await seedItem();
    const id = await createOutfit('Alt', [a]);
    await expect(updateOutfit(id, ' ', [a])).rejects.toThrow(OutfitValidationError);
    await expect(updateOutfit('missing', 'X', [a])).rejects.toThrow('Outfit nicht gefunden');
  });

  it('deletes an outfit but not its items', async () => {
    const a = await seedItem();
    const id = await createOutfit('Weg', [a]);
    await deleteOutfit(id);
    expect(await getOutfit(id)).toBeUndefined();
    expect(await listOutfitsWithItem(a)).toEqual([]);
  });
});

describe('queries', () => {
  it('lists newest first and finds outfits containing an item', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const a = await seedItem();
    const b = await seedItem();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const first = await createOutfit('Erstes', [a]);
    vi.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
    const second = await createOutfit('Zweites', [a, b]);
    expect((await listOutfits()).map((o) => o.id)).toEqual([second, first]);
    expect((await listOutfitsWithItem(b)).map((o) => o.id)).toEqual([second]);
  });

  it('keeps an outfit with no items left after its items are deleted', async () => {
    const a = await seedItem();
    const id = await createOutfit('Einzeln', [a]);
    await deleteItem(a);
    expect(await getOutfit(id)).toMatchObject({ name: 'Einzeln', itemIds: [] });
  });
});

describe('outfit photos', () => {
  it('creates an outfit together with its photo', async () => {
    const a = await seedItem();
    const id = await createOutfit('Spiegel', [a], fakePhoto('look'));
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('look-full');
    expect(await (await getOutfitPhoto(id))!.thumb.text()).toBe('look-thumb');
  });

  it('stores no photo when none is given', async () => {
    const a = await seedItem();
    const id = await createOutfit('Ohne', [a]);
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('does not store a photo when the outfit is invalid', async () => {
    await expect(createOutfit(' ', ['missing'], fakePhoto())).rejects.toThrow(OutfitValidationError);
    const { db } = await import('./schema');
    expect(await db.outfitPhotos.count()).toBe(0);
  });

  it('keeps, replaces or removes the photo on update', async () => {
    const a = await seedItem();
    const id = await createOutfit('Look', [a], fakePhoto('one'));
    await updateOutfit(id, 'Umbenannt', [a]);
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('one-full');
    await updateOutfit(id, 'Umbenannt', [a], fakePhoto('two'));
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('two-full');
    await updateOutfit(id, 'Umbenannt', [a], null);
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('sets and removes a photo directly and touches updatedAt', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const a = await seedItem();
    const id = await createOutfit('Look', [a]);
    vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
    await setOutfitPhoto(id, fakePhoto('neu'));
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('neu-full');
    expect((await getOutfit(id))!.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    vi.setSystemTime(new Date('2026-01-03T00:00:00.000Z'));
    await removeOutfitPhoto(id);
    expect(await getOutfitPhoto(id)).toBeUndefined();
    expect((await getOutfit(id))!.updatedAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('refuses a photo for an unknown outfit', async () => {
    await expect(setOutfitPhoto('missing', fakePhoto())).rejects.toThrow('Outfit nicht gefunden');
  });

  it('deletes the photo together with the outfit', async () => {
    const a = await seedItem();
    const id = await createOutfit('Weg', [a], fakePhoto());
    await deleteOutfit(id);
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('keeps the photo when all pieces of the outfit are deleted', async () => {
    const a = await seedItem();
    const id = await createOutfit('Nur noch Foto', [a], fakePhoto('bleibt'));
    await deleteItem(a);
    expect((await getOutfit(id))!.itemIds).toEqual([]);
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('bleibt-full');
  });
});
