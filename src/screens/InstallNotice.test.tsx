import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { isStandalone } from '../lib/storage';

vi.mock('../lib/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/storage')>()),
  isStandalone: vi.fn(() => false),
}));

beforeEach(() => {
  window.location.hash = '#/';
});

describe('Installationshinweis', () => {
  it('warns in Safari that data is not carried over to the home-screen app', async () => {
    vi.mocked(isStandalone).mockReturnValue(false);
    render(<App />);
    expect(await screen.findByRole('note')).toHaveTextContent('Daten aus Safari werden nicht übernommen');
  });

  it('is hidden in the installed app', async () => {
    vi.mocked(isStandalone).mockReturnValue(true);
    render(<App />);
    await screen.findByText(/Noch keine Teile/);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
