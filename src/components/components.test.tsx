import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createItem } from '../db/items';
import { EMPTY_FILTER } from '../lib/filters';
import { fakePhoto, makeItem } from '../test/factories';
import { ChipGroup } from './ChipGroup';
import { FilePicker } from './FilePicker';
import { FilterBar } from './FilterBar';
import { ItemGrid } from './ItemGrid';
import { ItemPhoto } from './ItemPhoto';

describe('ChipGroup', () => {
  it('marks selected chips and reports taps', async () => {
    const onToggle = vi.fn();
    render(
      <ChipGroup
        label="Saison"
        options={[{ id: 'summer', label: 'Sommer' }, { id: 'winter', label: 'Winter' }]}
        selected={['winter']}
        onToggle={onToggle}
      />,
    );
    const group = screen.getByRole('group', { name: 'Saison' });
    expect(within(group).getByRole('button', { name: 'Winter' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'Sommer' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(within(group).getByRole('button', { name: 'Sommer' }));
    expect(onToggle).toHaveBeenCalledWith('summer');
  });
});

describe('FilterBar', () => {
  it('toggles values and offers a reset only when active', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<FilterBar value={EMPTY_FILTER} onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Filter zurücksetzen' })).not.toBeInTheDocument();

    await userEvent.click(within(screen.getByRole('group', { name: 'Kategorie' })).getByRole('button', { name: 'Hose' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTER, categories: ['pants'] });

    rerender(<FilterBar value={{ ...EMPTY_FILTER, categories: ['pants'] }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter zurücksetzen' }));
    expect(onChange).toHaveBeenLastCalledWith(EMPTY_FILTER);
  });
});

describe('ItemGrid', () => {
  it('labels tiles, shows selection and reports taps', async () => {
    const blueTop = makeItem({ category: 'top', colors: ['blue'] });
    const shoes = makeItem({ category: 'shoes' });
    const onItemClick = vi.fn();
    render(<ItemGrid items={[blueTop, shoes]} selectedIds={[shoes.id]} onItemClick={onItemClick} />);
    expect(screen.getByRole('button', { name: 'Schuhe' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Oberteil, Blau' }));
    expect(onItemClick).toHaveBeenCalledWith(blueTop);
  });
});

describe('ItemPhoto', () => {
  it('shows the stored thumbnail', async () => {
    const id = await createItem({ category: 'top', colors: [], seasons: [], note: '' }, fakePhoto());
    render(<ItemPhoto itemId={id} alt="Bluse" />);
    expect(await screen.findByRole('img', { name: 'Bluse' })).toHaveAttribute('src', expect.stringMatching(/^blob:test\//));
  });
});

describe('FilePicker', () => {
  it('passes the chosen file on', async () => {
    const onPick = vi.fn();
    render(<FilePicker label="Foto wählen" accept="image/*" onPick={onPick}>Foto wählen</FilePicker>);
    const file = new File(['x'], 'shirt.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText('Foto wählen'), file);
    expect(onPick).toHaveBeenCalledWith(file);
  });
});
