import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
    },
  },
  build: {
    outDir: '.vite/build',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron', 'path', 'fs', 'child_process', 'os'],
    },
  },
});
