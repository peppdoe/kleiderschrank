import { useLiveQuery } from 'dexie-react-hooks';
import { getOutfitPhoto } from '../db/outfits';
import { useObjectUrl } from '../lib/useObjectUrl';
import { OutfitPreview } from './OutfitPreview';

/** Ein Look: das Foto von Lena im Outfit, sonst die Collage aus den Teilen. */
export function OutfitLook({ outfitId, itemIds }: { outfitId: string; itemIds: string[] }) {
  const photo = useLiveQuery(async () => (await getOutfitPhoto(outfitId)) ?? null, [outfitId]);
  const url = useObjectUrl(photo?.thumb);
  // Während des Ladens eine ruhige 3:4-Fläche, damit nichts springt.
  if (photo === undefined) return <div className="outfit-look outfit-look--loading" aria-hidden="true" />;
  if (photo === null) return <OutfitPreview itemIds={itemIds} />;
  if (!url) return <div className="outfit-look outfit-look--loading" aria-hidden="true" />;
  return <img className="outfit-look" src={url} alt="" />;
}
