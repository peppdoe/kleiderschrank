import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { FilePicker } from '../components/FilePicker';
import { FilterTags } from '../components/FilterTags';
import { Icon } from '../components/Icon';
import { InstallNotice } from '../components/InstallNotice';
import { ItemGrid } from '../components/ItemGrid';
import { LabelBand } from '../components/LabelBand';
import { OutfitPreview } from '../components/OutfitPreview';
import { SeasonSymbols } from '../components/SeasonSymbols';
import { listItems } from '../db/items';
import { META_INSTALL_HINT_DISMISSED, META_LAST_BACKUP, META_USER_NAME, getMeta, setMeta } from '../db/meta';
import { listOutfits } from '../db/outfits';
import { needsBackupReminder } from '../lib/backupReminder';
import { SEASONS, labelOf } from '../lib/constants';
import { plural } from '../lib/describe';
import { EMPTY_FILTER, applyFilter, toggleValue, type FilterState } from '../lib/filters';
import { greetingFor, seasonOf, wardrobeTitle } from '../lib/greeting';
import { navigate } from '../lib/route';
import { isStandalone } from '../lib/storage';
import { outfitsForSeason } from '../lib/today';

interface WardrobeScreenProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onPickPhoto: (file: File) => void;
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

export function WardrobeScreen({ filter, onFilterChange, onPickPhoto }: WardrobeScreenProps) {
  const items = useLiveQuery(listItems, []);
  const outfits = useLiveQuery(listOutfits, []);
  // undefined = lädt noch, null = nicht gesetzt
  const lastBackup = useLiveQuery(async () => (await getMeta(META_LAST_BACKUP)) ?? null, []);
  const name = useLiveQuery(async () => (await getMeta(META_USER_NAME)) ?? '', []);
  const hintDismissed = useLiveQuery(async () => (await getMeta(META_INSTALL_HINT_DISMISSED)) === 'true', []);
  const [pick] = useState(() => Math.random()); // pro Öffnen ein Spruch, nicht bei jedem Render

  if (!items || name === undefined) return null;

  const now = new Date();
  const season = seasonOf(now);
  const greeting = greetingFor({ name, now, pick });
  const visible = applyFilter(items, filter);
  const today = outfits ? outfitsForSeason(outfits, items, season) : [];
  const showInstallHint = !isStandalone() && hintDismissed === false;
  const showBackupHint = lastBackup !== undefined && needsBackupReminder(lastBackup ?? undefined, items.length);

  return (
    <section className="screen-content">
      <LabelBand
        brand={wardrobeTitle(name)}
        title={greeting.title}
        line={greeting.line}
        meta={`${dateFormat.format(now)} · ${labelOf(SEASONS, season)}`}
      />

      <SeasonSymbols
        selected={filter.seasons}
        current={season}
        onToggle={(id) => onFilterChange({ ...filter, seasons: toggleValue(filter.seasons, id) })}
      />

      {showInstallHint && <InstallNotice onDismiss={() => void setMeta(META_INSTALL_HINT_DISMISSED, 'true')} />}
      {showBackupHint && (
        <button type="button" className="notice-line notice-line--action" onClick={() => navigate('/settings')}>
          Zeit für ein Backup – tippen, um deine Daten zu sichern.
        </button>
      )}

      {today.length > 0 && (
        <section className="today" aria-labelledby="today-title">
          <div className="section-head">
            <h2 id="today-title" className="section-title">Heute</h2>
            <span className="section-meta">{plural(today.length, 'Outfit passt', 'Outfits passen')}</span>
          </div>
          <ul className="today__row">
            {today.map((outfit) => (
              <li key={outfit.id}>
                <button type="button" className="today__card" onClick={() => navigate(`/outfit/${outfit.id}`)}>
                  <OutfitPreview itemIds={outfit.itemIds} />
                  <span className="today__name">{outfit.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="section-head">
        <h2 className="section-title">Schrank</h2>
        <span className="section-meta">{plural(items.length, 'Teil', 'Teile')}</span>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <p>Noch keine Teile – tippe auf +, um dein erstes Teil zu erfassen.</p>
        </div>
      ) : (
        <>
          <FilterTags value={filter} onChange={onFilterChange} />
          {visible.length === 0 ? (
            <div className="empty">
              <p>Keine Teile passen zu diesen Filtern.</p>
              <button type="button" className="button" onClick={() => onFilterChange(EMPTY_FILTER)}>
                Alle Teile anzeigen
              </button>
            </div>
          ) : (
            <ItemGrid items={visible} onItemClick={(item) => navigate(`/item/${item.id}`)} />
          )}
        </>
      )}

      <FilePicker className="fab" label="Teil hinzufügen" accept="image/*" onPick={onPickPhoto}>
        <Icon name="plus" size={28} />
      </FilePicker>

    </section>
  );
}
