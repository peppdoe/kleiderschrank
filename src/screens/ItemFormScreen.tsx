import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChipGroup } from '../components/ChipGroup';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { FilePicker } from '../components/FilePicker';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { SeasonSymbols } from '../components/SeasonSymbols';
import { createItem, getItem, updateItem, type PhotoBlobs } from '../db/items';
import type { Item } from '../db/schema';
import {
  CATEGORIES, COLORS, type CategoryId, type ColorId, type SeasonId,
} from '../lib/constants';
import { userMessage } from '../lib/errors';
import { toggleValue } from '../lib/filters';
import { processPhoto } from '../lib/image';
import { navigate } from '../lib/route';
import { useObjectUrl } from '../lib/useObjectUrl';

interface ItemFormScreenProps {
  itemId?: string;
  initialFile?: File | null;
  /** Neues Teil gespeichert: der Schrank markiert es. */
  onCreated?: (item: Item) => void;
}

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

export function ItemFormScreen({ itemId, initialFile, onCreated }: ItemFormScreenProps) {
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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
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
  // Erst zeigen, wenn die gespeicherten Werte übernommen sind – sonst würde ein früher Tipp überschrieben.
  if (itemId && !loaded) return null;

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
        const id = await createItem(input, photo!);
        const created = await getItem(id);
        if (created) onCreated?.(created);
        navigate('/', { replace: true });
      }
    } catch (e) {
      setError(userMessage(e));
      savingRef.current = false;
      setSaving(false);
    }
  }

  // Hat sich gegenüber dem Ausgangsstand etwas geändert? Dann vor dem Verwerfen fragen.
  const initial = existing ?? { category: null, colors: [], seasons: [], note: '' };
  const dirty =
    photo !== null ||
    category !== initial.category ||
    !sameSet(colors, initial.colors) ||
    !sameSet(seasons, initial.seasons) ||
    note.trim() !== initial.note.trim();
  const cancel = () => (dirty ? setConfirmDiscard(true) : navigate(cancelTarget, { replace: true }));

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
        <button type="button" className="text-button" onClick={cancel}>
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
        Kategorie <span className="required">wähl eine</span>
      </h2>
      <ChipGroup label="Kategorie" options={CATEGORIES} selected={category ? [category] : []} onToggle={setCategory} />
      <h2 className="section-title">Farbe</h2>
      <ChipGroup label="Farbe" options={COLORS} selected={colors} onToggle={(id) => setColors(toggleValue(colors, id))} />
      <h2 className="section-title">Saison</h2>
      <SeasonSymbols label="Saison" selected={seasons} onToggle={(id) => setSeasons(toggleValue(seasons, id))} />
      {seasons.length === 0 && <p className="field-hint">Ohne Saison passt das Teil das ganze Jahr.</p>}

      <label className="field">
        <span className="section-title">Notiz</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Vintage-Fund, nur kalt waschen" />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="action-bar">
        {hint && <p className="action-bar__hint">{hint}</p>}
        <button type="button" className="button button--primary" disabled={!canSave} onClick={save}>
          {saving ? 'Speichert …' : 'Speichern'}
        </button>
      </div>

      {confirmDiscard && (
        <ConfirmSheet
          title="Änderungen verwerfen?"
          message={itemId ? 'Deine Änderungen an diesem Teil gehen verloren.' : 'Das neue Teil wird nicht gespeichert.'}
          confirmLabel="Verwerfen"
          cancelLabel="Weiter bearbeiten"
          destructive
          onConfirm={() => navigate(cancelTarget, { replace: true })}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </section>
  );
}
