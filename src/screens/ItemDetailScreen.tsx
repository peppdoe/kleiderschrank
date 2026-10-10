import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { Icon } from '../components/Icon';
import { ItemPhoto } from '../components/ItemPhoto';
import { NotFound } from '../components/NotFound';
import { deleteItem, getItem } from '../db/items';
import { listOutfitsWithItem } from '../db/outfits';
import { CATEGORIES, COLORS, SEASONS, labelOf } from '../lib/constants';
import { describeItem, itemTitle, plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { navigate } from '../lib/route';

export function ItemDetailScreen({ itemId }: { itemId: string }) {
  const item = useLiveQuery(async () => (await getItem(itemId)) ?? null, [itemId]);
  const outfits = useLiveQuery(() => listOutfitsWithItem(itemId), [itemId]);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (item === undefined) return null;
  if (item === null) return <NotFound text="Dieses Teil gibt es nicht mehr." backTo="/" />;

  async function remove() {
    setConfirming(false);
    try {
      await deleteItem(itemId);
      navigate('/', { replace: true });
    } catch (e) {
      setError(userMessage(e));
    }
  }

  const category = labelOf(CATEGORIES, item.category);
  const title = itemTitle(item);
  const noteRest = item.note.split('\n').slice(item.note.trim() ? 1 : 0).join('\n').trim();
  const colorText = item.colors.map((c) => labelOf(COLORS, c)).join(', ');
  const outfitCount = outfits?.length ?? 0;

  return (
    <section className="screen-content">
      <header className="form-header">
        <a className="text-button text-button--back" href="#/">
          <Icon name="back" size={20} />
          Schrank
        </a>
      </header>
      <ItemPhoto itemId={itemId} variant="full" alt={describeItem(item)} />

      {/* Das eingenähte Etikett: Name, Kategorie, Farben, Pflegesymbole, Notiz */}
      <div className="care-label">
        <h1 className="care-label__title">{title}</h1>
        {title !== category && <p className="care-label__kind">{category}</p>}
        {item.colors.length > 0 && (
          <p className="care-label__colors">
            <span className="care-label__swatches" aria-hidden="true">
              {item.colors.map((id) => (
                <span key={id} className="chip__swatch" style={{ background: COLORS.find((c) => c.id === id)?.swatch }} />
              ))}
            </span>
            <span>{colorText}</span>
          </p>
        )}
        {item.seasons.length > 0 && (
          <ul className="care-label__seasons">
            {SEASONS.filter((s) => item.seasons.includes(s.id)).map((season) => (
              <li key={season.id}>
                <Icon name={season.id} size={22} />
                <span>{season.label}</span>
              </li>
            ))}
          </ul>
        )}
        {noteRest && <p className="care-label__note">{noteRest}</p>}
      </div>

      {outfits && outfits.length > 0 && (
        <>
          <h2 className="section-title">In diesen Outfits</h2>
          <ul className="link-rows">
            {outfits.map((outfit) => (
              <li key={outfit.id}>
                <button type="button" className="link-row" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                  <span>{outfit.name}</span>
                  <Icon name="back" size={18} className="link-row__chevron" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      <div className="detail-actions">
        <button type="button" className="button button--wide" onClick={() => navigate(`/item/${itemId}/edit`)}>
          Bearbeiten
        </button>
        <button type="button" className="text-button text-button--danger" onClick={() => setConfirming(true)}>
          Löschen
        </button>
      </div>

      {confirming && (
        <ConfirmSheet
          title="Teil löschen?"
          message={
            outfitCount > 0
              ? `„${title}“ wird gelöscht. Es wird auch aus ${plural(outfitCount, 'Outfit', 'Outfits')} entfernt.`
              : `„${title}“ wird gelöscht.`
          }
          confirmLabel="Löschen"
          destructive
          onConfirm={() => void remove()}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  );
}
