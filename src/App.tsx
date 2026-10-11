import { useEffect, useState, type ReactElement } from 'react';
import { TabBar } from './components/TabBar';
import { Toast, useNoticeTimer, type Notice } from './components/Toast';
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
  // Zählt mit, damit „Speichern und nächstes Teil“ ein frisches Formular bekommt.
  const [draftCount, setDraftCount] = useState(0);
  // Morgens zählt die aktuelle Saison: sie ist beim Öffnen vorausgewählt.
  const [wardrobeFilter, setWardrobeFilter] = useState<FilterState>(() => ({ ...EMPTY_FILTER, seasons: [seasonOf(new Date())] }));
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [savedOutfitId, setSavedOutfitId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  // Fokus oder Finger auf „Rückgängig“ halten die Meldung fest (VoiceOver braucht Zeit).
  const [noticeHeld, setNoticeHeld] = useState(false);
  const notify = (text: string, action?: Notice['action']) => {
    // Eine neue Meldung ersetzt den alten Knopf; dessen Blur kommt beim Aushängen nicht immer an.
    setNoticeHeld(false);
    setNotice({ text, action });
  };

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

  useNoticeTimer(notice, noticeHeld, () => setNotice(null));

  useEffect(() => {
    if (!savedOutfitId) return undefined;
    const timer = setTimeout(() => setSavedOutfitId(null), SAVED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [savedOutfitId]);

  // Ein neues Teil soll sichtbar sein: passt es nicht zum aktuellen Filter, wird der Filter gelöst.
  function itemCreated(item: Item, next?: File) {
    // Die Saison versteckt nichts mehr; nur Kategorie-, Farb- oder Lieblingsfilter könnten das neue Teil verbergen.
    if (!matchesFilter(item, { ...wardrobeFilter, seasons: [] })) setWardrobeFilter({ ...EMPTY_FILTER, seasons: wardrobeFilter.seasons });
    setSavedItemId(item.id);
    notify('Teil gespeichert');
    if (next) {
      setDraftPhoto(next);
      setDraftCount((count) => count + 1);
      // Das neue Formular beginnt oben beim Foto, nicht unten bei der Aktionsleiste.
      window.scrollTo?.({ top: 0 });
    }
  }

  function outfitSaved(id: string) {
    setSavedOutfitId(id);
    notify('Look gespeichert');
  }

  function startNewItem(file: File) {
    setDraftPhoto(file);
    navigate('/item/new');
  }

  let screen: ReactElement;
  switch (route.name) {
    case 'item':
      screen = <ItemDetailScreen key={route.id} itemId={route.id} chosenSeason={threadSeason} onNotice={notify} />;
      break;
    case 'itemNew':
      screen = <ItemFormScreen key={`new-${draftCount}`} initialFile={draftPhoto} onCreated={itemCreated} />;
      break;
    case 'itemEdit':
      screen = <ItemFormScreen key={`edit-${route.id}`} itemId={route.id} />;
      break;
    case 'outfits':
      screen = <OutfitsScreen onPickPhoto={startNewItem} />;
      break;
    case 'outfitNew':
      screen = <OutfitEditorScreen key="new" onSaved={outfitSaved} />;
      break;
    case 'outfit':
      screen = <OutfitDetailScreen key={route.id} outfitId={route.id} justSaved={savedOutfitId === route.id} onNotice={notify} />;
      break;
    case 'outfitEdit':
      screen = <OutfitEditorScreen key={`edit-${route.id}`} outfitId={route.id} onSaved={outfitSaved} />;
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
      {/* Die Einstellungen haben ihre eigene Statuszeile; überall sonst bleibt der Ansagebereich eingehängt. */}
      {route.name !== 'settings' && route.name !== 'settingsBackup' && <Toast notice={notice} onHold={setNoticeHeld} />}
      {!inForm && <TabBar active={tabOf(route)} />}
    </div>
  );
}
