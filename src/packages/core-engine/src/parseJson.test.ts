import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseJson,
  registerKeyParser,
  unregisterKeyParser,
  clearKeyParsers,
} from './parseJson';

describe('registerKeyParser', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should register key parser and use it in parseJson', () => {
    registerKeyParser('onClick', (key) => 'parsed_' + key);
    const input = { onClick: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('parsed_onClick');
    expect(result).not.toHaveProperty('onClick');
  });

  it('should override parser when registering same key twice', () => {
    registerKeyParser('key', (k) => 'first_' + k);
    registerKeyParser('key', (k) => 'second_' + k);
    const input = { key: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('second_key');
    expect(result).not.toHaveProperty('first_key');
  });
});

describe('unregisterKeyParser', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should unregister key parser and not use it in parseJson', () => {
    registerKeyParser('onClick', (key) => 'parsed_' + key);
    unregisterKeyParser('onClick');
    const input = { onClick: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('onClick');
    expect(result).not.toHaveProperty('parsed_onClick');
  });

  it('should have no side effect when unregistering non-existent key', () => {
    unregisterKeyParser('nonExistent');
    const input = { key: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('key');
  });
});

describe('clearKeyParsers', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should clear all registered key parsers', () => {
    registerKeyParser('key1', (k) => 'parsed_' + k);
    registerKeyParser('key2', (k) => 'parsed_' + k);
    clearKeyParsers();
    const input = { key1: 'value1', key2: 'value2' };
    const result = parseJson(input);
    expect(result).toHaveProperty('key1');
    expect(result).toHaveProperty('key2');
    expect(result).not.toHaveProperty('parsed_key1');
    expect(result).not.toHaveProperty('parsed_key2');
  });
});

describe('parseJson - key parsing', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should use globally registered key parser', () => {
    registerKeyParser('myKey', (key) => 'transformed_' + key);
    const input = { myKey: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('transformed_myKey');
  });

  it('should use config.keyParsers for key transformation', () => {
    const input = { configKey: 'value' };
    const result = parseJson(input, {
      keyParsers: {
        configKey: (key) => 'config_' + key,
      },
    });
    expect(result).toHaveProperty('config_configKey');
  });

  it('should return original key when not registered', () => {
    const input = { unknownKey: 'value' };
    const result = parseJson(input);
    expect(result).toHaveProperty('unknownKey');
    expect((result as Record<string, unknown>).unknownKey).toBe('value');
  });

  it('should use config.keyParsers over global registry', () => {
    registerKeyParser('myKey', (key) => 'global_' + key);
    const input = { myKey: 'value' };
    const result = parseJson(input, {
      keyParsers: {
        myKey: (key) => 'config_' + key,
      },
    });
    expect(result).toHaveProperty('config_myKey');
    expect(result).not.toHaveProperty('global_myKey');
  });
});

describe('parseJson - value parsing', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should use ValueConstraintParser for type=string', () => {
    const input = {
      key: { type: 'string', body: "'hello'" },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({ value: 'hello' });
  });

  it('should use ValueScopeParser for type=scope', () => {
    const input = {
      key: { type: 'scope', body: '{{$_[core]_myVar}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({
      scope: 'core',
      variable: 'myVar',
    });
  });

  it('should use ValuePropsParser for type=props', () => {
    const input = {
      key: { type: 'props', body: '{{ref_props_userId}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({ variable: 'userId' });
  });

  it('should use ValueStateParser for type=state', () => {
    const input = {
      key: { type: 'state', body: '{{ref_state_count}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({ variable: 'count' });
  });

  it('should use ValueExpressionParser for type=expression', () => {
    const input = {
      key: { type: 'expression', body: '{{a + b}}' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({ expression: 'a + b' });
  });

  it('should use ValueFunctionParser for type=function', () => {
    const input = {
      key: { type: 'function', params: '{{x}}', body: 'return x' },
    };
    const result = parseJson(input);
    expect((result as Record<string, unknown>).key).toEqual({
      params: '{{x}}',
      body: 'return x',
    });
  });
});

describe('parseJson - recursive traversal', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

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
    expect(arr[0]).toEqual({ value: 'first' });
    expect(arr[1]).toEqual({ value: 'second' });
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
    expect(firstItem.nested).toEqual({ scope: 'goal', variable: 'var' });
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
      expression: 'deep expression',
    });
  });
});

describe('parseJson - callback function', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should call onParsed callback for each parsed node', () => {
    const calls: Array<{ path: string; key: string; value: unknown }> = [];
    const input = {
      key1: 'value1',
      key2: 'value2',
    };
    parseJson(input, {
      onParsed: (path, key, value) => {
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
      onParsed: (path, _key, _value) => {
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
      onParsed: (_path, key, value) => {
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
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

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

describe('parseJson - nested reference in function', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should parse function params with pure scope reference', () => {
    const input = {
      onClick: { type: 'function', params: '{{$_[core]_eventId}}', body: 'handleClick()' },
    };
    const result = parseJson(input);
    const onClick = (result as Record<string, unknown>).onClick as Record<string, unknown>;
    expect(onClick.params).toEqual({
      type: 'scope',
      scope: 'core',
      variable: 'eventId',
    });
    expect(onClick.body).toBe('handleClick()');
  });

  it('should parse function params with pure props reference', () => {
    const input = {
      handler: { type: 'function', params: '{{ref_props_itemId}}', body: 'return itemId' },
    };
    const result = parseJson(input);
    const handler = (result as Record<string, unknown>).handler as Record<string, unknown>;
    expect(handler.params).toEqual({
      type: 'props',
      variable: 'itemId',
    });
  });

  it('should parse function params with pure state reference', () => {
    const input = {
      handler: { type: 'function', params: '{{ref_state_count}}', body: 'return count' },
    };
    const result = parseJson(input);
    const handler = (result as Record<string, unknown>).handler as Record<string, unknown>;
    expect(handler.params).toEqual({
      type: 'state',
      variable: 'count',
    });
  });

  it('should keep function params as string for mixed content', () => {
    const input = {
      onClick: { type: 'function', params: 'config={{$_[core]_config}}', body: 'handleClick()' },
    };
    const result = parseJson(input);
    const onClick = (result as Record<string, unknown>).onClick as Record<string, unknown>;
    expect(onClick.params).toBe('config={{$_[core]_config}}');
  });
});

describe('parseJson - nested reference in expression', () => {
  beforeEach(() => {
    clearKeyParsers();
  });

  afterEach(() => {
    clearKeyParsers();
  });

  it('should parse expression with pure scope reference', () => {
    const input = {
      value: { type: 'expression', body: '{{$_[goal]_target}}' },
    };
    const result = parseJson(input);
    const value = (result as Record<string, unknown>).value as Record<string, unknown>;
    expect(value.expression).toEqual({
      type: 'scope',
      scope: 'goal',
      variable: 'target',
    });
  });

  it('should parse expression with pure props reference', () => {
    const input = {
      value: { type: 'expression', body: '{{ref_props_userId}}' },
    };
    const result = parseJson(input);
    const value = (result as Record<string, unknown>).value as Record<string, unknown>;
    expect(value.expression).toEqual({
      type: 'props',
      variable: 'userId',
    });
  });

  it('should parse expression with pure state reference', () => {
    const input = {
      value: { type: 'expression', body: '{{ref_state_count}}' },
    };
    const result = parseJson(input);
    const value = (result as Record<string, unknown>).value as Record<string, unknown>;
    expect(value.expression).toEqual({
      type: 'state',
      variable: 'count',
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