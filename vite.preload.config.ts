import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.vite/preload',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron'],
    },
  },
});
