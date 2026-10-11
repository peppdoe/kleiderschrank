import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { db } from '../db/schema';
import { PhotoError, processPhoto } from '../lib/image';

vi.mock('../lib/image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/image')>()),
  processPhoto: vi.fn(async () => ({
    full: new Blob(['full'], { type: 'image/jpeg' }),
    thumb: new Blob(['thumb'], { type: 'image/jpeg' }),
  })),
}));

const photoFile = () => new File(['x'], 'shirt.jpg', { type: 'image/jpeg' });

async function startNewItem(user: ReturnType<typeof userEvent.setup>) {
  render(<App />);
  await user.upload(await screen.findByLabelText('Erstes Teil fotografieren'), photoFile());
  await screen.findByRole('heading', { name: 'Neues Teil' });
}

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Teil erfassen', () => {
  it('saves a new item with category and colour', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    const save = screen.getByRole('button', { name: 'Speichern' });
    expect(save).toBeDisabled();

    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));
    await user.click(within(screen.getByRole('group', { name: 'Farbe' })).getByRole('button', { name: 'Blau' }));
    await user.click(within(screen.getByRole('group', { name: 'Saison' })).getByRole('button', { name: 'Winter' }));
    await user.type(screen.getByLabelText('Notiz'), 'Von Oma');
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    expect(await screen.findByRole('button', { name: 'Oberteil, Blau – Von Oma' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Teil gespeichert'));
    const items = await db.items.toArray();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ category: 'top', colors: ['blue'], seasons: ['winter'], note: 'Von Oma' });
    expect(await (await db.photos.get(items[0].id))!.full.text()).toBe('full');
  });

  it('saves and goes straight on to the next piece with a fresh form', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    expect(screen.queryByLabelText('Speichern und nächstes Teil fotografieren')).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));
    await user.click(within(screen.getByRole('group', { name: 'Saison' })).getByRole('button', { name: 'Winter' }));
    await user.upload(await screen.findByLabelText('Speichern und nächstes Teil fotografieren'), photoFile());

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Teil gespeichert'));
    expect(await db.items.count()).toBe(1);
    expect(screen.getByRole('heading', { name: 'Neues Teil' })).toBeInTheDocument();
    const categories = screen.getByRole('group', { name: 'Kategorie' });
    expect(within(categories).getByRole('button', { name: 'Oberteil' })).toHaveAttribute('aria-pressed', 'false');
    expect(await screen.findByAltText('Vorschau')).toBeInTheDocument();

    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    const save = screen.getByRole('button', { name: 'Speichern' });
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);
    expect(await screen.findByRole('button', { name: 'Hose' })).toBeInTheDocument();
    expect(await db.items.count()).toBe(2);
  });

  it('saves only once when Speichern is tapped twice', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));
    await user.click(within(screen.getByRole('group', { name: 'Farbe' })).getByRole('button', { name: 'Blau' }));
    const save = screen.getByRole('button', { name: 'Speichern' });
    await waitFor(() => expect(save).toBeEnabled());
    await user.dblClick(save);
    await screen.findByRole('button', { name: 'Oberteil, Blau' });
    expect(await db.items.count()).toBe(1);
  });

  it('explains when a photo cannot be read and lets the user pick another', async () => {
    vi.mocked(processPhoto).mockRejectedValueOnce(new PhotoError('kaputt'));
    const user = userEvent.setup();
    await startNewItem(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Dieses Foto konnte nicht geladen werden, bitte ein anderes wählen.');
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeDisabled();

    await user.upload(screen.getByLabelText('Foto wählen'), photoFile());
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('hides the tab bar and explains why saving is not possible yet', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    expect(screen.queryByRole('navigation', { name: 'Hauptnavigation' })).not.toBeInTheDocument();
    expect(await screen.findByText('Wähle noch eine Kategorie.')).toBeInTheDocument();
    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));
    expect(screen.queryByText('Wähle noch eine Kategorie.')).not.toBeInTheDocument();
  });

  it('asks before discarding a new piece and can keep editing', async () => {
    const user = userEvent.setup();
    await startNewItem(user);
    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Oberteil' }));

    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    const sheet = await screen.findByRole('dialog', { name: 'Änderungen verwerfen?' });
    await user.click(within(sheet).getByRole('button', { name: 'Weiter bearbeiten' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Neues Teil' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Änderungen verwerfen?' })).getByRole('button', { name: 'Verwerfen' }));
    expect(await screen.findByText(/Noch ganz viel Platz hier/)).toBeInTheDocument();
    expect(await db.items.count()).toBe(0);
  });

  it('blocks a second photo pick while the first one is still being processed', async () => {
    let finish: (value: { full: Blob; thumb: Blob }) => void = () => {};
    vi.mocked(processPhoto).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const user = userEvent.setup();
    await startNewItem(user);
    expect(screen.getByLabelText('Foto wählen')).toBeDisabled();
    finish({ full: new Blob(['a']), thumb: new Blob(['a']) });
    await waitFor(() => expect(screen.getByLabelText('Foto wählen')).toBeEnabled());
  });

  it('does not reuse the previous photo when the new-item form is opened again', async () => {
    vi.mocked(processPhoto).mockClear();
    const user = userEvent.setup();
    await startNewItem(user);
    await user.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Schuhe' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Speichern' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    await screen.findByText('1 Teil');
    window.location.hash = '#/item/new';
    expect(await screen.findByText('Foto aufnehmen oder wählen')).toBeInTheDocument();
    expect(processPhoto).toHaveBeenCalledTimes(1);
  });
});

describe('Foto-Rahmen', () => {
  it('opens the photo picker from the whole empty frame, without a second button', async () => {
    window.location.hash = '#/item/new';
    render(<App />);
    const frameText = await screen.findByText('Foto aufnehmen oder wählen');
    expect(frameText.closest('label')).not.toBeNull();
    expect(screen.getAllByLabelText('Foto wählen')).toHaveLength(1);
  });
});

describe('Reihenfolge im Formular', () => {
  it('asks for the required category right after the photo, name and note come last', async () => {
    window.location.hash = '#/item/new';
    render(<App />);
    const category = await screen.findByRole('group', { name: 'Kategorie' });
    const name = screen.getByLabelText('Name');
    const note = screen.getByLabelText('Notiz');
    expect(category.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Saison' }).compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(name.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('Formular mit einer Hand', () => {
  it('puts cancel and save together into the bottom bar', async () => {
    window.location.hash = '#/item/new';
    render(<App />);
    const cancel = await screen.findByRole('button', { name: 'Abbrechen' });
    const bar = cancel.closest('.action-bar');
    expect(bar).not.toBeNull();
    expect(bar).toContainElement(screen.getByRole('button', { name: 'Speichern' }));
  });
});
