import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@json-engine/vue-json': resolve(__dirname, '../vue-json/dist'),
      '@json-engine/core-engine': resolve(__dirname, '../core-engine/src'),
      '@json-engine/plugin-antd': resolve(__dirname, '../plugins/plugin-antd/src'),
      '@json-engine/plugin-router': resolve(__dirname, '../plugins/plugin-router/src'),
    },
  },
  server: {
    port: 3014,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});