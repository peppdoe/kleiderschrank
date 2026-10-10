import type { TabId } from '../lib/route';
import { Icon, type IconName } from './Icon';

const TABS: { id: TabId; label: string; icon: IconName; href: string }[] = [
  { id: 'wardrobe', label: 'Schrank', icon: 'hanger', href: '#/' },
  { id: 'outfits', label: 'Outfits', icon: 'outfit', href: '#/outfits' },
  { id: 'settings', label: 'Einstellungen', icon: 'settings', href: '#/settings' },
];

export function TabBar({ active }: { active: TabId }) {
  return (
    <nav className="tab-bar" aria-label="Hauptnavigation">
      {TABS.map((tab) => (
        <a
          key={tab.id}
          href={tab.href}
          className={tab.id === active ? 'tab tab--active' : 'tab'}
          aria-current={tab.id === active ? 'page' : undefined}
        >
          <Icon name={tab.icon} />
          <span className="tab__label">{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
