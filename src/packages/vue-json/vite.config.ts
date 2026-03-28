import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        composables: resolve(__dirname, 'src/composables/index.ts'),
      },
      name: 'VueJson',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@json-engine/core-engine'],
      output: {
        globals: {
          vue: 'Vue',
          '@json-engine/core-engine': 'CoreEngine',
        },
      },
    },
  },
});