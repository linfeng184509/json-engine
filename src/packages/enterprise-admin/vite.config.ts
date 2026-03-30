import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteMockServe } from 'vite-plugin-mock';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
      watchFiles: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@json-engine/vue-json': resolve(__dirname, '../vue-json/src'),
      '@json-engine/core-engine': resolve(__dirname, '../core-engine/src'),
      '@json-engine/plugin-axios': resolve(__dirname, '../plugins/plugin-axios/src'),
      '@json-engine/plugin-antd': resolve(__dirname, '../plugins/plugin-antd/src'),
      '@json-engine/plugin-router': resolve(__dirname, '../plugins/plugin-router/src'),
      '@json-engine/plugin-websocket': resolve(__dirname, '../plugins/plugin-websocket/src'),
      '@json-engine/plugin-storage': resolve(__dirname, '../plugins/plugin-storage/src'),
      '@json-engine/plugin-auth': resolve(__dirname, '../plugins/plugin-auth/src'),
      '@json-engine/plugin-i18n': resolve(__dirname, '../plugins/plugin-i18n/src'),
    },
  },
  server: {
    port: 3002,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});