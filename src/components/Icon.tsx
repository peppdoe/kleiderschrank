import type { SeasonId } from '../lib/constants';

// Ein Strichsystem wie auf eingewebten Pflegeetiketten: 24er-Raster, 1.5px Strich, runde Enden.
const PATHS = {
  // Saisons als echte Pflegesymbole mit Saisonzeichen: Waschbottich mit Spross, Trockner-Quadrat als Sonne, Bügeleisen mit Blatt, Bleich-Dreieck mit Schneeflocke.
  spring: 'M3.5 9.5c1.4-1.3 2.8-1.3 4.2 0s2.8 1.3 4.3 0 2.9-1.3 4.3 0 2.8 1.3 4.2 0l-1.9 9.5H5.4L3.5 9.5ZM12 17v-4.2M12 13.6c-1.5 0-2.5-.9-2.5-2.3 1.5 0 2.5.9 2.5 2.3ZM12 12.8c0-1.4 1-2.3 2.5-2.3 0 1.4-1 2.3-2.5 2.3Z',
  summer: 'M4.5 4.5h15v15h-15ZM12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2ZM12 6.6v1.1M12 16.3v1.1M6.6 12h1.1M16.3 12h1.1',
  autumn: 'M3.5 17.5h17v-3c0-2.8-2.2-5-5-5H10c-3.2 0-5.8 3.3-6.5 8ZM9.5 9.5l-.8-2.5h8.6l.7 2.5M11.2 15.3c0-1.9 1.5-3.2 3.8-3.2 0 1.9-1.5 3.2-3.8 3.2ZM11.2 15.3l2.2-1.9',
  winter: 'M12 4.2 20.5 19h-17L12 4.2ZM12 11.2v5.6M9.6 12.6l4.8 2.8M9.6 15.4l4.8-2.8',
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
