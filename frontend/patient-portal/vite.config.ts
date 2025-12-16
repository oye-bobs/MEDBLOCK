import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      exclude: ['buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    visualizer({
      filename: 'build/bundle-report.html',
      open: false,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'build',
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
