import { describe, it, expect, beforeEach } from 'vitest';
import { createComputed } from '../../src/runtime/computed-factory';
import type { ComputedDefinition, SetupContext } from '../../src/types';

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
    const definition: ComputedDefinition = {
      doubled: { get: 'ref_state_count * 2' },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.doubled).toBeDefined();
    expect(typeof result.doubled).toBe('object');
  });

  it('should create computed with getter and setter', () => {
    const definition: ComputedDefinition = {
      fullName: {
        get: 'ref_state_name + " Doe"',
        set: 'ref_state_name.value = newValue',
      },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.fullName).toBeDefined();
  });

  it('should create multiple computed properties', () => {
    const definition: ComputedDefinition = {
      doubled: { get: 'ref_state_count * 2' },
      tripled: { get: 'ref_state_count * 3' },
      greeting: { get: '"Hello, " + ref_state_name' },
    };

    const result = createComputed(definition, mockContext, state);

    expect(Object.keys(result)).toHaveLength(3);
  });

  it('should handle complex getter expressions', () => {
    const definition: ComputedDefinition = {
      complex: { get: '(ref_state_count + 10) * 2' },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.complex).toBeDefined();
  });

  it('should handle string concatenation in getter', () => {
    const definition: ComputedDefinition = {
      message: { get: '"Count is: " + ref_state_count' },
    };

    const result = createComputed(definition, mockContext, state);

    expect(result.message).toBeDefined();
  });
});