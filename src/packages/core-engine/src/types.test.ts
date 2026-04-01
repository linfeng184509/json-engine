import { describe, it, expect } from 'vitest';
import type { ValueBody, FunctionBody } from './types';
import {
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValueReferenceParser,
  ValueExpressionParser,
  ValueFunctionParser,
} from './types';
import {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
} from './regex-factory';

const DEFAULT_REFERENCE_REGEX = createReferenceRegex(['props', 'state', 'computed']);
const DEFAULT_SCOPE_REGEX = createScopeRegex(['core', 'goal']);
const DEFAULT_INNER_REF_REGEX = createInnerReferenceRegex(['props', 'state', 'computed']);
const DEFAULT_INNER_SCOPE_REGEX = createInnerScopeRegex(['core', 'goal']);

describe('ValueObjectParser', () => {
  it('should parse empty object', () => {
    const input: ValueBody = { type: 'object', body: '{{{}}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({});
    expect(result.data?._type).toBe('object');
  });

  it('should parse single key-value pair with string value', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "key": "value" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ key: 'value' });
  });

  it('should parse multiple key-value pairs', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "padding": "24px", "margin": "16px" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ padding: '24px', margin: '16px' });
  });

  it('should parse object with JSON number value', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "count": 123, "price": 99.99 }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ count: 123, price: 99.99 });
  });

  it('should parse object with JSON boolean value', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "active": true, "disabled": false }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ active: true, disabled: false });
  });

  it('should parse object with null value', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "data": null }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ data: null });
  });

  it('should parse object with nested object', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "style": { "padding": "24px", "margin": "16px" } }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ style: { padding: '24px', margin: '16px' } });
  });

  it('should parse object with array', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "items": [1, 2, 3], "names": ["a", "b", "c"] }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ items: [1, 2, 3], names: ['a', 'b', 'c'] });
  });

  it('should parse object with state reference', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "name": "ref_state_userName", "age": "ref_state_userAge" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value.name).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'userName'
    });
    expect(result.data?.value.age).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'userAge'
    });
  });

  it('should parse object with props reference', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "value": "ref_props_modelValue" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value.value).toEqual({
      _type: 'reference',
      prefix: 'props',
      variable: 'modelValue'
    });
  });

  it('should parse object with computed reference', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "total": "ref_computed_sum" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value.total).toEqual({
      _type: 'reference',
      prefix: 'computed',
      variable: 'sum'
    });
  });

  it('should parse object with scope reference', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "api": "$_core_api", "auth": "$_core_auth" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value.api).toEqual({
      _type: 'scope',
      scope: 'core',
      variable: 'api'
    });
    expect(result.data?.value.auth).toEqual({
      _type: 'scope',
      scope: 'core',
      variable: 'auth'
    });
  });

  it('should parse object with mixed values', () => {
    const input: ValueBody = { 
      type: 'object', 
      body: '{{{ "padding": "24px", "count": 10, "active": true, "name": "ref_state_name", "api": "$_core_api" }}}' 
    };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({
      padding: '24px',
      count: 10,
      active: true,
      name: { _type: 'reference', prefix: 'state', variable: 'name' },
      api: { _type: 'scope', scope: 'core', variable: 'api' }
    });
  });

  it('should parse object with nested reference', () => {
    const input: ValueBody = { 
      type: 'object', 
      body: '{{{ "style": { "padding": "ref_state_padding", "margin": "16px" } }}}' 
    };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({
      style: {
        padding: { _type: 'reference', prefix: 'state', variable: 'padding' },
        margin: '16px'
      }
    });
  });

  it('should parse object with reference in array', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "items": ["ref_state_item1", "ref_state_item2", "static"] }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value.items).toEqual([
      { _type: 'reference', prefix: 'state', variable: 'item1' },
      { _type: 'reference', prefix: 'state', variable: 'item2' },
      'static'
    ]);
  });

  it('should parse object with reference path', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "name": "ref_state_user.name", "age": "ref_state_user.age" }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value.name).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'user',
      path: 'name'
    });
    expect(result.data?.value.age).toEqual({
      _type: 'reference',
      prefix: 'state',
      variable: 'user',
      path: 'age'
    });
  });

  it('should parse object with simplified format (auto-quoted keys)', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "padding": "24px", "margin": 16 }}}' };
    const result = ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.value).toEqual({ padding: '24px', margin: 16 });
  });

  it('should throw error when type is not object', () => {
    const input: ValueBody = { type: 'string', body: '{{{ "key": "value" }}}' };
    expect(() => ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX)).toThrow(
      '[ValueObjectParser] 验证失败: type 必须为 "object"，实际为 "string"。期望格式: {{{ key: value, ... }}}'
    );
  });

  it('should throw error when body format is invalid', () => {
    const input: ValueBody = { type: 'object', body: 'invalid format' };
    expect(() => ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX)).toThrow(
      '[ValueObjectParser] 验证失败: body 格式不正确: "invalid format"。期望格式: {{{ key: value, ... }}}'
    );
  });

  it('should throw error when JSON is malformed', () => {
    const input: ValueBody = { type: 'object', body: '{{{ "key": "value", "broken": } }}' };
    expect(() => ValueObjectParser(input, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX)).toThrow();
  });
});

