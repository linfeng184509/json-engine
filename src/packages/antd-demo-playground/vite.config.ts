import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  base: '/json-engine/',
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
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-vendor';
          }
          if (id.includes('node_modules/ant-design-vue/')) {
            return 'antd-vendor';
          }
          if (id.includes('node_modules/@ant-design/icons-vue/') || id.includes('node_modules/@ant-design/icons-svg/')) {
            return 'antd-icons';
          }
          if (id.includes('node_modules/lodash-es/')) {
            return 'lodash';
          }
          if (id.includes('@json-engine/vue-json') || id.includes('@json-engine/core-engine')) {
            return 'json-engine';
          }
        },
      },
    },
  },
});