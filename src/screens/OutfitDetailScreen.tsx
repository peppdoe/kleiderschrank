import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { DetailBar } from '../components/DetailBar';
import { FilePicker } from '../components/FilePicker';
import { ItemGrid } from '../components/ItemGrid';
import { NotFound } from '../components/NotFound';
import { OutfitPhotoPicker } from '../components/OutfitPhotoPicker';
import { OutfitPreview } from '../components/OutfitPreview';
import { OutfitSeasons } from '../components/OutfitSeasons';
import { getItemsByIds } from '../db/items';
import { deleteOutfit, getOutfit, getOutfitPhoto, removeOutfitPhoto, setOutfitPhoto } from '../db/outfits';
import { plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { processPhoto } from '../lib/image';
import { navigate } from '../lib/route';
import { useObjectUrl } from '../lib/useObjectUrl';

interface OutfitDetailScreenProps {
  outfitId: string;
  justSaved?: boolean;
  /** Kurze Bestätigung über den gemeinsamen Ansagebereich der App. */
  onNotice?: (message: string) => void;
}

export function OutfitDetailScreen({ outfitId, justSaved = false, onNotice }: OutfitDetailScreenProps) {
  const outfit = useLiveQuery(async () => (await getOutfit(outfitId)) ?? null, [outfitId]);
  const items = useLiveQuery(async () => (outfit ? getItemsByIds(outfit.itemIds) : []), [outfit]);
  const photo = useLiveQuery(async () => (await getOutfitPhoto(outfitId)) ?? null, [outfitId]);
  const photoUrl = useObjectUrl(photo?.full);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmingPhoto, setConfirmingPhoto] = useState(false);

  if (outfit === undefined || items === undefined || photo === undefined) return null;
  if (outfit === null) return <NotFound text="Diesen Look gibt es nicht mehr." backTo="/outfits" />;

  async function remove() {
    setConfirming(false);
    try {
      await deleteOutfit(outfitId);
      navigate('/outfits', { replace: true });
    } catch (e) {
      setError(userMessage(e));
    }
  }

  async function pickPhoto(file: File) {
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      await setOutfitPhoto(outfitId, await processPhoto(file, { anchor: 'top' }));
      onNotice?.('Foto gespeichert');
    } catch (e) {
      setPhotoError(userMessage(e));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function dropPhoto() {
    setConfirmingPhoto(false);
    try {
      await removeOutfitPhoto(outfitId);
    } catch (e) {
      setPhotoError(userMessage(e));
    }
  }

  return (
    <section className="screen-content">
      {photo ? (
        photoUrl ? (
          <img className="photo photo--full look-photo" src={photoUrl} alt={`Du im Look „${outfit.name}“`} />
        ) : (
          <div className="photo photo--loading look-photo" aria-hidden="true" />
        )
      ) : (
        items.length > 0 && <OutfitPreview itemIds={items.map((item) => item.id)} />
      )}
      {/* Das eingenähte Etikett des Outfits, an die Unterkante des Looks genäht: Name, Anzahl, wann es unter „Heute“ erscheint */}
      <div className={`care-label care-label--outfit${justSaved ? ' care-label--new' : ''}`}>
        <h1 className="care-label__title">{outfit.name}</h1>
        <p className="care-label__kind">{plural(items.length, 'Teil', 'Teile')}</p>
        <OutfitSeasons itemIds={outfit.itemIds} items={items} />
      </div>
      {photo ? (
        <div className="look-photo__actions">
          <FilePicker className="quiet-link" label="Foto ändern" accept="image/*" onPick={(file) => void pickPhoto(file)} disabled={photoBusy}>
            {photoBusy ? 'Foto wird vorbereitet …' : 'Foto ändern'}
          </FilePicker>
          <button type="button" className="quiet-link" onClick={() => setConfirmingPhoto(true)} disabled={photoBusy}>
            Foto entfernen
          </button>
        </div>
      ) : (
        <OutfitPhotoPicker label="Zeig, wie du den Look trägst" text="Zeig, wie du den Look trägst" busy={photoBusy} onPick={(file) => void pickPhoto(file)} />
      )}
      {photoError && <p className="error" role="alert">{photoError}</p>}
      {items.length === 0 ? (
        <p className="muted">Keine Teile mehr – alle Teile dieses Outfits wurden gelöscht.</p>
      ) : (
        <>
          <h2 className="section-title">Teile</h2>
          {/* Unter der Collage reicht ein kleiner Streifen, sonst stünde jedes Teil zweimal groß da. */}
          <ItemGrid items={items} strip={!photo} onItemClick={(item) => navigate(`/item/${item.id}`)} />
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <DetailBar label="Look" backHref="#/outfits" backLabel="Looks" onEdit={() => navigate(`/outfit/${outfitId}/edit`)} />

      <div className="detail-actions">
        <button type="button" className="text-button text-button--danger" onClick={() => setConfirming(true)}>
          Löschen
        </button>
      </div>

      {confirming && (
        <ConfirmSheet
          title="Look löschen?"
          message={`„${outfit.name}“ wird gelöscht. Die Teile bleiben in deinem Schrank.`}
          confirmLabel="Löschen"
          destructive
          onConfirm={() => void remove()}
          onCancel={() => setConfirming(false)}
        />
      )}
      {confirmingPhoto && (
        <ConfirmSheet
          title="Foto entfernen?"
          message="Das Foto von dir im Look wird gelöscht. Der Look und seine Teile bleiben."
          confirmLabel="Entfernen"
          cancelLabel="Behalten"
          destructive
          onConfirm={() => void dropPhoto()}
          onCancel={() => setConfirmingPhoto(false)}
        />
      )}
    </section>
  );
}
