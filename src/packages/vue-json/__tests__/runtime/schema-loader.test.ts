import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSchemaLoader, clearSchemaLoaderCache, type SchemaLoaderImpl } from '../../src/runtime/schema-loader';

vi.stubGlobal('fetch', vi.fn());

describe('SchemaLoader', () => {
  let loader: SchemaLoaderImpl;

  beforeEach(() => {
    loader = createSchemaLoader();
    clearSchemaLoaderCache();
  });

  afterEach(() => {
    clearSchemaLoaderCache();
    vi.restoreAllMocks();
  });

  describe('load()', () => {
    it('should load and return a valid schema', async () => {
      const mockSchema = {
        name: 'TestComponent',
        render: { type: 'template', content: { type: 'div', children: 'Hello' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      const result = await loader.load('/schemas/test.json');

      expect(result.success).toBe(true);
      expect(result.component).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error on fetch failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await loader.load('/schemas/invalid.json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('404');
    });

    it('should return error on invalid schema', async () => {
      const invalidSchema = { invalid: true };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(invalidSchema),
      });

      const result = await loader.load('/schemas/invalid.json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('cache', () => {
    it('should cache loaded schema by default', async () => {
      const mockSchema = {
        name: 'CachedComponent',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      await loader.load('/schemas/cached.json');
      await loader.load('/schemas/cached.json');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not cache when cache option is false', async () => {
      const mockSchema = {
        name: 'NoCacheComponent',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      await loader.load('/schemas/nocache.json', { cache: false });
      await loader.load('/schemas/nocache.json', { cache: false });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should check cached schema with hasCached', async () => {
      const mockSchema = {
        name: 'CachedCheck',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      expect(loader.hasCached('/schemas/check.json')).toBe(false);
      await loader.load('/schemas/check.json');
      expect(loader.hasCached('/schemas/check.json')).toBe(true);
    });
  });

  describe('clearCache()', () => {
    it('should clear all cached schemas', async () => {
      const mockSchema = {
        name: 'ClearCache',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      await loader.load('/schemas/clear.json');
      expect(loader.hasCached('/schemas/clear.json')).toBe(true);

      loader.clearCache();
      expect(loader.hasCached('/schemas/clear.json')).toBe(false);
    });
  });

  describe('preload()', () => {
    it('should load multiple schemas in parallel', async () => {
      const mockSchema = {
        name: 'PreloadComponent',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      const results = await loader.preload(['/schemas/a.json', '/schemas/b.json']);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
      expect(loader.hasCached('/schemas/a.json')).toBe(true);
      expect(loader.hasCached('/schemas/b.json')).toBe(true);
    });
  });
});