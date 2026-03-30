import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@json-engine/vue-json': resolve(__dirname, '../../vue-json/src'),
      '@json-engine/core-engine': resolve(__dirname, '../../core-engine/src'),
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2023',
        module: 'ESNext',
        skipLibCheck: true,
        paths: {
          '@json-engine/vue-json': [resolve(__dirname, '../../vue-json/src')],
          '@json-engine/core-engine': [resolve(__dirname, '../../core-engine/src')],
        },
      },
    },
  },
})
