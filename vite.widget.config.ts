import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'widget/sdk.ts',
      name: 'HelpCenterWidget',
      fileName: 'sdk',
      formats: ['iife'],
    },
    outDir: 'dist/widget',
  },
});