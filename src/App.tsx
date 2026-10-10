import { useState, type ReactElement } from 'react';
import { TabBar } from './components/TabBar';
import { EMPTY_FILTER, type FilterState } from './lib/filters';
import { navigate, tabOf, useRoute } from './lib/route';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { ItemFormScreen } from './screens/ItemFormScreen';
import { WardrobeScreen } from './screens/WardrobeScreen';

export default function App() {
  const route = useRoute();
  const [draftPhoto, setDraftPhoto] = useState<File | null>(null);
  const [wardrobeFilter, setWardrobeFilter] = useState<FilterState>(EMPTY_FILTER);

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
      screen = <ItemFormScreen key="new" initialFile={draftPhoto} />;
      break;
    case 'itemEdit':
      screen = <ItemFormScreen key={`edit-${route.id}`} itemId={route.id} />;
      break;
    default:
      screen = <WardrobeScreen filter={wardrobeFilter} onFilterChange={setWardrobeFilter} onPickPhoto={startNewItem} />;
  }

  return (
    <div className="app">
      {screen}
      <TabBar active={tabOf(route)} />
    </div>
  );
}
