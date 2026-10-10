import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { Icon } from '../components/Icon';
import { ItemGrid } from '../components/ItemGrid';
import { NotFound } from '../components/NotFound';
import { getItemsByIds } from '../db/items';
import { deleteOutfit, getOutfit } from '../db/outfits';
import { plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { navigate } from '../lib/route';

export function OutfitDetailScreen({ outfitId }: { outfitId: string }) {
  const outfit = useLiveQuery(async () => (await getOutfit(outfitId)) ?? null, [outfitId]);
  const items = useLiveQuery(async () => (outfit ? getItemsByIds(outfit.itemIds) : []), [outfit]);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (outfit === undefined || items === undefined) return null;
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

  return (
    <section className="screen-content">
      <header className="form-header">
        <a className="text-button text-button--back" href="#/outfits">
          <Icon name="back" size={20} />
          Outfits
        </a>
      </header>
      <div className="outfit-head">
        <h1 className="detail-title">{outfit.name}</h1>
        <span className="section-meta">{plural(items.length, 'Teil', 'Teile')}</span>
      </div>
      {items.length === 0 ? (
        <p className="muted">Keine Teile mehr – alle Teile dieses Outfits wurden gelöscht.</p>
      ) : (
        <ItemGrid items={items} size="large" onItemClick={(item) => navigate(`/item/${item.id}`)} />
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
    </section>
  );
}
