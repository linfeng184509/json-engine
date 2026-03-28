import { describe, it, expect, beforeEach } from 'vitest';
import { createState } from '../../src/runtime/state-factory';
import type { StateDefinition, SetupContext } from '../../src/types';

describe('createState', () => {
  let mockContext: SetupContext;

  beforeEach(() => {
    mockContext = {
      props: {},
      emit: () => {},
      slots: {},
      attrs: {},
    };
  });

  it('should return empty object for undefined definition', () => {
    const result = createState(undefined, mockContext);
    expect(result).toEqual({});
  });

  it('should return empty object for empty definition', () => {
    const result = createState({}, mockContext);
    expect(result).toEqual({});
  });

  it('should create ref state with number initial value', () => {
    const definition: StateDefinition = {
      count: { type: 'ref', initial: 0 },
    };

    const result = createState(definition, mockContext);

    expect(result.count).toBeDefined();
    expect(result.count.value).toBe(0);
  });

  it('should create ref state with string initial value', () => {
    const definition: StateDefinition = {
      name: { type: 'ref', initial: 'Hello' },
    };

    const result = createState(definition, mockContext);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('Hello');
  });

  it('should create ref state with object initial value', () => {
    const definition: StateDefinition = {
      user: { type: 'ref', initial: { name: 'John' } },
    };

    const result = createState(definition, mockContext);

    expect(result.user).toBeDefined();
    expect(result.user.value).toEqual({ name: 'John' });
  });

  it('should create reactive state with object initial value', () => {
    const definition: StateDefinition = {
      user: { type: 'reactive', initial: { name: 'John', age: 30 } },
    };

    const result = createState(definition, mockContext);

    expect(result.user).toBeDefined();
    expect(result.user).toHaveProperty('name');
    expect(result.user).toHaveProperty('age');
  });

  it('should create reactive state with empty object when initial is null', () => {
    const definition: StateDefinition = {
      data: { type: 'reactive', initial: null },
    };

    const result = createState(definition, mockContext);

    expect(result.data).toBeDefined();
    expect(Object.keys(result.data as object)).toHaveLength(0);
  });

  it('should create shallowRef state', () => {
    const definition: StateDefinition = {
      data: { type: 'shallowRef', initial: { deep: { value: 1 } } },
    };

    const result = createState(definition, mockContext);

    expect(result.data).toBeDefined();
  });

  it('should create shallowReactive state', () => {
    const definition: StateDefinition = {
      config: { type: 'shallowReactive', initial: { settings: { theme: 'dark' } } },
    };

    const result = createState(definition, mockContext);

    expect(result.config).toBeDefined();
  });

  it('should create multiple state items', () => {
    const definition: StateDefinition = {
      count: { type: 'ref', initial: 0 },
      name: { type: 'ref', initial: 'Test' },
      user: { type: 'reactive', initial: { name: 'John' } },
    };

    const result = createState(definition, mockContext);

    expect(Object.keys(result)).toHaveLength(3);
    expect(result.count.value).toBe(0);
    expect(result.name.value).toBe('Test');
  });

  it('should handle toRef without source gracefully', () => {
    const definition: StateDefinition = {
      ref: { type: 'toRef', key: 'name' } as any,
    };

    const result = createState(definition, mockContext);
    expect(result.ref).toBeUndefined();
  });

  it('should handle ref with string initial value', () => {
    const definition: StateDefinition = {
      message: { type: 'ref', initial: 'Hello World' },
    };

    const result = createState(definition, mockContext);

    expect(result.message).toBeDefined();
    expect(result.message.value).toBe('Hello World');
  });

  it('should handle ref with array initial value', () => {
    const definition: StateDefinition = {
      items: { type: 'ref', initial: [1, 2, 3] },
    };

    const result = createState(definition, mockContext);

    expect(result.items).toBeDefined();
    expect(result.items.value).toEqual([1, 2, 3]);
  });
});
