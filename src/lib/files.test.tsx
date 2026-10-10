import { afterEach, describe, expect, it, vi } from 'vitest';
import { shareOrDownload } from './files';

const nav = navigator as Navigator & Record<string, unknown>;

afterEach(() => {
  Reflect.deleteProperty(nav, 'canShare');
  Reflect.deleteProperty(nav, 'share');
  vi.restoreAllMocks();
});

describe('shareOrDownload', () => {
  it('treats a share sheet that is already open as cancelled, not as a download', async () => {
    nav.canShare = () => true;
    nav.share = vi.fn().mockRejectedValue(Object.assign(new Error('busy'), { name: 'InvalidStateError' }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    expect(await shareOrDownload('{}', 'backup.json')).toBe('cancelled');
    expect(click).not.toHaveBeenCalled();
  });

  it('reports a completed share', async () => {
    nav.canShare = () => true;
    nav.share = vi.fn().mockResolvedValue(undefined);
    expect(await shareOrDownload('{}', 'backup.json')).toBe('shared');
  });

  it('shares only the file, without extra text that iOS might save separately', async () => {
    nav.canShare = () => true;
    const share = vi.fn().mockResolvedValue(undefined);
    nav.share = share;
    await shareOrDownload('{}', 'backup.json');
    expect(share).toHaveBeenCalledWith({ files: [expect.any(File)] });
  });
});
