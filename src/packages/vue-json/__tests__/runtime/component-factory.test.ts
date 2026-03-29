import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createComponent, clearComponentCache } from '../../src/runtime/component-factory';

describe('component-factory', () => {
  beforeEach(() => {
    clearComponentCache();
  });

  describe('createComponent', () => {
    it('should create component from valid schema', () => {
      const schema = {
        name: 'TestComponent',
        render: {
          type: 'template',
          content: {
            type: 'div',
            children: 'Hello',
          },
        },
      };

      const component = createComponent(schema);

      expect(component).toBeDefined();
      expect(component).toBeTruthy();
    });

    it('should create component from JSON string', () => {
      const schemaStr = JSON.stringify({
        name: 'JsonComponent',
        render: {
          type: 'template',
          content: {
            type: 'span',
            children: 'From JSON',
          },
        },
      });

      const component = createComponent(schemaStr);

      expect(component).toBeDefined();
    });

    it('should cache component when cache is true', () => {
      const schema = {
        name: 'CachedComponent',
        render: {
          type: 'template',
          content: { type: 'div' },
        },
      };

      const component1 = createComponent(schema, { cache: true });
      const component2 = createComponent(schema, { cache: true });

      expect(component1).toBe(component2);
    });

    it('should not cache component when cache is false', () => {
      const schema = {
        name: 'UncachedComponent',
        render: {
          type: 'template',
          content: { type: 'div' },
        },
      };

      const component1 = createComponent(schema, { cache: false });
      const component2 = createComponent(schema, { cache: false });

      expect(component1).not.toBe(component2);
    });

    it('should throw error for schema without name', () => {
      const schema = {
        render: {
          type: 'template',
          content: { type: 'div' },
        },
      } as any;

      expect(() => createComponent(schema)).toThrow();
    });

    it('should throw error for schema without render', () => {
      const schema = {
        name: 'NoRender',
      } as any;

      expect(() => createComponent(schema)).toThrow();
    });

    it('should create component with props', () => {
      const schema = {
        name: 'WithProps',
        props: {
          title: { type: 'String', required: true },
        },
        render: {
          type: 'template',
          content: {
            type: 'div',
            children: { type: 'expression', body: '{{ref_props_title}}' },
          },
        },
      };

      const component = createComponent(schema);

      expect(component).toBeDefined();
    });

    it('should create component with state', () => {
      const schema = {
        name: 'WithState',
        state: {
          count: { type: 'ref', initial: 0 },
        },
        render: {
          type: 'template',
          content: {
            type: 'div',
            children: { type: 'expression', body: '{{ref_state_count}}' },
          },
        },
      };

      const component = createComponent(schema);

      expect(component).toBeDefined();
    });

    it('should create component with methods', () => {
      const schema = {
        name: 'WithMethods',
        methods: {
          increment: {
            type: 'function',
            params: '{{{}}}',
            body: '{{state.count.value++;}}',
          },
        },
        render: {
          type: 'template',
          content: { type: 'button', children: 'Click' },
        },
      };

      const component = createComponent(schema);

      expect(component).toBeDefined();
    });

    it('should create component with lifecycle hooks', () => {
      const schema = {
        name: 'WithLifecycle',
        lifecycle: {
          onMounted: {
            type: 'function',
            params: '{{{}}}',
            body: '{{console.log("mounted");}}',
          },
        },
        render: {
          type: 'template',
          content: { type: 'div' },
        },
      };

      const component = createComponent(schema);

      expect(component).toBeDefined();
    });

    it('should create component with styles', () => {
      const schema = {
        name: 'WithStyles',
        styles: {
          css: '.test { color: red; }',
          scoped: true,
        },
        render: {
          type: 'template',
          content: { type: 'div', children: 'Styled' },
        },
      };

      const component = createComponent(schema, { injectStyles: false });

      expect(component).toBeDefined();
    });
  });

  describe('clearComponentCache', () => {
    it('should clear all cached components', () => {
      const schema = {
        name: 'CacheTest',
        render: {
          type: 'template',
          content: { type: 'div' },
        },
      };

      createComponent(schema, { cache: true });
      clearComponentCache();

      const schema2 = {
        name: 'CacheTest2',
        render: {
          type: 'template',
          content: { type: 'div' },
        },
      };

      const component = createComponent(schema, { cache: true });
      expect(component).toBeDefined();
    });
  });
});
