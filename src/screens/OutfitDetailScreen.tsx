import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { FilePicker } from '../components/FilePicker';
import { Icon } from '../components/Icon';
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

const SAVED_NOTICE_MS = 3500;

export function OutfitDetailScreen({ outfitId, justSaved = false }: { outfitId: string; justSaved?: boolean }) {
  const outfit = useLiveQuery(async () => (await getOutfit(outfitId)) ?? null, [outfitId]);
  const items = useLiveQuery(async () => (outfit ? getItemsByIds(outfit.itemIds) : []), [outfit]);
  const photo = useLiveQuery(async () => (await getOutfitPhoto(outfitId)) ?? null, [outfitId]);
  const photoUrl = useObjectUrl(photo?.full);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmingPhoto, setConfirmingPhoto] = useState(false);

  useEffect(() => {
    if (!photoSaved) return undefined;
    const timer = setTimeout(() => setPhotoSaved(false), SAVED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [photoSaved]);

  if (outfit === undefined || items === undefined || photo === undefined) return null;
  if (outfit === null) return <NotFound text="Dieses Outfit gibt es nicht mehr." backTo="/outfits" />;

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
      setPhotoSaved(true);
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
      <header className="form-header">
        <a className="text-button text-button--back" href="#/outfits">
          <Icon name="back" size={20} />
          Outfits
        </a>
      </header>
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
          <button type="button" className="quiet-link" onClick={() => setConfirmingPhoto(true)}>
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
          <ItemGrid items={items} onItemClick={(item) => navigate(`/item/${item.id}`)} />
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="detail-actions">
        <button type="button" className="button button--wide" onClick={() => navigate(`/outfit/${outfitId}/edit`)}>
          Bearbeiten
        </button>
        <button type="button" className="text-button text-button--danger" onClick={() => setConfirming(true)}>
          Löschen
        </button>
      </div>

      {photoSaved && <p className="toast" role="status">Foto gespeichert</p>}

      {confirming && (
        <ConfirmSheet
          title="Outfit löschen?"
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
          message="Das Foto von dir im Look wird gelöscht. Das Outfit und seine Teile bleiben."
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
