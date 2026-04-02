import { describe, it, expect } from 'vitest';
import { parseJson, normalizeValue, createParserConfig } from './parseJson';
import type { ParserConfig } from './config-factory';

const createConfig = (overrides?: Partial<Parameters<typeof createParserConfig>[0]>): ParserConfig => {
  return createParserConfig(overrides);
};

describe('normalizeValue - $ref format', () => {
  it('should transform $ref state to reference format', () => {
    const input = { $ref: 'state.count' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'reference', prefix: 'state', variable: 'count' });
  });

  it('should transform $ref props to reference format', () => {
    const input = { $ref: 'props.title' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'reference', prefix: 'props', variable: 'title' });
  });

  it('should transform $ref computed to reference format', () => {
    const input = { $ref: 'computed.fullName' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'reference', prefix: 'computed', variable: 'fullName' });
  });

  it('should transform $ref with nested path', () => {
    const input = { $ref: 'state.user.profile.email' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'reference', prefix: 'state', variable: 'user', path: 'profile.email' });
  });
});

describe('normalizeValue - $expr format', () => {
  it('should transform $expr to expression format', () => {
    const input = { $expr: 'state.count > 0' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'expression', body: '{{state.count > 0}}' });
  });

  it('should transform $expr with ternary', () => {
    const input = { $expr: "state.count > 5 ? 'many' : 'few'" };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'expression', body: "{{state.count > 5 ? 'many' : 'few'}}" });
  });
});

describe('normalizeValue - $fn format', () => {
  it('should transform $fn string to function format', () => {
    const input = { $fn: 'methods.handleClick()' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'function', params: '{{{}}}', body: '{{methods.handleClick()}}' });
  });

  it('should transform $fn object with params', () => {
    const input = { $fn: { params: ['e'], body: '$state.value = e.target.value' } };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'function', params: '{{{ {"e":null} }}}', body: '{{$state.value = e.target.value}}' });
  });

  it('should transform $fn object with multiple params', () => {
    const input = { $fn: { params: ['e', 'data'], body: 'console.log(e, data)' } };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'function', params: '{{{ {"e":null,"data":null} }}}', body: '{{console.log(e, data)}}' });
  });
});

describe('normalizeValue - $scope format', () => {
  it('should transform $scope core.api to scope format', () => {
    const input = { $scope: 'core.api' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'scope', body: '{{$_[core]_api}}' });
  });

  it('should transform $scope core.router to scope format', () => {
    const input = { $scope: 'core.router' };
    const result = normalizeValue(input);
    expect(result).toEqual({ type: 'scope', body: '{{$_[core]_router}}' });
  });
});

describe('normalizeValue - native values', () => {
  it('should pass through string unchanged', () => {
    expect(normalizeValue('hello')).toBe('hello');
  });

  it('should pass through number unchanged', () => {
    expect(normalizeValue(123)).toBe(123);
  });

  it('should pass through boolean unchanged', () => {
    expect(normalizeValue(true)).toBe(true);
  });

  it('should pass through null unchanged', () => {
    expect(normalizeValue(null)).toBe(null);
  });

  it('should pass through plain object unchanged', () => {
    const input = { grid: { gutter: 16 } };
    expect(normalizeValue(input)).toBe(input);
  });

  it('should pass through array unchanged', () => {
    const input = [1, 2, 3];
    expect(normalizeValue(input)).toBe(input);
  });
});

describe('parseJson - $ref format', () => {
  it('should parse $ref state variable', () => {
    const input = { count: { $ref: 'state.count' } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.count).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'count',
    });
  });

  it('should parse $ref props variable', () => {
    const input = { title: { $ref: 'props.title' } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.title).toEqual({
      _type: 'reference',
      prefix: 'props',
      variable: 'title',
    });
  });

  it('should parse $ref with nested path', () => {
    const input = { email: { $ref: 'state.user.email' } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.email).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'user',
      path: 'email',
    });
  });
});

describe('parseJson - $expr format', () => {
  it('should parse $expr simple expression', () => {
    const input = { visible: { $expr: 'state.count > 0' } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.visible).toEqual({
      _type: 'expression',
      expression: 'state.count > 0',
    });
  });

  it('should parse $expr ternary expression', () => {
    const input = { label: { $expr: "state.count > 5 ? 'many' : 'few'" } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.label).toEqual({
      _type: 'expression',
      expression: "state.count > 5 ? 'many' : 'few'",
    });
  });
});

