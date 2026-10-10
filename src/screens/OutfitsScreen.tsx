import { useLiveQuery } from 'dexie-react-hooks';
import { OutfitPreview } from '../components/OutfitPreview';
import { listOutfits } from '../db/outfits';
import { navigate } from '../lib/route';

export function OutfitsScreen() {
  const outfits = useLiveQuery(listOutfits, []);
  if (!outfits) return null;

  return (
    <section className="screen-content">
      <header className="screen-header">
        <h1>Outfits</h1>
        {outfits.length > 0 && (
          <button type="button" className="link-button" onClick={() => navigate('/outfit/new')}>
            Neues Outfit
          </button>
        )}
      </header>

      {outfits.length === 0 ? (
        <div className="empty">
          <p>Noch keine Outfits. Stell dein erstes aus deinen Teilen zusammen.</p>
          <button type="button" className="button" onClick={() => navigate('/outfit/new')}>
            Neues Outfit
          </button>
        </div>
      ) : (
        <ul className="outfit-list">
          {outfits.map((outfit) => (
            <li key={outfit.id}>
              <button type="button" className="outfit-card" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                <span className="outfit-card__name">{outfit.name}</span>
                <OutfitPreview itemIds={outfit.itemIds} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
