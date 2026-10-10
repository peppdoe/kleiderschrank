import { useLiveQuery } from 'dexie-react-hooks';
import { getPhoto } from '../db/items';
import { useObjectUrl } from '../lib/useObjectUrl';

interface ItemPhotoProps {
  itemId: string;
  alt: string;
  variant?: 'thumb' | 'full';
}

export function ItemPhoto({ itemId, alt, variant = 'thumb' }: ItemPhotoProps) {
  const photo = useLiveQuery(() => getPhoto(itemId), [itemId]);
  const url = useObjectUrl(photo?.[variant]);
  if (!url) return <div className={`photo photo--${variant} photo--loading`} aria-hidden="true" />;
  return <img className={`photo photo--${variant}`} src={url} alt={alt} />;
}