describe('ValueConstraintParser', () => {
  it('should parse single-quoted string', () => {
    const input: ValueBody = { type: 'string', body: "'hello world'" };
    const result = ValueConstraintParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.value).toBe('hello world');
    expect(result.data?._type).toBe('string');
  });

  it('should parse empty string', () => {
    const input: ValueBody = { type: 'string', body: "''" };
    const result = ValueConstraintParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.value).toBe('');
  });

  it('should throw error with correct message when type is not string', () => {
    const input: ValueBody = { type: 'object', body: "'hello'" };
    expect(() => ValueConstraintParser(input)).toThrow(
      '[ValueConstraintParser] 验证失败: type 必须为 "string"，实际为 "object"。期望格式: \'字符串内容\''
    );
  });

  it('should throw error with correct message when body is not quoted', () => {
    const input: ValueBody = { type: 'string', body: 'hello' };
    expect(() => ValueConstraintParser(input)).toThrow(
      '[ValueConstraintParser] 验证失败: body 必须被单引号包裹: "hello"。期望格式: \'字符串内容\''
    );
  });
});

describe('ValueScopeParser', () => {
  it('should parse core scope', () => {
    const input: ValueBody = { type: 'scope', body: '{{$_core_varName}}' };
    const result = ValueScopeParser(input, DEFAULT_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.scope).toBe('core');
    expect(result.data?.variable).toBe('varName');
    expect(result.data?._type).toBe('scope');
  });

  it('should parse goal scope', () => {
    const input: ValueBody = { type: 'scope', body: '{{$_goal_varName}}' };
    const result = ValueScopeParser(input, DEFAULT_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.scope).toBe('goal');
    expect(result.data?.variable).toBe('varName');
  });

  it('should throw error with correct message when scope is not in configured list', () => {
    const customScopeRegex = createScopeRegex(['custom']);
    const input: ValueBody = { type: 'scope', body: '{{$_other_varName}}' };
    expect(() => ValueScopeParser(input, customScopeRegex)).toThrow(
      '[ValueScopeParser] 验证失败: body 格式不正确: "{{$_other_varName}}"。期望格式: {{$_[*]_变量名}}'
    );
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'scope', body: 'invalid' };
    expect(() => ValueScopeParser(input, DEFAULT_SCOPE_REGEX)).toThrow(
      '[ValueScopeParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{$_[*]_变量名}}'
    );
  });
});

describe('ValueReferenceParser', () => {
  it('should parse props variable', () => {
    const input: ValueBody = { type: 'reference', body: '{{ref_props_userId}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.prefix).toBe('props');
    expect(result.data?.variable).toBe('userId');
    expect(result.data?._type).toBe('reference');
  });

  it('should parse state variable', () => {
    const input: ValueBody = { type: 'reference', body: '{{ref_state_count}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.prefix).toBe('state');
    expect(result.data?.variable).toBe('count');
  });

  it('should parse reference with path', () => {
    const input: ValueBody = { type: 'reference', body: '{{ref_props_user.name}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.prefix).toBe('props');
    expect(result.data?.variable).toBe('user');
    expect(result.data?.path).toBe('name');
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'reference', body: 'invalid' };
    expect(() => ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX)).toThrow(
      '[ValueReferenceParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{ref_*_变量名}}'
    );
  });

  it('should throw error with correct message when type is not reference', () => {
    const input: ValueBody = { type: 'string', body: '{{ref_state_count}}' };
    expect(() => ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX)).toThrow(
      '[ValueReferenceParser] 验证失败: type 必须为 "reference"，实际为 "string"。期望格式: {{ref_*_变量名}}'
    );
  });
});

