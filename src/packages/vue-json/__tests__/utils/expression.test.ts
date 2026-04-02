import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { evaluateFunction, clearExpressionCache } from '../../src/utils/expression';
import { evaluateExpression } from '../../src/runtime/value-resolver';
import { ref } from 'vue';
import type { RenderContext } from '../../src/types';

describe('evaluateExpression with new $state format', () => {
  let mockContext: RenderContext;

  beforeEach(() => {
    mockContext = {
      props: { title: 'Test Title', count: 10 },
      state: {
        message: ref('Hello World'),
        count: ref(42),
        user: ref({ name: 'John', age: 30 }),
      },
      computed: {
        doubled: ref(84),
      },
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

  describe('evaluateExpression', () => {
    it('should evaluate state reference', () => {
      const result = evaluateExpression('$state.message', mockContext);
      expect(result).toBe('Hello World');
    });

    it('should evaluate props reference', () => {
      const result = evaluateExpression('$props.title', mockContext);
      expect(result).toBe('Test Title');
    });

    it('should evaluate computed reference', () => {
      const result = evaluateExpression('$computed.doubled', mockContext);
      expect(result).toBe(84);
    });

    it('should evaluate mixed expression with state reference', () => {
      const result = evaluateExpression('$state.count + 1', mockContext);
      expect(result).toBe(43);
    });

    it('should evaluate mixed expression with props reference', () => {
      const result = evaluateExpression('$props.count * 2', mockContext);
      expect(result).toBe(20);
    });

    it('should evaluate complex expression with multiple references', () => {
      const result = evaluateExpression('$state.count + $props.count', mockContext);
      expect(result).toBe(52);
    });

    it('should evaluate expression with string concatenation', () => {
      const result = evaluateExpression('"Count: " + $state.count', mockContext);
      expect(result).toBe('Count: 42');
    });

    it('should evaluate ternary expression with reference', () => {
      const result = evaluateExpression('$state.count > 40 ? "big" : "small"', mockContext);
      expect(result).toBe('big');
    });

    it('should handle nested object access after reference', () => {
      const result = evaluateExpression('$state.user.name', mockContext);
      expect(result).toBe('John');
    });

    it('should handle array expressions with references', () => {
      const result = evaluateExpression('[$state.count, $props.count]', mockContext);
      expect(result).toEqual([42, 10]);
    });

    it('should handle object expressions with references', () => {
      const result = evaluateExpression('{ count: $state.count, title: $props.title }', mockContext);
      expect(result).toEqual({ count: 42, title: 'Test Title' });
    });
  });
});
