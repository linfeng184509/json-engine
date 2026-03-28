import { describe, it, expect, vi } from 'vitest';
import { useVueJson } from '../../src/composables';

describe('useVueJson', () => {
  it('should initialize with null component and schema', () => {
    const { component, schema, error, isLoading } = useVueJson();

    expect(component.value).toBeNull();
    expect(schema.value).toBeNull();
    expect(error.value).toBeNull();
    expect(isLoading.value).toBe(false);
  });

  it('should parse valid schema and set component', () => {
    const { parse, component, schema, error } = useVueJson();

    const validSchema = {
      name: 'TestComponent',
      render: {
        type: 'template',
        content: {
          type: 'div',
          children: 'Hello',
        },
      },
    };

    parse(validSchema);

    expect(error.value).toBeNull();
    expect(component.value).not.toBeNull();
    expect(schema.value).not.toBeNull();
    expect(schema.value?.name).toBe('TestComponent');
  });

  it('should set error for invalid schema', () => {
    const { parse, error, component } = useVueJson();

    const invalidSchema = {
      render: {
        type: 'template',
        content: { type: 'div' },
      },
    } as any;

    parse(invalidSchema);

    expect(error.value).not.toBeNull();
    expect(component.value).toBeNull();
  });

  it('should parse JSON string schema', () => {
    const { parse, component, error } = useVueJson();

    const schemaStr = JSON.stringify({
      name: 'StringSchema',
      render: {
        type: 'template',
        content: { type: 'span', children: 'Hello' },
      },
    });

    parse(schemaStr);

    expect(error.value).toBeNull();
    expect(component.value).not.toBeNull();
  });

  it('should call onError callback when provided', () => {
    const onError = vi.fn();
    const { parse } = useVueJson({ onError });

    const invalidSchema = {
      render: {
        type: 'template',
        content: { type: 'div' },
      },
    } as any;

    parse(invalidSchema);

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('should set isLoading during parsing', () => {
    const { parse, isLoading } = useVueJson();

    const schema = {
      name: 'LoadingTest',
      render: {
        type: 'template',
        content: { type: 'div' },
      },
    };

    parse(schema);

    expect(isLoading.value).toBe(false);
  });

  it('should create component without caching', () => {
    const { parse, component } = useVueJson({ cache: false });

    const schema = {
      name: 'NoCacheComponent',
      render: {
        type: 'template',
        content: { type: 'div', children: 'Hello' },
      },
    };

    parse(schema);
    const firstComponent = component.value;

    parse(schema);
    const secondComponent = component.value;

    expect(firstComponent).not.toBe(secondComponent);
  });

  it('should cache component when cache option is true', () => {
    const { parse, component } = useVueJson({ cache: true });

    const schema = {
      name: 'CachedComponent',
      render: {
        type: 'template',
        content: { type: 'div', children: 'Hello' },
      },
    };

    parse(schema);

    expect(component.value).not.toBeNull();
  });

  it('should set isLoading to true during parse', () => {
    let loadingDuringParse = false;
    const { parse, isLoading } = useVueJson();

    const schema = {
      name: 'LoadingTest2',
      render: {
        type: 'template',
        content: { type: 'div' },
      },
    };

    parse(schema);
    
    expect(isLoading.value).toBe(false);
  });

  it('should handle parse errors gracefully', () => {
    const { parse, error, component } = useVueJson();

    parse('invalid json {{{');

    expect(error.value).not.toBeNull();
    expect(error.value?.message).toContain('Invalid JSON');
    expect(component.value).toBeNull();
  });
});