describe('ValueExpressionParser', () => {
  it('should parse expression', () => {
    const input: ValueBody = { type: 'expression', body: '{{a + b}}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toBe('a + b');
    expect(result.data?._type).toBe('expression');
  });

  it('should trim whitespace from expression', () => {
    const input: ValueBody = { type: 'expression', body: '{{  a + b  }}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toBe('a + b');
  });

  it('should parse expression as abstract reference for pure props', () => {
    const input: ValueBody = { type: 'expression', body: '{{ref_props_userId}}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toEqual({ _type: 'reference', prefix: 'props', variable: 'userId' });
  });

  it('should parse expression as abstract reference for pure state', () => {
    const input: ValueBody = { type: 'expression', body: '{{ref_state_count}}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toEqual({ _type: 'reference', prefix: 'state', variable: 'count' });
  });

  it('should parse expression as abstract scope for pure scope', () => {
    const input: ValueBody = { type: 'expression', body: '{{$_goal_target}}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toEqual({ _type: 'scope', scope: 'goal', variable: 'target' });
  });

  it('should keep expression as string for mixed content', () => {
    const input: ValueBody = { type: 'expression', body: '{{a + {{ref_props_x}}}}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toBe('a + {{ref_props_x}}');
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'expression', body: 'invalid' };
    expect(() => ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX)).toThrow(
      '[ValueExpressionParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{ 表达式 }}'
    );
  });

  it('should throw error with correct message when type is not expression', () => {
    const input: ValueBody = { type: 'string', body: '{{a + b}}' };
    expect(() => ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX)).toThrow(
      '[ValueExpressionParser] 验证失败: type 必须为 "expression"，实际为 "string"。期望格式: {{ 表达式 }}'
    );
  });
});

describe('ValueFunctionParser', () => {
  it('should parse function with params and body', () => {
    const input: FunctionBody = { type: 'function', params: '{{{}}}', body: '{{return x}}' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({});
    expect(result.data?.body).toBe('return x');
    expect(result.data?._type).toBe('function');
  });

  it('should parse function params as JSON object', () => {
    const input: FunctionBody = { type: 'function', params: '{{{ {"eventId": "click123"} }}}', body: '{{handleClick()}}' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({ eventId: 'click123' });
    expect(result.data?.body).toBe('handleClick()');
  });

  it('should parse function params with multiple keys', () => {
    const input: FunctionBody = { type: 'function', params: '{{{ {"x": 123, "y": true} }}}', body: '{{return x + y}}' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({ x: 123, y: true });
    expect(result.data?.body).toBe('return x + y');
  });

  it('should parse function params with nested JSON', () => {
    const input: FunctionBody = { type: 'function', params: '{{{ {"user": {"id": 1, "name": "test"}} }}}', body: '{{return user.id}}' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({ user: { id: 1, name: 'test' } });
  });

  it('should throw error with correct message when params is not triple braces', () => {
    const input: FunctionBody = { type: 'function', params: '{{"x": 123}}', body: '{{return x}}' };
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: params 格式不正确，期望三花括号: "{{\"x\": 123}}"。期望格式: {{{参数对象}}}'
    );
  });

  it('should throw error with correct message when body is not double braces', () => {
    const input: FunctionBody = { type: 'function', params: '{{{ "x": 123 }}}', body: 'return x' };
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: body 格式不正确，期望双花括号: "return x"。期望格式: {{函数体}}'
    );
  });

  it('should throw error with correct message when params JSON is invalid', () => {
    const input: FunctionBody = { type: 'function', params: '{{{invalid json}}}', body: '{{return x}}' };
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: params JSON 解析失败: "invalid json"。期望格式: {{{ "key": "value" }}}'
    );
  });

  it('should throw error with correct message when type is not function', () => {
    const input = { type: 'string', params: '{{{ "x": 1 }}}', body: '{{return x}}' } as unknown as FunctionBody;
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: type 必须为 "function"，实际为 "string"。期望格式: {{{参数对象}}}, {{函数体}}'
    );
  });
});

describe('createReferenceRegex', () => {
  it('should create regex for single prefix', () => {
    const regex = createReferenceRegex(['props']);
    expect(regex.test('{{ref_props_userId}}')).toBe(true);
    expect(regex.test('{{ref_state_count}}')).toBe(false);
  });

  it('should create regex for multiple prefixes', () => {
    const regex = createReferenceRegex(['props', 'state']);
    expect(regex.test('{{ref_props_userId}}')).toBe(true);
    expect(regex.test('{{ref_state_count}}')).toBe(true);
    expect(regex.test('{{ref_computed_total}}')).toBe(false);
  });
});

describe('createScopeRegex', () => {
  it('should create regex for single scope', () => {
    const regex = createScopeRegex(['core']);
    expect(regex.test('{{$_core_var}}')).toBe(true);
    expect(regex.test('{{$_goal_var}}')).toBe(false);
  });

  it('should create regex for multiple scopes', () => {
    const regex = createScopeRegex(['core', 'goal']);
    expect(regex.test('{{$_core_var}}')).toBe(true);
    expect(regex.test('{{$_goal_var}}')).toBe(true);
  });
});

describe('createInnerReferenceRegex', () => {
  it('should create regex for single prefix', () => {
    const regex = createInnerReferenceRegex(['props']);
    expect(regex.test('ref_props_userId')).toBe(true);
    expect(regex.test('ref_state_count')).toBe(false);
  });
});

describe('createInnerScopeRegex', () => {
  it('should create regex for single scope', () => {
    const regex = createInnerScopeRegex(['core']);
    expect(regex.test('$_core_var')).toBe(true);
    expect(regex.test('$_goal_var')).toBe(false);
  });
});
