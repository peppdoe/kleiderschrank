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
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Foto gespeichert'));
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

describe('Editor: Foto von dir im Look', () => {
  async function toNameStep(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole('button', { name: 'Oberteil' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
  }

  it('saves a new outfit together with its photo', async () => {
    await seedItem({ category: 'top' });
    const user = userEvent.setup();
    open('/outfit/new');
    await toNameStep(user);
    await user.upload(screen.getByLabelText('Foto von dir im Look'), selfie());
    expect(await screen.findByRole('img', { name: 'Vorschau: du im Look' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name des Outfits'), 'Spiegel-Look');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    const heading = await screen.findByRole('heading', { name: 'Spiegel-Look' });
    expect(heading).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Du im Look „Spiegel-Look“' })).toBeInTheDocument();
  });

  it('keeps the existing photo when only renaming', async () => {
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Alt', [a], fakePhoto('bleibt'));
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    expect(await screen.findByRole('img', { name: 'Vorschau: du im Look' })).toBeInTheDocument();
    const name = screen.getByLabelText('Name des Outfits');
    await user.clear(name);
    await user.type(name, 'Neu');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    await screen.findByRole('heading', { name: 'Neu' });
    expect(await (await getOutfitPhoto(id))!.full.text()).toBe('bleibt-full');
  });

  it('removes the photo only when saving', async () => {
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Look', [a], fakePhoto('weg'));
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    await user.click(await screen.findByRole('button', { name: 'Entfernen' }));
    expect(await getOutfitPhoto(id)).toBeDefined();
    expect(screen.getByLabelText('Foto von dir im Look')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    await screen.findByRole('heading', { name: 'Look' });
    expect(await getOutfitPhoto(id)).toBeUndefined();
  });

  it('asks before discarding a chosen photo', async () => {
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Look', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    await user.upload(screen.getByLabelText('Foto von dir im Look'), selfie());
    await screen.findByRole('img', { name: 'Vorschau: du im Look' });
    await user.click(screen.getByRole('button', { name: 'Zurück' }));
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(await screen.findByRole('dialog', { name: 'Änderungen verwerfen?' })).toBeInTheDocument();
  });

  it('keeps name and selection when the photo cannot be read', async () => {
    vi.mocked(processPhoto).mockRejectedValueOnce(new PhotoError('kaputt'));
    await seedItem({ category: 'top' });
    const user = userEvent.setup();
    open('/outfit/new');
    await toNameStep(user);
    await user.type(screen.getByLabelText('Name des Outfits'), 'Trotzdem');
    await user.upload(screen.getByLabelText('Foto von dir im Look'), selfie());
    expect(await screen.findByRole('alert')).toHaveTextContent('Dieses Foto konnte nicht geladen werden');
    expect(screen.getByLabelText('Name des Outfits')).toHaveValue('Trotzdem');
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeEnabled();
  });
});

describe('Foto entfernen während ein neues vorbereitet wird', () => {
  it('is not possible on the detail', async () => {
    vi.mocked(processPhoto).mockImplementationOnce(() => new Promise(() => {}));
    const a = await seedItem();
    const id = await createOutfit('Uni', [a], fakePhoto('alt'));
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    await user.upload(await screen.findByLabelText('Foto ändern'), selfie());
    expect(await screen.findByRole('button', { name: 'Foto entfernen' })).toBeDisabled();
  });

  it('is not possible in the editor', async () => {
    vi.mocked(processPhoto).mockImplementationOnce(() => new Promise(() => {}));
    const a = await seedItem({ category: 'top' });
    const id = await createOutfit('Look', [a], fakePhoto('alt'));
    const user = userEvent.setup();
    open(`/outfit/${id}/edit`);
    await user.click(await screen.findByRole('button', { name: 'Weiter' }));
    await user.upload(await screen.findByLabelText('Foto von dir im Look ändern'), selfie());
    expect(screen.getByRole('button', { name: 'Entfernen' })).toBeDisabled();
  });
});

describe('Ansage für VoiceOver', () => {
  it('keeps one status region in place before the message arrives', async () => {
    const a = await seedItem();
    const id = await createOutfit('Uni', [a]);
    const user = userEvent.setup();
    open(`/outfit/${id}`);
    const region = await screen.findByRole('status');
    expect(region).toBeEmptyDOMElement();
    await user.upload(await screen.findByLabelText('Zeig, wie du den Look trägst'), selfie());
    await waitFor(() => expect(region).toHaveTextContent('Foto gespeichert'));
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('has the region ready on the wardrobe too', async () => {
    open('/');
    expect(await screen.findByRole('status')).toBeEmptyDOMElement();
  });
});
