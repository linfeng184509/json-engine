import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { evaluateStringExpression, isExpressionParseData } from '../../src/runtime/value-resolver';
import { functionCache, clearExpressionCache } from '../../src/utils/expression';
import { ref } from 'vue';
import type { RenderContext } from '../../src/types';

describe('expression evaluation caching', () => {
  let mockContext: RenderContext;

  beforeEach(() => {
    mockContext = {
      props: { count: 10 },
      state: { count: ref(42), message: ref('Hello') },
      computed: {},
      methods: {},
      components: {},
      slots: {},
      attrs: {},
      emit: () => {},
      provide: {},
    };
  });

  afterEach(() => {
    clearExpressionCache();
  });

  describe('Function cache hit/miss behavior', () => {
    it('should cache compiled Function on first evaluation', () => {
      const cacheSizeBefore = functionCache.size();
      evaluateStringExpression('$state.count + 1', mockContext);
      const cacheSizeAfter = functionCache.size();
      expect(cacheSizeAfter).toBeGreaterThan(cacheSizeBefore);
    });

    it('should retrieve cached Function on repeated expression', () => {
      evaluateStringExpression('$state.count + 1', mockContext);
      const cacheSizeAfterFirst = functionCache.size();
      evaluateStringExpression('$state.count + 1', mockContext);
      const cacheSizeAfterSecond = functionCache.size();
      expect(cacheSizeAfterSecond).toBe(cacheSizeAfterFirst);
    });

    it('should produce identical results for cached vs fresh evaluation', () => {
      const result1 = evaluateStringExpression('$state.count + 1', mockContext);
      const result2 = evaluateStringExpression('$state.count + 1', mockContext);
      expect(result1).toBe(result2);
      expect(result1).toBe(43);
    });

    it('should use transformed string as cache key', () => {
      evaluateStringExpression('$state.count', mockContext);
      const cacheSizeAfterDollar = functionCache.size();
      evaluateStringExpression('state.count', mockContext);
      const cacheSizeAfterPlain = functionCache.size();
      expect(cacheSizeAfterPlain).toBe(cacheSizeAfterDollar);
    });

    it('should cache different expressions separately', () => {
      evaluateStringExpression('$state.count + 1', mockContext);
      evaluateStringExpression('$state.count * 2', mockContext);
      evaluateStringExpression('$props.count', mockContext);
      expect(functionCache.size()).toBeGreaterThanOrEqual(3);
    });

    it('should return correct result after cache hit', () => {
      evaluateStringExpression('$state.message + " World"', mockContext);
      const result = evaluateStringExpression('$state.message + " World"', mockContext);
      expect(result).toBe('Hello World');
    });
  });
});
