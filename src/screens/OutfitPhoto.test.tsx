import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { deleteItem } from '../db/items';
import { createOutfit, getOutfitPhoto } from '../db/outfits';
import { PhotoError, processPhoto } from '../lib/image';
import { fakePhoto, seedItem } from '../test/factories';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processPhoto: vi.fn(async () => ({
    full: new Blob(['look-full'], { type: 'image/jpeg' }),
    thumb: new Blob(['look-thumb'], { type: 'image/jpeg' }),
  })),
}));

const selfie = () => new File(['x'], 'spiegel.jpg', { type: 'image/jpeg' });

function open(path: string) {
  window.location.hash = `#${path}`;
  return render(<App />);
}

beforeEach(() => {
  vi.mocked(processPhoto).mockClear();
});

afterEach(() => vi.useRealTimers());

describe('OutfitLook', () => {
  it('shows the wear photo instead of the collage in the outfit list', async () => {
    const a = await seedItem();
    await createOutfit('Mit Foto', [a], fakePhoto('look'));
    await createOutfit('Ohne Foto', [a]);
    const { container } = open('/outfits');
    expect(await screen.findByText('Mit Foto')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('img.outfit-look')).toHaveLength(1));
    expect(container.querySelectorAll('.outfit-preview')).toHaveLength(1);
  });

  it('shows the wear photo even when all pieces are gone', async () => {
    const a = await seedItem();
    await createOutfit('Nur Foto', [a], fakePhoto('look'));
    await deleteItem(a);
    const { container } = open('/outfits');
    expect(await screen.findByText('Nur Foto')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('img.outfit-look')).not.toBeNull());
    expect(screen.queryByText('Keine Teile mehr')).not.toBeInTheDocument();
  });

  it('shows the wear photo under Heute on the wardrobe', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-11T08:00:00'));
    const coat = await seedItem({ category: 'jacket', seasons: ['autumn'] });
    await createOutfit('Herbst-Look', [coat], fakePhoto('look'));
    const { container } = open('/');
    expect(await screen.findByText('Herbst-Look')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('.today img.outfit-look')).not.toBeNull());
  });
});

describe('Outfit-Detail mit Tragebild', () => {
  it('shows the photo on top and the pieces once, without the collage', async () => {
    const a = await seedItem();
    const id = await createOutfit('Date Night', [a], fakePhoto('look'));
    const { container } = open(`/outfit/${id}`);
    expect(await screen.findByRole('img', { name: 'Du im Look „Date Night“' })).toBeInTheDocument();
    expect(container.querySelector('.outfit-preview')).toBeNull();
    expect(await screen.findByRole('heading', { name: 'Teile' })).toBeInTheDocument();
  });

  it('adds a photo from the dashed frame and confirms it', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.upload(await screen.findByLabelText('Zeig, wie du den Look trägst'), selfie());
    expect(await screen.findByRole('status')).toHaveTextContent('Foto gespeichert');
    expect(processPhoto).toHaveBeenCalledWith(expect.any(File), { anchor: 'top' });
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('look-full');
    expect(await screen.findByRole('img', { name: 'Du im Look „Uni“' })).toBeInTheDocument();
  });

  it('reports an unreadable photo and saves nothing', async () => {
    vi.mocked(processPhoto).mockRejectedValueOnce(new PhotoError('kaputt'));
    const a = await seedItem();
    const id = await createOutfit('Uni', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    const input = await screen.findByLabelText('Zeig, wie du den Look trägst');
    await user.upload(input, selfie());
    expect(await screen.findByRole('alert')).toHaveTextContent('Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.');
    expect(await getOutfitPhoto(id)).toBeUndefined();
    expect(input).toBeEnabled();
  });

  it('replaces the photo', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a], fakePhoto('alt'));
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.upload(await screen.findByLabelText('Foto ändern'), selfie());
    await waitFor(async () => expect(await (await getOutfitPhoto(id))!.full.text()).toBe('look-full'));
  });

  it('removes the photo only after confirmation', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a], fakePhoto('alt'));
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.click(await screen.findByRole('button', { name: 'Foto entfernen' }));
    const sheet = await screen.findByRole('dialog', { name: 'Foto entfernen?' });
    await user.click(within(sheet).getByRole('button', { name: 'Behalten' }));
    expect(await getOutfitPhoto(id)).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Foto entfernen' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Foto entfernen?' })).getByRole('button', { name: 'Entfernen' }));
    await waitFor(async () => expect(await getOutfitPhoto(id)).toBeUndefined());
    expect(await screen.findByLabelText('Zeig, wie du den Look trägst')).toBeInTheDocument();
  });
});
