import { describe, it, expect } from 'vitest';
import { parseJson } from '@json-engine/core-engine';
import { vueParserConfig } from '../../src/config/vue-parser-config';

describe('vue-parser-config', () => {
  it('should parse function type with params and body using $fn format', () => {
    const input = {
      $fn: 'return 1;',
    };

    const result = parseJson(input, vueParserConfig) as Record<string, unknown>;

    expect(result._type).toBe('function');
    expect(result.params).toBeDefined();
    expect(result.body).toBe('return 1;');
  });

  it('should parse nested function in render.content using $fn format', () => {
    const input = {
      name: 'Test',
      render: {
        type: 'function',
        content: {
          $fn: 'return 1;',
        },
      },
    };

    const result = parseJson(input, vueParserConfig) as Record<string, unknown>;
    const render = result.render as Record<string, unknown>;
    const content = render.content as Record<string, unknown>;

    expect(content._type).toBe('function');
    expect(content.params).toBeDefined();
    expect(content.body).toBe('return 1;');
  });

  it('should parse $expr format', () => {
    const input = {
      $expr: '$state.count > 0',
    };

    const result = parseJson(input, vueParserConfig) as Record<string, unknown>;

    expect(result._type).toBe('expression');
    expect(result.expression).toBe('$state.count > 0');
  });

  it('should parse $ref format for state', () => {
    const input = {
      $ref: 'state.count',
    };

    const result = parseJson(input, vueParserConfig) as Record<string, unknown>;

    expect(result._type).toBe('reference');
    expect(result.prefix).toBe('state');
    expect(result.variable).toBe('count');
  });
});