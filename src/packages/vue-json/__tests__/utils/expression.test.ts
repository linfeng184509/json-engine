import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { evaluateExpression, resolveReference, clearExpressionCache } from '../../src/utils/expression';
import type { RenderContext } from '../../src/types';

describe('parseNestedReference integration', () => {
  let mockContext: RenderContext;

  beforeEach(() => {
    mockContext = {
      props: { title: 'Test Title', count: 10 },
      state: {
        message: { value: 'Hello World' },
        count: { value: 42 },
        user: { value: { name: 'John', age: 30 } },
      },
      computed: {
        doubled: { value: 84 },
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

  describe('resolveReference', () => {
    it('should resolve state reference', () => {
      const result = resolveReference('ref_state_message', mockContext);
      expect(result).toBe('Hello World');
    });

    it('should resolve state reference with number value', () => {
      const result = resolveReference('ref_state_count', mockContext);
      expect(result).toBe(42);
    });

    it('should resolve props reference', () => {
      const result = resolveReference('ref_props_title', mockContext);
      expect(result).toBe('Test Title');
    });

    it('should return null for non-reference expression', () => {
      const result = resolveReference('count + 1', mockContext);
      expect(result).toBeNull();
    });

    it('should return null for undefined state variable', () => {
      const result = resolveReference('ref_state_nonexistent', mockContext);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined props', () => {
      const result = resolveReference('ref_props_nonexistent', mockContext);
      expect(result).toBeUndefined();
    });
  });

  describe('evaluateExpression with core-engine format', () => {
    it('should evaluate state reference', () => {
      const result = evaluateExpression('ref_state_message', mockContext);
      expect(result).toBe('Hello World');
    });

    it('should evaluate props reference', () => {
      const result = evaluateExpression('ref_props_title', mockContext);
      expect(result).toBe('Test Title');
    });

    it('should evaluate computed reference', () => {
      const result = evaluateExpression('ref_computed_doubled', mockContext);
      expect(result).toBe(84);
    });

    it('should evaluate mixed expression with state reference', () => {
      const result = evaluateExpression('ref_state_count + 1', mockContext);
      expect(result).toBe(43);
    });

    it('should evaluate mixed expression with props reference', () => {
      const result = evaluateExpression('ref_props_count * 2', mockContext);
      expect(result).toBe(20);
    });

    it('should evaluate complex expression with multiple references', () => {
      const result = evaluateExpression('ref_state_count + ref_props_count', mockContext);
      expect(result).toBe(52);
    });

    it('should evaluate expression with string concatenation', () => {
      const result = evaluateExpression('"Count: " + ref_state_count', mockContext);
      expect(result).toBe('Count: 42');
    });

    it('should evaluate ternary expression with reference', () => {
      const result = evaluateExpression('ref_state_count > 40 ? "big" : "small"', mockContext);
      expect(result).toBe('big');
    });

    it('should handle nested object access after reference', () => {
      const result = evaluateExpression('ref_state_user.name', mockContext);
      expect(result).toBe('John');
    });

    it('should handle array expressions with references', () => {
      const result = evaluateExpression('[ref_state_count, ref_props_count]', mockContext);
      expect(result).toEqual([42, 10]);
    });

    it('should handle object expressions with references', () => {
      const result = evaluateExpression('{ count: ref_state_count, title: ref_props_title }', mockContext);
      expect(result).toEqual({ count: 42, title: 'Test Title' });
    });
  });
});