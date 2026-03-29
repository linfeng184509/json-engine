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
  it('should parse object with string value', () => {
    const input: ValueBody = { type: 'object', body: '{{{[key]:[value]}}}' };
    const result = ValueObjectParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.key).toBe('key');
    expect(result.data?.value).toBe('value');
    expect(result.data?._type).toBe('object');
  });

  it('should parse object with JSON number value', () => {
    const input: ValueBody = { type: 'object', body: '{{{[key]:[123]}}}' };
    const result = ValueObjectParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.key).toBe('key');
    expect(result.data?.value).toBe(123);
  });

  it('should parse object with JSON boolean value', () => {
    const input: ValueBody = { type: 'object', body: '{{{[key]:[true]}}}' };
    const result = ValueObjectParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.key).toBe('key');
    expect(result.data?.value).toBe(true);
  });

  it('should throw error with correct message when type is not object', () => {
    const input: ValueBody = { type: 'string', body: '{{{[key]:[value]}}}' };
    expect(() => ValueObjectParser(input)).toThrow(
      '[ValueObjectParser] 验证失败: type 必须为 "object"，实际为 "string"。期望格式: {{{[键]:[值]}}}'
    );
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'object', body: 'invalid format' };
    expect(() => ValueObjectParser(input)).toThrow(
      '[ValueObjectParser] 验证失败: body 格式不正确: "invalid format"。期望格式: {{{[键]:[值]}}}'
    );
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
    const input: ValueBody = { type: 'scope', body: '{{$_[core]_varName}}' };
    const result = ValueScopeParser(input, DEFAULT_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.scope).toBe('core');
    expect(result.data?.variable).toBe('varName');
    expect(result.data?._type).toBe('scope');
  });

  it('should parse goal scope', () => {
    const input: ValueBody = { type: 'scope', body: '{{$_[goal]_varName}}' };
    const result = ValueScopeParser(input, DEFAULT_SCOPE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.scope).toBe('goal');
    expect(result.data?.variable).toBe('varName');
  });

  it('should throw error with correct message when scope is not in configured list', () => {
    const customScopeRegex = createScopeRegex(['custom']);
    const input: ValueBody = { type: 'scope', body: '{{$_[other]_varName}}' };
    expect(() => ValueScopeParser(input, customScopeRegex)).toThrow(
      '[ValueScopeParser] 验证失败: body 格式不正确: "{{$_[other]_varName}}"。期望格式: {{$_[*]_变量名}}'
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
    const input: ValueBody = { type: 'expression', body: '{{$_[goal]_target}}' };
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
    expect(regex.test('{{$_[core]_var}}')).toBe(true);
    expect(regex.test('{{$_[goal]_var}}')).toBe(false);
  });

  it('should create regex for multiple scopes', () => {
    const regex = createScopeRegex(['core', 'goal']);
    expect(regex.test('{{$_[core]_var}}')).toBe(true);
    expect(regex.test('{{$_[goal]_var}}')).toBe(true);
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
    expect(regex.test('$_[core]_var')).toBe(true);
    expect(regex.test('$_[goal]_var')).toBe(false);
  });
});
