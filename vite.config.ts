import { defineConfig } from 'vitest/config';
import { staticSite } from './src/site/plugin.ts';

export default defineConfig({
  appType: 'mpa',
  plugins: [staticSite()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]build[\\/]/ },
            { name: 'postprocessing', test: /[\\/]node_modules[\\/]postprocessing[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
