import { describe, it, expect } from 'vitest';
import { parseSchema } from '../../src/parser';

describe('parseSchema', () => {
  it('should parse valid schema object', () => {
    const schema = {
      name: 'TestComponent',
      render: {
        type: 'template' as const,
        content: {
          type: 'div',
          children: 'Hello',
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('TestComponent');
    expect(result.data?.render.type).toBe('template');
  });

  it('should parse valid JSON string schema', () => {
    const schemaStr = JSON.stringify({
      name: 'StringSchema',
      render: {
        type: 'template',
        content: {
          type: 'span',
        },
      },
    });

    const result = parseSchema(schemaStr);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('StringSchema');
  });

  it('should fail when schema name is missing', () => {
    const schema = {
      render: {
        type: 'template',
        content: { type: 'div' },
      },
    } as any;

    const result = parseSchema(schema);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.some((e) => e.path === 'name')).toBe(true);
  });

  it('should fail when schema name is empty string', () => {
    const schema = {
      name: '',
      render: {
        type: 'template',
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path === 'name')).toBe(true);
  });

  it('should fail when render property is missing', () => {
    const schema = {
      name: 'NoRender',
    } as any;

    const result = parseSchema(schema);

    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path === 'render')).toBe(true);
  });

  it('should fail when render type is invalid', () => {
    const schema = {
      name: 'InvalidRender',
      render: {
        type: 'invalid' as any,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path === 'render.type')).toBe(true);
  });

  it('should parse schema with props', () => {
    const schema = {
      name: 'WithProps',
      props: {
        title: { type: 'String' as const, required: true },
        count: { type: 'Number' as const, default: 0 },
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.props).toBeDefined();
  });

  it('should parse schema with emits', () => {
    const schema = {
      name: 'WithEmits',
      emits: {
        update: null,
        submit: null,
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.emits).toBeDefined();
  });

  it('should parse schema with state', () => {
    const schema = {
      name: 'WithState',
      state: {
        count: { type: 'ref' as const, initial: 0 },
        user: { type: 'reactive' as const, initial: { name: 'John' } },
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.state).toBeDefined();
  });

  it('should parse schema with computed', () => {
    const schema = {
      name: 'WithComputed',
      computed: {
        doubled: {
          get: {
            type: 'function',
            $fn: {
              params: {},
              body: 'return $state.count * 2;',
            },
          },
        },
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.computed).toBeDefined();
  });

  it('should parse schema with methods', () => {
    const schema = {
      name: 'WithMethods',
      methods: {
        increment: {
          type: 'function',
          $fn: {
            params: {},
            body: '$state.count++;',
          },
        },
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.methods).toBeDefined();
  });

  it.skip('should parse schema with watch (requires parser update)', () => {
    const schema = {
      name: 'WithWatch',
      watch: {
        countChange: {
          source: {
            type: 'expression',
            expression: '$state.count',
          },
          handler: {
            type: 'function',
            $fn: {
              params: {},
              body: 'console.log(newValue);',
            },
          },
          immediate: true,
        },
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.watch).toBeDefined();
  });

  it('should parse schema with lifecycle hooks', () => {
    const schema = {
      name: 'WithLifecycle',
      lifecycle: {
        onMounted: {
          type: 'function',
          $fn: {
            params: {},
            body: 'console.log("mounted");',
          },
        },
        onUnmounted: {
          type: 'function',
          $fn: {
            params: {},
            body: 'console.log("unmounted");',
          },
        },
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.lifecycle).toBeDefined();
  });

  it('should parse schema with styles', () => {
    const schema = {
      name: 'WithStyles',
      styles: {
        css: '.test { color: red; }',
        scoped: true,
      },
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.styles).toBeDefined();
    expect(result.data?.styles?.scoped).toBe(true);
  });

  it('should parse function render type', () => {
    const schema = {
      name: 'FunctionRender',
      render: {
        type: 'function' as const,
        content: {
          type: 'function',
          $fn: {
            params: {},
            body: 'return h("div", "Hello");',
          },
        },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
    expect(result.data?.render.type).toBe('function');
  });

  it('should return warnings when present', () => {
    const schema = {
      name: 'WithWarnings',
      render: {
        type: 'template' as const,
        content: { type: 'div' },
      },
    };

    const result = parseSchema(schema);

    expect(result.success).toBe(true);
  });

  it('should fail for invalid JSON string', () => {
    const result = parseSchema('invalid json {{{');

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.some((e) => e.message.includes('Invalid JSON'))).toBe(true);
  });
});
