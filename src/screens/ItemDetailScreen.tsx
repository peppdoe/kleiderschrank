import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { deleteItem, getItem } from '../db/items';
import { listOutfitsWithItem } from '../db/outfits';
import { CATEGORIES, COLORS, SEASONS, labelOf } from '../lib/constants';
import { describeItem, plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { navigate } from '../lib/route';

export function ItemDetailScreen({ itemId }: { itemId: string }) {
  const item = useLiveQuery(async () => (await getItem(itemId)) ?? null, [itemId]);
  const outfits = useLiveQuery(() => listOutfitsWithItem(itemId), [itemId]);
  const [error, setError] = useState<string | null>(null);

  if (item === undefined) return null;
  if (item === null) return <NotFound text="Dieses Teil gibt es nicht mehr." backTo="/" />;

  async function remove() {
    const count = outfits?.length ?? 0;
    const message = count > 0
      ? `Dieses Teil wirklich löschen? Es wird auch aus ${plural(count, 'Outfit', 'Outfits')} entfernt.`
      : 'Dieses Teil wirklich löschen?';
    if (!window.confirm(message)) return;
    try {
      await deleteItem(itemId);
      navigate('/', { replace: true });
    } catch (e) {
      setError(userMessage(e));
    }
  }

  const colorText = item.colors.map((c) => labelOf(COLORS, c)).join(', ') || '–';
  const seasonText = item.seasons.map((s) => labelOf(SEASONS, s)).join(', ') || '–';

  return (
    <section className="screen-content">
      <header className="screen-header">
        <a className="link-button" href="#/">‹ Schrank</a>
      </header>
      <ItemPhoto itemId={itemId} variant="full" alt={describeItem(item)} />
      <h1>{labelOf(CATEGORIES, item.category)}</h1>
      <dl className="details">
        <dt>Farben</dt>
        <dd>{colorText}</dd>
        <dt>Saison</dt>
        <dd>{seasonText}</dd>
        {item.note && (
          <>
            <dt>Notiz</dt>
            <dd>{item.note}</dd>
          </>
        )}
      </dl>

      {outfits && outfits.length > 0 && (
        <>
          <h2>In diesen Outfits</h2>
          <ul className="link-list">
            {outfits.map((outfit) => (
              <li key={outfit.id}>
                <button type="button" className="link-button" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                  {outfit.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      <div className="actions">
        <button type="button" className="button" onClick={() => navigate(`/item/${itemId}/edit`)}>
          Bearbeiten
        </button>
        <button type="button" className="button button--danger" onClick={remove}>
          Löschen
        </button>
      </div>
    </section>
  );
}
