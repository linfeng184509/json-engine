import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCoreScope, setCoreScope, getCoreScope, type CoreScope } from '../../src/composables/use-core-scope';
import { clearSchemaLoaderCache } from '../../src/runtime/schema-loader';

const mockWindow = {
  location: {
    hash: '#/',
    replace: vi.fn(),
  },
  history: {
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
};

vi.stubGlobal('window', mockWindow);

describe('CoreScope Extension', () => {
  let scope: CoreScope;

  beforeEach(() => {
    clearSchemaLoaderCache();
    scope = createCoreScope();
    setCoreScope(scope);
  });

  afterEach(() => {
    clearSchemaLoaderCache();
    vi.restoreAllMocks();
  });

  describe('_loader API', () => {
    it('should have _loader property', () => {
      expect(scope._loader).toBeDefined();
    });

    it('should have load method', () => {
      expect(typeof scope._loader.load).toBe('function');
    });

    it('should have clearCache method', () => {
      expect(typeof scope._loader.clearCache).toBe('function');
    });

    it('should have preload method', () => {
      expect(typeof scope._loader.preload).toBe('function');
    });

    it('should load schema via _loader.load()', async () => {
      const mockSchema = {
        name: 'TestLoader',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      const result = await scope._loader.load('/schemas/test.json');

      expect(result.success).toBe(true);
      expect(result.component).toBeDefined();
    });

    it('should clear cache via _loader.clearCache()', async () => {
      const mockSchema = {
        name: 'TestClear',
        render: { type: 'template', content: { type: 'div' } },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSchema),
      });

      await scope._loader.load('/schemas/test.json');
      scope._loader.clearCache();

      const loader = await import('../../src/runtime/schema-loader');
      expect(loader.getSchemaLoader().hasCached('/schemas/test.json')).toBe(false);
    });
  });

  describe('_router API', () => {
    it('should have _router property', () => {
      expect(scope._router).toBeDefined();
    });

    it('should have push method', () => {
      expect(typeof scope._router.push).toBe('function');
    });

    it('should have replace method', () => {
      expect(typeof scope._router.replace).toBe('function');
    });

    it('should have getCurrentRoute method', () => {
      expect(typeof scope._router.getCurrentRoute).toBe('function');
    });

    it('should have go method', () => {
      expect(typeof scope._router.go).toBe('function');
    });

    it('should have back method', () => {
      expect(typeof scope._router.back).toBe('function');
    });

    it('should have forward method', () => {
      expect(typeof scope._router.forward).toBe('function');
    });

    it('should call window.location.replace on replace()', () => {
      const replaceSpy = vi.spyOn(mockWindow.location, 'replace');
      scope._router.replace('/replace-route');
      expect(replaceSpy).toHaveBeenCalled();
    });

    it('should return currentRoute from hash', () => {
      mockWindow.location.hash = '#/current-test';
      const newScope = createCoreScope();
      expect(newScope._router.getCurrentRoute()).toBe('/current-test');
    });
  });

  describe('getCoreScope()', () => {
    it('should return global CoreScope', () => {
      const globalScope = getCoreScope();
      expect(globalScope).toBeDefined();
      expect(globalScope._auth).toBeDefined();
      expect(globalScope._loader).toBeDefined();
      expect(globalScope._router).toBeDefined();
    });
  });

  describe('setCoreScope()', () => {
    it('should update global CoreScope', () => {
      const newScope = createCoreScope();
      setCoreScope(newScope);
      expect(getCoreScope()).toBe(newScope);
    });
  });
});