import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { FilePicker } from '../components/FilePicker';
import { FilterTags } from '../components/FilterTags';
import { Icon } from '../components/Icon';
import { ItemGrid, tileLabel } from '../components/ItemGrid';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { OutfitPhotoPicker } from '../components/OutfitPhotoPicker';
import { OutfitPreview } from '../components/OutfitPreview';
import { OutfitSeasons } from '../components/OutfitSeasons';
import { listItems, type PhotoBlobs } from '../db/items';
import { createOutfit, getOutfit, getOutfitPhoto, updateOutfit, type PhotoChange } from '../db/outfits';
import { userMessage } from '../lib/errors';
import { EMPTY_FILTER, applyFilter, toggleValue, type FilterState } from '../lib/filters';
import { processPhoto } from '../lib/image';
import { navigate } from '../lib/route';
import { useObjectUrl } from '../lib/useObjectUrl';

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

export function OutfitEditorScreen({ outfitId, onSaved }: { outfitId?: string; onSaved?: (id: string) => void }) {
  const existing = useLiveQuery(async () => (outfitId ? (await getOutfit(outfitId)) ?? null : null), [outfitId]);
  const items = useLiveQuery(listItems, []);
  const [step, setStep] = useState<'pick' | 'name'>('pick');
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [loaded, setLoaded] = useState(!outfitId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const savingRef = useRef(false);
  const existingPhoto = useLiveQuery(async () => (outfitId ? (await getOutfitPhoto(outfitId)) ?? null : null), [outfitId]);
  // Neu gewähltes Foto (Entwurf) und ob das gespeicherte Foto entfernt werden soll; wirksam erst beim Speichern.
  const [photo, setPhoto] = useState<PhotoBlobs | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const shownPhoto = photo?.full ?? (photoRemoved ? undefined : existingPhoto?.full);
  const photoUrl = useObjectUrl(shownPhoto);

  useEffect(() => {
    if (existing && !loaded) {
      setSelected(existing.itemIds);
      setName(existing.name);
      setLoaded(true);
    }
  }, [existing, loaded]);

  if (items === undefined || existingPhoto === undefined || (outfitId && existing === undefined)) return null;
  if (outfitId && existing === null) return <NotFound text="Diesen Look gibt es nicht mehr." backTo="/outfits" />;

  const cancelTarget = outfitId ? `/outfit/${outfitId}` : '/outfits';
  const canSave = name.trim().length > 0 && selected.length > 0 && !saving && !processingPhoto;
  const dirty =
    !sameSet(selected, existing?.itemIds ?? []) ||
    name.trim() !== (existing?.name ?? '') ||
    photo !== null ||
    photoRemoved;
  const cancel = () => (dirty ? setConfirmDiscard(true) : navigate(cancelTarget, { replace: true }));
  const discardSheet = confirmDiscard && (
    <ConfirmSheet
      title="Änderungen verwerfen?"
      message={outfitId ? 'Deine Änderungen an diesem Look gehen verloren.' : 'Der neue Look wird nicht gespeichert.'}
      confirmLabel="Verwerfen"
      cancelLabel="Weiter bearbeiten"
      destructive
      onConfirm={() => navigate(cancelTarget, { replace: true })}
      onCancel={() => setConfirmDiscard(false)}
    />
  );
  const selectedItems = selected
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  async function pickPhoto(file: File) {
    setPhotoError(null);
    setProcessingPhoto(true);
    try {
      setPhoto(await processPhoto(file, { anchor: 'top' }));
      setPhotoRemoved(false);
    } catch (e) {
      setPhotoError(userMessage(e));
    } finally {
      setProcessingPhoto(false);
    }
  }

  function dropPhoto() {
    setPhoto(null);
    setPhotoRemoved(Boolean(existingPhoto));
  }

  const photoChange: PhotoChange = photo ?? (photoRemoved ? null : undefined);

  async function save() {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      if (outfitId) {
        await updateOutfit(outfitId, name, selected, photoChange);
        onSaved?.(outfitId);
        navigate(`/outfit/${outfitId}`, { replace: true });
      } else {
        const id = await createOutfit(name, selected, photo ?? undefined);
        onSaved?.(id);
        navigate(`/outfit/${id}`, { replace: true });
      }
    } catch (e) {
      setError(userMessage(e));
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (step === 'name') {
    return (
      <section className="screen-content form">
        <header className="form-header">
          <button type="button" className="text-button" onClick={() => setStep('pick')}>Zurück</button>
          <h1 className="form-header__title">{outfitId ? 'Look bearbeiten' : 'Neuer Look'}</h1>
        </header>
        {photoUrl ? (
          <img className="photo photo--full look-photo look-photo--draft" src={photoUrl} alt="Vorschau: du im Look" />
        ) : (
          <OutfitPreview itemIds={selected} />
        )}
        <OutfitSeasons itemIds={selected} items={items} />
        <label className="field">
          <span className="section-title">Name des Looks</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Uni-Look, Date Night" autoFocus />
        </label>
        <div className="field">
          <span className="section-title">
            Foto von dir im Look <span className="section-meta">optional</span>
          </span>
          {shownPhoto ? (
            <div className="look-photo__actions">
              <FilePicker className="quiet-link" label="Foto von dir im Look ändern" accept="image/*" onPick={(file) => void pickPhoto(file)} disabled={processingPhoto}>
                {processingPhoto ? 'Foto wird vorbereitet …' : 'Ändern'}
              </FilePicker>
              <button type="button" className="quiet-link" onClick={dropPhoto} disabled={processingPhoto}>Entfernen</button>
            </div>
          ) : (
            <OutfitPhotoPicker label="Foto von dir im Look" text="Zeig, wie du den Look trägst" busy={processingPhoto} onPick={(file) => void pickPhoto(file)} />
          )}
          {photoError && <p className="error" role="alert">{photoError}</p>}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="action-bar">
          {processingPhoto ? (
            <p className="action-bar__hint">Foto wird vorbereitet …</p>
          ) : (
            !name.trim() && <p className="action-bar__hint">Noch ein Name, dann ist der Look gespeichert.</p>
          )}
          <button type="button" className="button button--primary" disabled={!canSave} onClick={save}>
            {saving ? 'Speichert …' : 'Speichern'}
          </button>
        </div>
        {discardSheet}
      </section>
    );
  }

  const visible = applyFilter(items, filter);
  return (
    <section className="screen-content form">
      <header className="form-header">
        <button type="button" className="text-button" onClick={cancel}>
          Abbrechen
        </button>
        <h1 className="form-header__title">{outfitId ? 'Look bearbeiten' : 'Neuer Look'}</h1>
      </header>
      {items.length === 0 ? (
        <div className="empty"><p>Du hast noch keine Teile im Schrank.</p></div>
      ) : (
        <>
          <FilterTags value={filter} onChange={setFilter} resultCount={visible.length} items={items} />
          {selectedItems.length > 0 && (
            <ul className="selection-strip" aria-label="Ausgewählt">
              {selectedItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="selection-strip__item"
                    aria-label={`${tileLabel(item)} abwählen`}
                    onClick={() => setSelected(selected.filter((id) => id !== item.id))}
                  >
                    <ItemPhoto itemId={item.id} alt="" />
                    <span className="selection-strip__x" aria-hidden="true">
                      <Icon name="close" size={14} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <OutfitSeasons itemIds={selected} items={items} />
          <ItemGrid
            items={visible}
            selectedIds={selected}
            onItemClick={(item) => setSelected(toggleValue(selected, item.id))}
          />
        </>
      )}
      <div className="action-bar action-bar--split">
        <p className="action-bar__count">{selected.length} ausgewählt</p>
        <button type="button" className="button button--primary" disabled={selected.length === 0} onClick={() => setStep('name')}>
          Weiter
        </button>
      </div>
      {discardSheet}
    </section>
  );
}