describe('parseJson - $fn format', () => {
  it('should parse $fn string (no params)', () => {
    const input = { onClick: { $fn: 'methods.handleClick()' } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.onClick).toEqual({
      _type: 'function',
      params: {},
      body: 'methods.handleClick()',
    });
  });

  it('should parse $fn object with params', () => {
    const input = { onChange: { $fn: { params: ['e'], body: '$state.value = e.target.value' } } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.onChange).toEqual({
      _type: 'function',
      params: { e: null },
      body: '$state.value = e.target.value',
    });
  });
});

describe('parseJson - native values', () => {
  it('should pass through native string', () => {
    const input = { class: 'container' };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.class).toBe('container');
  });

  it('should pass through native number', () => {
    const input = { size: 24 };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.size).toBe(24);
  });

  it('should pass through native boolean', () => {
    const input = { disabled: true };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.disabled).toBe(true);
  });

  it('should pass through native object', () => {
    const input = { config: { grid: { gutter: 16 } } };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.config).toEqual({ grid: { gutter: 16 } });
  });

  it('should pass through native array', () => {
    const input = { items: [1, 2, 3] };
    const result = parseJson(input) as Record<string, unknown>;
    expect(result.items).toEqual([1, 2, 3]);
  });
});

describe('parseJson - recursive traversal', () => {
  it('should recursively parse nested objects with $ref', () => {
    const input = {
      outer: {
        inner: {
          count: { $ref: 'state.count' },
        },
      },
    };
    const result = parseJson(input) as Record<string, unknown>;
    const outer = result.outer as Record<string, unknown>;
    const inner = outer.inner as Record<string, unknown>;
    expect(inner.count).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'count',
    });
  });

  it('should parse all elements in array with $expr', () => {
    const input = {
      arr: [
        { $expr: 'state.first' },
        { $expr: 'state.second' },
      ],
    };
    const result = parseJson(input) as Record<string, unknown>;
    const arr = result.arr as unknown[];
    expect(arr[0]).toEqual({ _type: 'expression', expression: 'state.first' });
    expect(arr[1]).toEqual({ _type: 'expression', expression: 'state.second' });
  });

  it('should parse mixed structure with native and $ref values', () => {
    const input = {
      obj: {
        arr: [{ nested: { $ref: 'state.value' } }],
        count: 10,
        label: 'test',
      },
    };
    const result = parseJson(input) as Record<string, unknown>;
    const obj = result.obj as Record<string, unknown>;
    const arr = obj.arr as unknown[];
    const firstItem = arr[0] as Record<string, unknown>;
    expect(firstItem.nested).toEqual({ _type: 'reference', prefix: 'state', variable: 'value' });
    expect(obj.count).toBe(10);
    expect(obj.label).toBe('test');
  });
});

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

describe('parseJson - legacy format rejected', () => {
  it('should reject legacy { type: "string", body: "..."} format', () => {
    const input = { key: { type: 'string', body: "'hello'" } };
    expect(() => parseJson(input)).toThrow('Legacy format');
  });

  it('should reject legacy { type: "object", body: "..." } format', () => {
    const input = { key: { type: 'object', body: '{{{ "a": 1 }}}' } };
    expect(() => parseJson(input)).toThrow('Legacy format');
  });

  it('should reject legacy { type: "expression", body: "..." } format', () => {
    const input = { key: { type: 'expression', body: '{{ref_state_count}}' } };
    expect(() => parseJson(input)).toThrow('Legacy format');
  });

  it('should reject legacy { type: "reference", body: "..." } format', () => {
    const input = { key: { type: 'reference', body: '{{ref_state_count}}' } };
    expect(() => parseJson(input)).toThrow('Legacy format');
  });

  it('should reject legacy { type: "scope", body: "..." } format', () => {
    const input = { key: { type: 'scope', body: '{{$_core_api}}' } };
    expect(() => parseJson(input)).toThrow('Legacy format');
  });

  it('should reject legacy { type: "function", params: "...", body: "..." } format', () => {
    const input = { key: { type: 'function', params: '{{{}}}', body: '{{methods.handleClick()}}' } };
    expect(() => parseJson(input)).toThrow('Legacy format');
  });
});