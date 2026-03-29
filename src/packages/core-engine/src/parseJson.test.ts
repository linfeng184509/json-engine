import { describe, it, expect } from 'vitest';
import { parseJson, createParserConfig } from './parseJson';
import type { ParserConfig } from './parseJson';

const createConfig = (overrides?: Partial<Parameters<typeof createParserConfig>[0]>): ParserConfig => {
  return createParserConfig(overrides);
};

describe('parseJson - key parsing with config', () => {
  it('should use config.keyParsers for key transformation', () => {
    const config = createConfig({
      keyParsers: {
        configKey: (key: string) => 'config_' + key,
      },
    });
    const input = { configKey: 'value' };
    const result = parseJson(input, config);
    expect(result).toHaveProperty('config_configKey');
  });

  it('should return original key when not registered', () => {
    const input = { unknownKey: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('unknownKey');
    expect((result as Record<string, unknown>).unknownKey).toBe('value');
  });

  it('should apply multiple key parsers', () => {
    const config = createConfig({
      keyParsers: {
        key1: (key: string) => 'parsed_' + key,
        key2: (key: string) => 'transformed_' + key,
      },
    });
    const input = { key1: 'value1', key2: 'value2' };
    const result = parseJson(input, config);
    expect(result).toHaveProperty('parsed_key1');
    expect(result).toHaveProperty('transformed_key2');
  });
});

describe('parseJson - value parsing', () => {
  it('should use ValueConstraintParser for type=string', () => {
    const input = {
      key: { type: 'string', body: "'hello'" },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({ _type: 'string', value: 'hello' });
  });

  it('should use ValueScopeParser for type=scope', () => {
    const input = {
      key: { type: 'scope', body: '{{$_[core]_myVar}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({
      _type: 'scope',
      scope: 'core',
      variable: 'myVar',
    });
  });

  it('should use ValueReferenceParser for type=reference', () => {
    const input = {
      key: { type: 'reference', body: '{{ref_props_userId}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({
      _type: 'reference',
      prefix: 'props',
      variable: 'userId',
    });
  });

  it('should parse reference with path', () => {
    const input = {
      key: { type: 'reference', body: '{{ref_props_user.name}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({
      _type: 'reference',
      prefix: 'props',
      variable: 'user',
      path: 'name',
    });
  });

  it('should use ValueExpressionParser for type=expression', () => {
    const input = {
      key: { type: 'expression', body: '{{a + b}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({ _type: 'expression', expression: 'a + b' });
  });

  it('should use ValueFunctionParser for type=function', () => {
    const input = {
      key: { type: 'function', params: '{{{ {"x": 123} }}}', body: '{{return x}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({
      _type: 'function',
      params: { x: 123 },
      body: 'return x',
    });
  });
});

describe('parseJson - recursive traversal', () => {
  it('should recursively parse nested objects', () => {
    const input = {
      outer: {
        inner: {
          nested: { type: 'string', body: "'deep value'" },
        },
      },
    };
    const result = parseJson(input);
    const outer = (result as Record<string, unknown>).outer as Record<string, unknown>;
    const inner = outer.inner as Record<string, unknown>;
    expect(inner.nested).toEqual({
      _type: 'string',
      value: 'deep value',
    });
  });

  it('should parse all elements in array', () => {
    const input = {
      arr: [
        { type: 'string', body: "'first'" },
        { type: 'string', body: "'second'" },
      ],
    };
    const result = parseJson(input);
    const arr = (result as Record<string, unknown>).arr as unknown[];
    expect(arr[0]).toEqual({ _type: 'string', value: 'first' });
    expect(arr[1]).toEqual({ _type: 'string', value: 'second' });
  });

  it('should parse mixed structure with object and array', () => {
    const input = {
      obj: {
        arr: [{ nested: { type: 'scope', body: '{{$_[goal]_var}}' } }],
      },
    };
    const result = parseJson(input);
    const obj = (result as Record<string, unknown>).obj as Record<string, unknown>;
    const arr = obj.arr as unknown[];
    const firstItem = arr[0] as Record<string, unknown>;
    expect(firstItem.nested).toEqual({ _type: 'scope', scope: 'goal', variable: 'var' });
  });

  it('should parse deeply nested structure (3+ levels)', () => {
    const input = {
      l1: {
        l2: {
          l3: {
            l4: { type: 'expression', body: '{{deep expression}}' },
          },
        },
      },
    };
    const result = parseJson(input);
    const l1 = (result as Record<string, unknown>).l1 as Record<string, unknown>;
    const l2 = l1.l2 as Record<string, unknown>;
    const l3 = l2.l3 as Record<string, unknown>;
    expect(l3.l4).toEqual({
      _type: 'expression',
      expression: 'deep expression',
    });
  });
});

describe('parseJson - callback function', () => {
  it('should call onParsed callback for each parsed node', () => {
    const calls: Array<{ path: string; key: string; value: unknown }> = [];
    const input = {
      key1: 'value1',
      key2: 'value2',
    };
    parseJson(input, {
      onParsed: (path: string, key: string, value: unknown) => {
        calls.push({ path, key, value });
      },
    });
    expect(calls.length).toBe(2);
  });

  it('should pass correct path in callback', () => {
    const calls: Array<{ path: string }> = [];
    const input = {
      outer: {
        inner: 'value',
      },
    };
    parseJson(input, {
      onParsed: (path: string, _key: string, _value: unknown) => {
        calls.push({ path });
      },
    });
    expect(calls.some((c) => c.path === 'outer')).toBe(true);
    expect(calls.some((c) => c.path === 'outer.inner')).toBe(true);
  });

  it('should pass correct parsed value in callback', () => {
    const calls: Array<{ key: string; value: unknown }> = [];
    const input = {
      key: { type: 'string', body: "'parsed value'" },
    };
    parseJson(input, {
      onParsed: (_path: string, key: string, value: unknown) => {
        calls.push({ key, value });
      },
    });
    expect(
      calls.some((c) => {
        const val = c.value as Record<string, unknown>;
        return c.key === 'key' && val?.value === 'parsed value';
      })
    ).toBe(true);
  });
});

describe('parseJson - edge cases', () => {
  it('should return null when input is null', () => {
    const result = parseJson(null);
    expect(result).toBeNull();
  });

  it('should return undefined when input is undefined', () => {
    const result = parseJson(undefined);
    expect(result).toBeUndefined();
  });

  it('should return empty object when input is empty object', () => {
    const result = parseJson({});
    expect(result).toEqual({});
  });

  it('should return empty array when input is empty array', () => {
    const result = parseJson([]);
    expect(result).toEqual([]);
  });

  it('should return primitive number when input is number', () => {
    const result = parseJson(123);
    expect(result).toBe(123);
  });

  it('should return primitive string when input is string', () => {
    const result = parseJson('hello');
    expect(result).toBe('hello');
  });
});

describe('parseJson - custom reference prefixes', () => {
  it('should parse custom prefix reference', () => {
    const config = createConfig({
      referencePrefixes: ['custom', 'props'],
    });
    const input = {
      key: { type: 'reference', body: '{{ref_custom_value}}' },
    };
    const result = parseJson(input, config);
    expect((result as Record<string, unknown>).key).toEqual({
      _type: 'reference',
      prefix: 'custom',
      variable: 'value',
    });
  });

  it('should throw error for unknown prefix reference', () => {
    const config = createConfig({
      referencePrefixes: ['props'],
    });
    const input = {
      key: { type: 'reference', body: '{{ref_unknown_value}}' },
    };
    expect(() => parseJson(input, config)).toThrow('body 格式不正确');
  });
});

describe('parseJson - custom scope names', () => {
  it('should parse custom scope name', () => {
    const config = createConfig({
      scopeNames: ['global', 'core'],
    });
    const input = {
      key: { type: 'scope', body: '{{$_[global]_config}}' },
    };
    const result = parseJson(input, config);
    expect((result as Record<string, unknown>).key).toEqual({
      _type: 'scope',
      scope: 'global',
      variable: 'config',
    });
  });

  it('should throw error for unknown scope name', () => {
    const config = createConfig({
      scopeNames: ['core'],
    });
    const input = {
      key: { type: 'scope', body: '{{$_[unknown]_var}}' },
    };
    expect(() => parseJson(input, config)).toThrow('body 格式不正确');
  });
});

describe('parseJson - expression parsing with references', () => {
  it('should parse expression with pure reference as abstract reference', () => {
    const input = {
      value: { type: 'expression', body: '{{ref_state_count}}' },
    };
    const result = parseJson(input);
    const value = (result as Record<string, unknown>).value as Record<string, unknown>;
    expect(value.expression).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'count',
    });
  });

  it('should parse expression with pure scope as abstract scope', () => {
    const input = {
      value: { type: 'expression', body: '{{$_[goal]_target}}' },
    };
    const result = parseJson(input);
    const value = (result as Record<string, unknown>).value as Record<string, unknown>;
    expect(value.expression).toEqual({
      _type: 'scope',
      scope: 'goal',
      variable: 'target',
    });
  });

  it('should keep expression as string for mixed content', () => {
    const input = {
      value: { type: 'expression', body: '{{ref_props_userId + 1}}' },
    };
    const result = parseJson(input);
    const value = (result as Record<string, unknown>).value as Record<string, unknown>;
    expect(value.expression).toBe('ref_props_userId + 1');
  });
});
