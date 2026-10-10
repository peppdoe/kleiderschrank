import type { TabId } from '../lib/route';

const TABS: { id: TabId; label: string; icon: string; href: string }[] = [
  { id: 'wardrobe', label: 'Schrank', icon: '👗', href: '#/' },
  { id: 'outfits', label: 'Outfits', icon: '✨', href: '#/outfits' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️', href: '#/settings' },
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
          <span className="tab__icon" aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
