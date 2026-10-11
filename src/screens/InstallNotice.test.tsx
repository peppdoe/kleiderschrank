import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    expect(await screen.findByRole('note')).toHaveTextContent('Was du in Safari anlegst, zieht nicht mit.');
  });

  it('can be hidden for good', async () => {
    vi.mocked(isStandalone).mockReturnValue(false);
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(within(await screen.findByRole('note')).getByRole('button', { name: 'Hinweis ausblenden' }));
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    unmount();
    render(<App />);
    await screen.findByText(/Noch leer hier/);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('is hidden in the installed app', async () => {
    vi.mocked(isStandalone).mockReturnValue(true);
    render(<App />);
    await screen.findByText(/Noch leer hier/);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
