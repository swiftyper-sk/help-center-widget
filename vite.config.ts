import { defineConfig } from 'vite';
import path from "path";
import react from '@vitejs/plugin-react';
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

export default defineConfig({
  base: "./",
  root: "src",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    }
  },
  plugins: [react({
    babel: {
      plugins: [
        ['babel-plugin-fbt', {
          fbtEnumPath: path.join(__dirname, '.enum_manifest.json'),
          fbtSuppressRuntimeTransform: true,
        }],
        'babel-plugin-fbt-runtime',
      ]
    }
  }), nodePolyfills()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    outDir: '../dist/app',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
});