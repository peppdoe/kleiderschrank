import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { FilterTags } from '../components/FilterTags';
import { ItemGrid } from '../components/ItemGrid';
import { NotFound } from '../components/NotFound';
import { OutfitPreview } from '../components/OutfitPreview';
import { listItems } from '../db/items';
import { createOutfit, getOutfit, updateOutfit } from '../db/outfits';
import { userMessage } from '../lib/errors';
import { EMPTY_FILTER, applyFilter, toggleValue, type FilterState } from '../lib/filters';
import { navigate } from '../lib/route';

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
      </section>
    );
  }

  const visible = applyFilter(items, filter);
  return (
    <section className="screen-content form">
      <header className="form-header">
        <button type="button" className="text-button" onClick={() => navigate(cancelTarget, { replace: true })}>
          Abbrechen
        </button>
        <h1 className="form-header__title">{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
      </header>
      {items.length === 0 ? (
        <div className="empty"><p>Du hast noch keine Teile im Schrank.</p></div>
      ) : (
        <>
          <FilterTags value={filter} onChange={setFilter} resultCount={visible.length} />
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
    </section>
  );
}
