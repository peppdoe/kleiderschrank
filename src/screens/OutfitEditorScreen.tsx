import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { FilterBar } from '../components/FilterBar';
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
        <header className="screen-header">
          <button type="button" className="link-button" onClick={() => setStep('pick')}>‹ Zurück</button>
          <h1>{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
        </header>
        <OutfitPreview itemIds={selected} />
        <label className="field">
          <span>Name des Outfits</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="button" className="button button--primary" disabled={!canSave} onClick={save}>
          {saving ? 'Speichert …' : 'Speichern'}
        </button>
      </section>
    );
  }

  const visible = applyFilter(items, filter);
  return (
    <section className="screen-content">
      <header className="screen-header">
        <button type="button" className="link-button" onClick={() => navigate(cancelTarget, { replace: true })}>
          Abbrechen
        </button>
        <h1>{outfitId ? 'Outfit bearbeiten' : 'Neues Outfit'}</h1>
        <button type="button" className="link-button" disabled={selected.length === 0} onClick={() => setStep('name')}>
          Weiter
        </button>
      </header>
      <p className="muted">{selected.length} ausgewählt</p>
      {items.length === 0 ? (
        <div className="empty"><p>Du hast noch keine Teile im Schrank.</p></div>
      ) : (
        <>
          <FilterBar value={filter} onChange={setFilter} />
          <ItemGrid
            items={visible}
            selectedIds={selected}
            onItemClick={(item) => setSelected(toggleValue(selected, item.id))}
          />
        </>
      )}
    </section>
  );
}
