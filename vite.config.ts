import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/kleiderschrank/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['src/**/*.test.tsx', 'jsdom']],
    setupFiles: ['src/test/setup.ts'],
  },
});
