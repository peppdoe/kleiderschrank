import { useLiveQuery } from 'dexie-react-hooks';
import { Icon } from '../components/Icon';
import { OutfitLook } from '../components/OutfitLook';
import { OutfitSeasons } from '../components/OutfitSeasons';
import { listItems } from '../db/items';
import { listOutfits } from '../db/outfits';
import { navigate } from '../lib/route';

export function OutfitsScreen() {
  const outfits = useLiveQuery(listOutfits, []);
  const items = useLiveQuery(listItems, []);
  if (!outfits || !items) return null;

  return (
    <section className="screen-content">
      <header className="page-header">
        <h1 className="page-header__title">Looks</h1>
        <span className="section-meta">{outfits.length > 0 ? `${outfits.length} gespeichert` : ''}</span>
      </header>

      {outfits.length === 0 ? (
        <div className="empty">
          <p>Noch keine Looks. Kombinier deine Lieblingsteile zu deinem ersten.</p>
          <button type="button" className="button" onClick={() => navigate('/outfit/new')}>
            Neuer Look
          </button>
        </div>
      ) : (
        <ul className="outfit-list">
          {outfits.map((outfit) => (
            <li key={outfit.id}>
              <button
                type="button"
                className="outfit-card"
                aria-labelledby={`outfit-name-${outfit.id}`}
                aria-describedby={`outfit-seasons-${outfit.id}`}
                onClick={() => navigate(`/outfit/${outfit.id}`)}
              >
                <OutfitLook outfitId={outfit.id} itemIds={outfit.itemIds} />
                <span className="outfit-card__name" id={`outfit-name-${outfit.id}`}>{outfit.name}</span>
                <OutfitSeasons itemIds={outfit.itemIds} items={items} as="span" id={`outfit-seasons-${outfit.id}`} compact />
              </button>
            </li>
          ))}
        </ul>
      )}

      {outfits.length > 0 && (
        <button type="button" className="fab" aria-label="Neuer Look" onClick={() => navigate('/outfit/new')}>
          <Icon name="plus" size={28} />
        </button>
      )}
    </section>
  );
}
