import { useEffect, useMemo, useState } from 'react';

export type Route =
  | { name: 'wardrobe' }
  | { name: 'itemNew' }
  | { name: 'item'; id: string }
  | { name: 'itemEdit'; id: string }
  | { name: 'outfits' }
  | { name: 'outfitNew' }
  | { name: 'outfit'; id: string }
  | { name: 'outfitEdit'; id: string }
  | { name: 'settings' };

export type TabId = 'wardrobe' | 'outfits' | 'settings';

export function parseRoute(hash: string): Route {
  let parts: string[];
  try {
    parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return { name: 'wardrobe' };
  }
  const [section, id, action] = parts;
  if (section === 'item' && id === 'new' && !action) return { name: 'itemNew' };
  if (section === 'item' && id && !action) return { name: 'item', id };
  if (section === 'item' && id && action === 'edit' && parts.length === 3) return { name: 'itemEdit', id };
  if (section === 'outfits' && !id) return { name: 'outfits' };
  if (section === 'outfit' && id === 'new' && !action) return { name: 'outfitNew' };
  if (section === 'outfit' && id && !action) return { name: 'outfit', id };
  if (section === 'outfit' && id && action === 'edit' && parts.length === 3) return { name: 'outfitEdit', id };
  if (section === 'settings' && !id) return { name: 'settings' };
  return { name: 'wardrobe' };
}

export function tabOf(route: Route): TabId {
  switch (route.name) {
    case 'outfits':
    case 'outfitNew':
    case 'outfit':
    case 'outfitEdit':
      return 'outfits';
    case 'settings':
      return 'settings';
    default:
      return 'wardrobe';
  }
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  const hash = `#${path}`;
  if (options.replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return useMemo(() => parseRoute(hash), [hash]);
}
