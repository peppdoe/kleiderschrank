import { useEffect, useState, type ReactElement } from 'react';
import { TabBar } from './components/TabBar';
import type { Item } from './db/schema';
import { EMPTY_FILTER, matchesFilter, type FilterState } from './lib/filters';
import { seasonOf } from './lib/greeting';
import { navigate, tabOf, useRoute } from './lib/route';
import { requestPersistence } from './lib/storage';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { ItemFormScreen } from './screens/ItemFormScreen';
import { OutfitDetailScreen } from './screens/OutfitDetailScreen';
import { OutfitEditorScreen } from './screens/OutfitEditorScreen';
import { OutfitsScreen } from './screens/OutfitsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WardrobeScreen } from './screens/WardrobeScreen';

const SAVED_NOTICE_MS = 3500;

export default function App() {
  const route = useRoute();
  const [draftPhoto, setDraftPhoto] = useState<File | null>(null);
  // Morgens zählt die aktuelle Saison: sie ist beim Öffnen vorausgewählt.
  const [wardrobeFilter, setWardrobeFilter] = useState<FilterState>(() => ({ ...EMPTY_FILTER, seasons: [seasonOf(new Date())] }));
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  useEffect(() => {
    requestPersistence().catch(() => undefined);
  }, []);

  // Die Fadenfarbe der Nähte folgt der gewählten Saison (ohne Wahl: der aktuellen).
  const threadSeason = wardrobeFilter.seasons.length === 1 ? wardrobeFilter.seasons[0] : seasonOf(new Date());
  useEffect(() => {
    document.documentElement.dataset.season = threadSeason;
  }, [threadSeason]);

  // Das Originalfoto (oft 5–15 MB) nur so lange halten, wie das Formular offen ist.
  useEffect(() => {
    if (route.name !== 'itemNew') setDraftPhoto(null);
  }, [route.name]);

  useEffect(() => {
    if (!savedItemId) return undefined;
    const timer = setTimeout(() => setSavedItemId(null), SAVED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [savedItemId]);

  // Ein neues Teil soll sichtbar sein: passt es nicht zum aktuellen Filter, wird der Filter gelöst.
  function itemCreated(item: Item) {
    if (!matchesFilter(item, wardrobeFilter)) setWardrobeFilter(EMPTY_FILTER);
    setSavedItemId(item.id);
  }

  function startNewItem(file: File) {
    setDraftPhoto(file);
    navigate('/item/new');
  }

  let screen: ReactElement;
  switch (route.name) {
    case 'item':
      screen = <ItemDetailScreen key={route.id} itemId={route.id} />;
      break;
    case 'itemNew':
      screen = <ItemFormScreen key="new" initialFile={draftPhoto} onCreated={itemCreated} />;
      break;
    case 'itemEdit':
      screen = <ItemFormScreen key={`edit-${route.id}`} itemId={route.id} />;
      break;
    case 'outfits':
      screen = <OutfitsScreen />;
      break;
    case 'outfitNew':
      screen = <OutfitEditorScreen key="new" />;
      break;
    case 'outfit':
      screen = <OutfitDetailScreen key={route.id} outfitId={route.id} />;
      break;
    case 'outfitEdit':
      screen = <OutfitEditorScreen key={`edit-${route.id}`} outfitId={route.id} />;
      break;
    case 'settings':
      screen = <SettingsScreen key="settings" />;
      break;
    case 'settingsBackup':
      screen = <SettingsScreen key="settings-backup" prepareBackup />;
      break;
    default:
      screen = (
        <WardrobeScreen
          filter={wardrobeFilter}
          onFilterChange={setWardrobeFilter}
          onPickPhoto={startNewItem}
          highlightId={savedItemId}
        />
      );
  }

  // In Formularen keine Tab-Leiste: ein versehentlicher Tipp würde die Eingaben verwerfen.
  const inForm = ['itemNew', 'itemEdit', 'outfitNew', 'outfitEdit'].includes(route.name);

  return (
    <div className={inForm ? 'app app--form' : 'app'}>
      {screen}
      {savedItemId && route.name === 'wardrobe' && (
        <p className="toast" role="status">
          Teil gespeichert
        </p>
      )}
      {!inForm && <TabBar active={tabOf(route)} />}
    </div>
  );
}
