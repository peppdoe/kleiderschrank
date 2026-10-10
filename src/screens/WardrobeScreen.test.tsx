import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { seedItem } from '../test/factories';

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Schrank', () => {
  it('shows a friendly empty state', async () => {
    render(<App />);
    expect(await screen.findByText('Noch keine Teile – tippe auf +, um dein erstes Teil zu erfassen.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Schrank/ })).toHaveAttribute('aria-current', 'page');
  });

  it('filters items and resets the filter', async () => {
    await seedItem({ category: 'top', colors: ['blue'] });
    await seedItem({ category: 'pants', colors: ['black'] });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText('2 Teile')).toBeInTheDocument();

    const categories = screen.getByRole('group', { name: 'Kategorie' });
    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    expect(screen.queryByRole('button', { name: 'Oberteil, Blau' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();

    await user.click(within(categories).getByRole('button', { name: 'Kleid' }));
    await user.click(within(categories).getByRole('button', { name: 'Hose' }));
    expect(screen.getByText('Keine Teile passen zu diesen Filtern.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Alle Teile anzeigen' }));
    expect(screen.getByRole('button', { name: 'Oberteil, Blau' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hose, Schwarz' })).toBeInTheDocument();
  });
});
