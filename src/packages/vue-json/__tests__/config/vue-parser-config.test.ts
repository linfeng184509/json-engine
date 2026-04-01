import { describe, it, expect } from 'vitest';
import { parseJson } from '@json-engine/core-engine';
import { vueParserConfig } from '../../src/config/vue-parser-config';

describe('vue-parser-config', () => {
  it('should parse function type with params and body', () => {
    const input = {
      type: 'function',
      params: '{{{}}}',
      body: '{{return 1;}}',
    };

    const result = parseJson(input, vueParserConfig) as Record<string, unknown>;

    expect(result._type).toBe('function');
    expect(result.params).toEqual({});
    expect(result.body).toBe('return 1;');
  });

  it('should parse nested function in render.content', () => {
    const input = {
      name: 'Test',
      render: {
        type: 'function',
        content: {
          type: 'function',
          params: '{{{}}}',
          body: '{{return 1;}}',
        },
      },
    };

    const result = parseJson(input, vueParserConfig) as Record<string, unknown>;
    const render = result.render as Record<string, unknown>;
    const content = render.content as Record<string, unknown>;

    expect(content._type).toBe('function');
    expect(content.params).toEqual({});
    expect(content.body).toBe('return 1;');
  });
});