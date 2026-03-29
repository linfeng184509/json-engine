import { describe, it, expect, beforeEach } from 'vitest';
import { createComputed } from '../../src/runtime/computed-factory';
import type { ComputedDefinition, SetupContext, FunctionValue } from '../../src/types';

describe('createComputed', () => {
  let mockContext: SetupContext;
  let state: Record<string, any>;

  beforeEach(() => {
    state = {
      count: { value: 5 },
      name: { value: 'Test' },
    };
    mockContext = {
      props: {},
      emit: () => {},
      slots: {},
      attrs: {},
    };
  });

  it('should return empty object for undefined definition', () => {
    const result = createComputed(undefined, mockContext, state);
    expect(result).toEqual({});
  });

  it('should return empty object for empty definition', () => {
    const result = createComputed({}, mockContext, state);
    expect(result).toEqual({});
  });

  it('should create computed with getter only', () => {
    const getter: FunctionValue = { _type: 'function', params: {}, body: 'return state.count.value * 2;' };
    const definition: ComputedDefinition = {
      doubled: { get: getter },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.doubled).toBeDefined();
    expect(typeof result.doubled).toBe('object');
  });

  it('should create computed with getter and setter', () => {
    const getter: FunctionValue = { _type: 'function', params: {}, body: 'return state.name.value + " Doe";' };
    const setter: FunctionValue = { _type: 'function', params: {}, body: 'state.name.value = value;' };
    const definition: ComputedDefinition = {
      fullName: {
        get: getter,
        set: setter,
      },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.fullName).toBeDefined();
  });

  it('should create multiple computed properties', () => {
    const getter1: FunctionValue = { _type: 'function', params: {}, body: 'return state.count.value * 2;' };
    const getter2: FunctionValue = { _type: 'function', params: {}, body: 'return state.count.value * 3;' };
    const getter3: FunctionValue = { _type: 'function', params: {}, body: 'return "Hello, " + state.name.value;' };
    const definition: ComputedDefinition = {
      doubled: { get: getter1 },
      tripled: { get: getter2 },
      greeting: { get: getter3 },
    };

    const result = createComputed(definition, mockContext, state);

    expect(Object.keys(result)).toHaveLength(3);
  });

  it('should handle complex getter expressions', () => {
    const getter: FunctionValue = { _type: 'function', params: {}, body: 'return (state.count.value + 10) * 2;' };
    const definition: ComputedDefinition = {
      complex: { get: getter },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.complex).toBeDefined();
  });

  it('should handle string concatenation in getter', () => {
    const getter: FunctionValue = { _type: 'function', params: {}, body: 'return "Count is: " + state.count.value;' };
    const definition: ComputedDefinition = {
      message: { get: getter },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.message).toBeDefined();
  });
});
