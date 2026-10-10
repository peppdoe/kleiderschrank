import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { FilterTags } from '../components/FilterTags';
import { Icon } from '../components/Icon';
import { ItemGrid, tileLabel } from '../components/ItemGrid';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { OutfitPreview } from '../components/OutfitPreview';
import { listItems } from '../db/items';
import { createOutfit, getOutfit, updateOutfit } from '../db/outfits';
import { userMessage } from '../lib/errors';
import { EMPTY_FILTER, applyFilter, toggleValue, type FilterState } from '../lib/filters';
import { navigate } from '../lib/route';

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

export function OutfitEditorScreen({ outfitId }: { outfitId?: string }) {
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

  useEffect(() => {
    if (existing && !loaded) {
      setSelected(existing.itemIds);
      setName(existing.name);
      setLoaded(true);
    }
  }, [existing, loaded]);

  if (items === undefined || (outfitId && existing === undefined)) return null;
  if (outfitId && existing === null) return <NotFound text="Dieses Outfit gibt es nicht mehr." backTo="/outfits" />;

  const cancelTarget = outfitId ? `/outfit/${outfitId}` : '/outfits';
  const canSave = name.trim().length > 0 && selected.length > 0 && !saving;
  const dirty = !sameSet(selected, existing?.itemIds ?? []) || name.trim() !== (existing?.name ?? '');
  const cancel = () => (dirty ? setConfirmDiscard(true) : navigate(cancelTarget, { replace: true }));
  const discardSheet = confirmDiscard && (
    <ConfirmSheet
      title="Änderungen verwerfen?"
      message={outfitId ? 'Deine Änderungen an diesem Outfit gehen verloren.' : 'Das neue Outfit wird nicht gespeichert.'}
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

  async function save() {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      if (outfitId) {
        await updateOutfit(outfitId, name, selected);
        navigate(`/outfit/${outfitId}`, { replace: true });
      } else {
        const id = await createOutfit(name, selected);
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
          <h1 className="form-header__title">{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
        </header>
        <OutfitPreview itemIds={selected} />
        <label className="field">
          <span className="section-title">Name des Outfits</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Büro-Look" autoFocus />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="action-bar">
          {!name.trim() && <p className="action-bar__hint">Gib dem Outfit noch einen Namen.</p>}
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
        <h1 className="form-header__title">{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
      </header>
      {items.length === 0 ? (
        <div className="empty"><p>Du hast noch keine Teile im Schrank.</p></div>
      ) : (
        <>
          <FilterTags value={filter} onChange={setFilter} resultCount={visible.length} />
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
