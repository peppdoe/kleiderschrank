import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { FilePicker } from '../components/FilePicker';
import { FilterTags } from '../components/FilterTags';
import { Icon } from '../components/Icon';
import { InstallNotice } from '../components/InstallNotice';
import { ItemGrid } from '../components/ItemGrid';
import { LabelBand } from '../components/LabelBand';
import { OutfitLook } from '../components/OutfitLook';
import { SeasonSymbols } from '../components/SeasonSymbols';
import { listItems } from '../db/items';
import { META_INSTALL_HINT_DISMISSED, META_LAST_BACKUP, META_USER_NAME, getMeta, setMeta } from '../db/meta';
import { listOutfits } from '../db/outfits';
import { needsBackupReminder } from '../lib/backupReminder';
import { SEASONS, labelOf, type SeasonId } from '../lib/constants';
import { plural } from '../lib/describe';
import { EMPTY_FILTER, applyFilter, type FilterState } from '../lib/filters';
import { greetingFor, seasonOf } from '../lib/greeting';
import { navigate } from '../lib/route';
import { isStandalone } from '../lib/storage';
import { outfitsForSeason } from '../lib/today';

interface WardrobeScreenProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onPickPhoto: (file: File) => void;
  /** Gerade gespeichertes Teil, wird kurz markiert. */
  highlightId?: string | null;
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

export function WardrobeScreen({ filter, onFilterChange, onPickPhoto, highlightId }: WardrobeScreenProps) {
  const items = useLiveQuery(listItems, []);
  const outfits = useLiveQuery(listOutfits, []);
  // undefined = lädt noch, null = nicht gesetzt
  const lastBackup = useLiveQuery(async () => (await getMeta(META_LAST_BACKUP)) ?? null, []);
  const name = useLiveQuery(async () => (await getMeta(META_USER_NAME)) ?? '', []);
  const hintDismissed = useLiveQuery(async () => (await getMeta(META_INSTALL_HINT_DISMISSED)) === 'true', []);
  const [pick] = useState(() => Math.random()); // pro Öffnen ein Spruch, nicht bei jedem Render
  const [hintHidden, setHintHidden] = useState(false); // sofort weg, auch bevor die Datenbank antwortet

  if (!items || name === undefined) return null;

  const now = new Date();
  const current = seasonOf(now);
  const visible = applyFilter(items, filter);
  // Die Saison-Reihe ist der „Heute“-Regler: genau eine Saison gewählt → Heute zeigt deren Outfits.
  const todaySeason: SeasonId = filter.seasons.length === 1 ? filter.seasons[0] : current;
  const greeting = greetingFor({ name, now, pick, season: todaySeason });
  // Liegt die leere Auswahl an anderen Filtern, bleibt die Saison (der Heute-Regler) stehen.
  const withSeasonOnly: FilterState = { ...EMPTY_FILTER, seasons: filter.seasons };
  const seasonAloneShows = applyFilter(items, withSeasonOnly).length > 0;
  const todayLabel = labelOf(SEASONS, todaySeason);
  const today = outfits ? outfitsForSeason(outfits, items, todaySeason) : [];

  function chooseSeason(id: SeasonId) {
    const only = filter.seasons.length === 1 && filter.seasons[0] === id;
    onFilterChange({ ...filter, seasons: only ? [] : [id] });
  }

  // Höchstens ein Hinweis: das Backup geht vor, sonst der Installationstipp.
  const showBackupHint = lastBackup !== undefined && needsBackupReminder(lastBackup ?? undefined, items.length);
  const showInstallHint = !showBackupHint && !isStandalone() && hintDismissed === false && !hintHidden;

  return (
    <section className="screen-content">
      {/* Wie auf einem echten Pflegeetikett stehen die Saisons auf dem Band selbst: Gruß und Heute-Regler sind eins. */}
      <LabelBand title={greeting.title} line={greeting.line}>
        <SeasonSymbols label="Saison wählen" selected={filter.seasons} current={current} onToggle={chooseSeason} />
      </LabelBand>

      {today.length > 0 && (
        <section className="today" aria-labelledby="today-title">
          <div className="section-head">
            <h2 id="today-title" className="section-title">
              {todaySeason === current ? 'Heute' : `Für den ${todayLabel}`}
            </h2>
            {/* Die Saison steht schon in der Überschrift; daneben das Datum oder, für eine andere Saison, die Anzahl. */}
            <span className="section-meta">
              {todaySeason === current ? dateFormat.format(now) : plural(today.length, 'Look', 'Looks')}
            </span>
          </div>
          <ul className="today__row">
            {today.map((outfit) => (
              <li key={outfit.id}>
                <button type="button" className="today__strip" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                  <OutfitLook outfitId={outfit.id} itemIds={outfit.itemIds} />
                  <span className="today__name">{outfit.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showBackupHint && (
        <button type="button" className="quiet-link" onClick={() => navigate('/settings/backup')}>
          Zeit für ein Backup – jetzt sichern
        </button>
      )}
      <div className="section-head section-head--start">
        <h2 className="section-title">Schrank</h2>
        <span className="section-meta">
          <span>
            {visible.length !== items.length
              ? `${visible.length} von ${items.length} ${items.length === 1 ? 'Teil' : 'Teilen'}`
              : plural(items.length, 'Teil', 'Teile')}
          </span>
          {filter.seasons.length > 0 && <span> · {filter.seasons.map((id) => labelOf(SEASONS, id)).join(', ')}</span>}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <p>Noch leer hier. Tipp auf + und fotografier dein erstes Teil.</p>
        </div>
      ) : (
        <>
          <FilterTags value={filter} onChange={onFilterChange} resultCount={visible.length} excludeSeasons items={items} />
          {visible.length === 0 ? (
            filter.favorites && !items.some((item) => item.favorite) ? (
              <div className="empty">
                <p>Noch keine Lieblinge. Tipp bei einem Teil aufs Herz.</p>
                <button type="button" className="button" onClick={() => onFilterChange({ ...filter, favorites: false })}>
                  Lieblinge aus
                </button>
              </div>
            ) : (
              <div className="empty">
                <p>Keine Teile passen zu diesen Filtern.</p>
                {seasonAloneShows ? (
                  <button type="button" className="button" onClick={() => onFilterChange(withSeasonOnly)}>
                    Filter lösen
                  </button>
                ) : (
                  <button type="button" className="button" onClick={() => onFilterChange(EMPTY_FILTER)}>
                    Alle Teile anzeigen
                  </button>
                )}
              </div>
            )
          ) : (
            <ItemGrid items={visible} highlightId={highlightId} onItemClick={(item) => navigate(`/item/${item.id}`)} />
          )}
        </>
      )}

      {/* Die Kleidung geht vor: der Installationstipp steht nach dem Schrank. */}
      {showInstallHint && (
        <InstallNotice
          onDismiss={() => {
            setHintHidden(true);
            void setMeta(META_INSTALL_HINT_DISMISSED, 'true');
          }}
        />
      )}

      <FilePicker className="fab" label="Teil hinzufügen" accept="image/*" onPick={onPickPhoto}>
        <Icon name="plus" size={28} />
      </FilePicker>
    </section>
  );
}
