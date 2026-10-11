import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { deleteItem } from '../db/items';
import { createOutfit } from '../db/outfits';
import { processPhoto } from '../lib/image';
import { fakePhoto, seedItem } from '../test/factories';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processPhoto: vi.fn(async () => ({
    full: new Blob(['look-full'], { type: 'image/jpeg' }),
    thumb: new Blob(['look-thumb'], { type: 'image/jpeg' }),
  })),
}));

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
