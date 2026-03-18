// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yangcyyang.cn',
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Obsidian auto-saves aggressively; wait for writes to settle before reloading.
        awaitWriteFinish: {
          stabilityThreshold: 2500,
          pollInterval: 200,
        },
      },
    },
  }
});
