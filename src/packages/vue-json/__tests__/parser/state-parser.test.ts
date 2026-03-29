import { describe, it, expect } from 'vitest';
import { parseState } from '../../src/parser/state-parser';
import type { StateDefinition, ParserContext } from '../../src/types';

describe('parseState', () => {
  const mockContext: ParserContext = {
    schema: {} as any,
    errors: [],
    warnings: [],
  };

  it('should parse empty state definition', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const result = parseState({}, context);
    expect(result).toEqual({});
  });

  it('should parse ref state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      count: { type: 'ref', initial: 0 },
    };

    const result = parseState(state, context);

    expect(result.count).toBeDefined();
    expect(result.count?.type).toBe('ref');
  });

  it('should parse reactive state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      user: { type: 'reactive', initial: { name: 'John' } },
    };

    const result = parseState(state, context);

    expect(result.user).toBeDefined();
    expect(result.user?.type).toBe('reactive');
  });

  it('should parse shallowRef state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      data: { type: 'shallowRef', initial: null },
    };

    const result = parseState(state, context);

    expect(result.data).toBeDefined();
    expect(result.data?.type).toBe('shallowRef');
  });

  it('should parse shallowReactive state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      config: { type: 'shallowReactive', initial: {} },
    };

    const result = parseState(state, context);

    expect(result.config).toBeDefined();
    expect(result.config?.type).toBe('shallowReactive');
  });

  it('should parse toRef state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      userName: { type: 'toRef', source: 'props', key: 'name' },
    };

    const result = parseState(state, context);

    expect(result.userName).toBeDefined();
    expect(result.userName?.type).toBe('toRef');
  });

  it('should parse toRefs state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      userRefs: { type: 'toRefs', source: 'state.user' },
    };

    const result = parseState(state, context);

    expect(result.userRefs).toBeDefined();
    expect(result.userRefs?.type).toBe('toRefs');
  });

  it('should parse readonly state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      config: { type: 'readonly', source: 'state.settings' },
    };

    const result = parseState(state, context);

    expect(result.config).toBeDefined();
    expect(result.config?.type).toBe('readonly');
  });

  it('should parse state with initial expression', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      doubled: { type: 'ref', initial: { type: 'expression', body: '{{count * 2}}' } },
    };

    const result = parseState(state, context);

    expect(result.doubled).toBeDefined();
  });

  it('should parse multiple state items', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      count: { type: 'ref', initial: 0 },
      name: { type: 'ref', initial: 'Hello' },
      user: { type: 'reactive', initial: {} },
    };

    const result = parseState(state, context);

    expect(Object.keys(result)).toHaveLength(3);
  });

  it('should add error for invalid state type', () => {
    const context = { ...mockContext, errors: [], warnings: [] };
    const state: StateDefinition = {
      unknown: { type: 'unknownType' } as any,
    };

    parseState(state, context);

    expect(context.errors.length).toBe(1);
    expect(context.errors[0].path).toBe('state.unknown');
  });
});