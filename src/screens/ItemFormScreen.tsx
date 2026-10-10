import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChipGroup } from '../components/ChipGroup';
import { FilePicker } from '../components/FilePicker';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { createItem, getItem, updateItem, type PhotoBlobs } from '../db/items';
import {
  CATEGORIES, COLORS, SEASONS, type CategoryId, type ColorId, type SeasonId,
} from '../lib/constants';
import { userMessage } from '../lib/errors';
import { toggleValue } from '../lib/filters';
import { processPhoto } from '../lib/image';
import { navigate } from '../lib/route';
import { useObjectUrl } from '../lib/useObjectUrl';

interface ItemFormScreenProps {
  itemId?: string;
  initialFile?: File | null;
}

export function ItemFormScreen({ itemId, initialFile }: ItemFormScreenProps) {
  // undefined = lädt noch, null = neu bzw. nicht gefunden
  const existing = useLiveQuery(async () => (itemId ? (await getItem(itemId)) ?? null : null), [itemId]);
  const [photo, setPhoto] = useState<PhotoBlobs | null>(null);
  const [processing, setProcessing] = useState(false);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [colors, setColors] = useState<ColorId[]>([]);
  const [seasons, setSeasons] = useState<SeasonId[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!itemId);
  const savingRef = useRef(false);

  useEffect(() => {
    if (existing && !loaded) {
      setCategory(existing.category);
      setColors(existing.colors);
      setSeasons(existing.seasons);
      setNote(existing.note);
      setLoaded(true);
    }
  }, [existing, loaded]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setProcessing(true);
    try {
      setPhoto(await processPhoto(file));
    } catch (e) {
      setError(userMessage(e));
    } finally {
      setProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (initialFile) void handleFile(initialFile);
  }, [initialFile, handleFile]);

  const previewUrl = useObjectUrl(photo?.full);

  if (itemId && existing === undefined) return null;
  if (itemId && existing === null) return <NotFound text="Dieses Teil gibt es nicht mehr." backTo="/" />;

  const hasPhoto = photo !== null || Boolean(itemId);
  const canSave = hasPhoto && category !== null && !saving && !processing;
  const cancelTarget = itemId ? `/item/${itemId}` : '/';

  async function save() {
    if (!canSave || category === null || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    const input = { category, colors, seasons, note };
    try {
      if (itemId) {
        await updateItem(itemId, input, photo ?? undefined);
        navigate(`/item/${itemId}`, { replace: true });
      } else {
        await createItem(input, photo!);
        navigate('/', { replace: true });
      }
    } catch (e) {
      setError(userMessage(e));
      savingRef.current = false;
      setSaving(false);
    }
  }

  const hint = processing
    ? 'Foto wird verarbeitet …'
    : !hasPhoto
      ? 'Wähle zuerst ein Foto.'
      : category === null
        ? 'Wähle noch eine Kategorie.'
        : null;

  return (
    <section className="screen-content form">
      <header className="form-header">
        <button type="button" className="text-button" onClick={() => navigate(cancelTarget, { replace: true })}>
          Abbrechen
        </button>
        <h1 className="form-header__title">{itemId ? 'Teil bearbeiten' : 'Neues Teil'}</h1>
      </header>

      <div className="form__photo">
        {previewUrl ? (
          <img className="photo photo--full" src={previewUrl} alt="Vorschau" />
        ) : itemId ? (
          <ItemPhoto itemId={itemId} variant="full" alt="Aktuelles Foto" />
        ) : (
          <div className="photo photo--empty">{processing ? 'Foto wird verarbeitet …' : 'Noch kein Foto'}</div>
        )}
        <FilePicker className="button" label="Foto wählen" accept="image/*" onPick={handleFile} disabled={processing}>
          {hasPhoto ? 'Foto ändern' : 'Foto wählen'}
        </FilePicker>
      </div>

      <h2 className="section-title">
        Kategorie <span className="required">Pflicht</span>
      </h2>
      <ChipGroup label="Kategorie" options={CATEGORIES} selected={category ? [category] : []} onToggle={setCategory} />
      <h2 className="section-title">Farbe</h2>
      <ChipGroup label="Farbe" options={COLORS} selected={colors} onToggle={(id) => setColors(toggleValue(colors, id))} />
      <h2 className="section-title">Saison</h2>
      <ChipGroup label="Saison" options={SEASONS} selected={seasons} onToggle={(id) => setSeasons(toggleValue(seasons, id))} />

      <label className="field">
        <span className="section-title">Notiz</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. von Oma, nur kalt waschen" />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="action-bar">
        {hint && <p className="action-bar__hint">{hint}</p>}
        <button type="button" className="button button--primary" disabled={!canSave} onClick={save}>
          {saving ? 'Speichert …' : 'Speichern'}
        </button>
      </div>
    </section>
  );
}
