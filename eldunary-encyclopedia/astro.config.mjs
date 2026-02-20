import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { remarkEntityLinker } from './src/plugins/remark-entity-linker.ts';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkEntityLinker],
    shikiConfig: {
      theme: 'dark-plus',
    },
  },
  vite: {
    optimizeDeps: {
      include: ['leaflet'],
    },
  },
});
