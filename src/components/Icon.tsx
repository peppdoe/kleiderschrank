import type { SeasonId } from '../lib/constants';

// Ein Strichsystem wie auf eingewebten Pflegeetiketten: 24er-Raster, 1.5px Strich, runde Enden.
const PATHS = {
  spring: 'M12 21v-7M7.5 6.5c0 4 1.9 7.5 4.5 7.5s4.5-3.5 4.5-7.5L14 8.6 12 5.5 10 8.6 7.5 6.5ZM12 17.5c-1.6-1.6-3.5-2.2-5.5-2',
  summer: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6',
  autumn: 'M5 19C5 11 10.5 5 19 5c0 8.5-6 14-14 14ZM5 19l8.5-8.5M9.5 14.5h3.2M12 12V8.8',
  winter: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.8 4.6 12 6.8l2.2-2.2M9.8 19.4l2.2-2.2 2.2 2.2',
  plus: 'M12 5v14M5 12h14',
  check: 'M5.5 12.5 10 17l8.5-9.5',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  filter: 'M4 7h16M7 12h10M10 17h4',
  back: 'M14.5 5.5 8 12l6.5 6.5',
  hanger: 'M10 6.5a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.3v1.2M12 10.8 3.6 16.6c-.9.6-.5 1.9.6 1.9h15.6c1.1 0 1.5-1.3.6-1.9L12 10.8Z',
  outfit: 'M9 4 4 6.5l1.6 3.8 2-.8V20h8.8V9.5l2 .8L20 6.5 15 4c-.4 1.6-1.6 2.6-3 2.6S9.4 5.6 9 4Z',
  settings: 'M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1M15 5v4M9 10v4M17 15v4',
  heart: 'M12 19.5c-.3 0-7.5-4.4-7.5-9.6A4 4 0 0 1 8.5 6c1.5 0 2.8.8 3.5 2 .7-1.2 2-2 3.5-2a4 4 0 0 1 4 3.9c0 5.2-7.2 9.6-7.5 9.6Z',
  camera: 'M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9ZM12 10a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, className, filled = false }: { name: IconName | SeasonId; size?: number; className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
