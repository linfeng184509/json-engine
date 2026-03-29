import { describe, it, expect } from 'vitest';
import { parseProps } from '../../src/parser/props-parser';
import type { PropsDefinition, ParserContext } from '../../src/types';

describe('parseProps', () => {
  const mockContext: ParserContext = {
    schema: {} as any,
    errors: [],
    warnings: [],
  };

  it('should parse empty props definition', () => {
    const result = parseProps({}, mockContext);
    expect(result).toEqual({});
  });

  it('should parse string type prop', () => {
    const props: PropsDefinition = {
      name: { type: 'String' },
    };

    const result = parseProps(props, mockContext);

    expect(result.name).toBeDefined();
  });

  it('should parse number type prop', () => {
    const props: PropsDefinition = {
      count: { type: 'Number' },
    };

    const result = parseProps(props, mockContext);

    expect(result.count).toBeDefined();
  });

  it('should parse boolean type prop', () => {
    const props: PropsDefinition = {
      enabled: { type: 'Boolean' },
    };

    const result = parseProps(props, mockContext);

    expect(result.enabled).toBeDefined();
  });

  it('should parse required prop', () => {
    const props: PropsDefinition = {
      title: { type: 'String', required: true },
    };

    const result = parseProps(props, mockContext);

    expect(result.title).toBeDefined();
  });

  it('should parse prop with default value', () => {
    const props: PropsDefinition = {
      count: { type: 'Number', default: 10 },
    };

    const result = parseProps(props, mockContext);

    expect(result.count).toBeDefined();
  });

  it('should parse prop with validator', () => {
    const props: PropsDefinition = {
      status: {
        type: 'String',
        validator: {
          _type: 'function',
          params: {},
          body: 'return ["active", "inactive"].includes(value);',
        },
      },
    };

    const result = parseProps(props, mockContext);

    expect(result.status).toBeDefined();
  });

  it('should parse array of types', () => {
    const props: PropsDefinition = {
      value: { type: ['String', 'Number'] },
    };

    const result = parseProps(props, mockContext);

    expect(result.value).toBeDefined();
  });

  it('should handle unknown type without adding error', () => {
    const props: PropsDefinition = {
      unknown: {} as any,
    };

    parseProps(props, mockContext);

    expect(mockContext.errors.length).toBe(0);
  });

  it('should parse multiple props', () => {
    const props: PropsDefinition = {
      name: { type: 'String', required: true },
      age: { type: 'Number', default: 0 },
      active: { type: 'Boolean', default: false },
    };

    const result = parseProps(props, mockContext);

    expect(Object.keys(result)).toHaveLength(3);
  });
});
