import { describe, it, expect } from 'vitest';
import type { ValueBody, FunctionBody } from './types';
import {
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValuePropsParser,
  ValueStateParser,
  ValueExpressionParser,
  ValueFunctionParser,
  parseNestedReference,
} from './types';

describe('ValueObjectParser', () => {
  it('should parse object with string value', () => {
    const input: ValueBody = { type: 'object', body: '{{{[key]:[value]}}}' };
    const result = ValueObjectParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.key).toBe('key');
    expect(result.data?.value).toBe('value');
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
    const result = ValueScopeParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.scope).toBe('core');
    expect(result.data?.variable).toBe('varName');
  });

  it('should parse goal scope', () => {
    const input: ValueBody = { type: 'scope', body: '{{$_[goal]_varName}}' };
    const result = ValueScopeParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.scope).toBe('goal');
    expect(result.data?.variable).toBe('varName');
  });

  it('should throw error with correct message when scope is not core or goal', () => {
    const input: ValueBody = { type: 'scope', body: '{{$_[other]_varName}}' };
    expect(() => ValueScopeParser(input)).toThrow(
      '[ValueScopeParser] 验证失败: body 格式不正确: "{{$_[other]_varName}}"。期望格式: {{$_[core|goal]_变量名}}'
    );
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'scope', body: 'invalid' };
    expect(() => ValueScopeParser(input)).toThrow(
      '[ValueScopeParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{$_[core|goal]_变量名}}'
    );
  });
});

describe('ValuePropsParser', () => {
  it('should parse props variable', () => {
    const input: ValueBody = { type: 'props', body: '{{ref_props_userId}}' };
    const result = ValuePropsParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.variable).toBe('userId');
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'props', body: 'invalid' };
    expect(() => ValuePropsParser(input)).toThrow(
      '[ValuePropsParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{ref_props_变量名}}'
    );
  });

  it('should throw error with correct message when type is not props', () => {
    const input: ValueBody = { type: 'state', body: '{{ref_props_userId}}' };
    expect(() => ValuePropsParser(input)).toThrow(
      '[ValuePropsParser] 验证失败: type 必须为 "props"，实际为 "state"。期望格式: {{ref_props_变量名}}'
    );
  });
});

describe('ValueStateParser', () => {
  it('should parse state variable', () => {
    const input: ValueBody = { type: 'state', body: '{{ref_state_count}}' };
    const result = ValueStateParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.variable).toBe('count');
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'state', body: 'invalid' };
    expect(() => ValueStateParser(input)).toThrow(
      '[ValueStateParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{ref_state_变量名}}'
    );
  });

  it('should throw error with correct message when type is not state', () => {
    const input: ValueBody = { type: 'props', body: '{{ref_state_count}}' };
    expect(() => ValueStateParser(input)).toThrow(
      '[ValueStateParser] 验证失败: type 必须为 "state"，实际为 "props"。期望格式: {{ref_state_变量名}}'
    );
  });
});

describe('ValueExpressionParser', () => {
  it('should parse expression', () => {
    const input: ValueBody = { type: 'expression', body: '{{a + b}}' };
    const result = ValueExpressionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toBe('a + b');
  });

  it('should trim whitespace from expression', () => {
    const input: ValueBody = { type: 'expression', body: '{{  a + b  }}' };
    const result = ValueExpressionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toBe('a + b');
  });

  it('should parse expression as nested reference for pure scope', () => {
    const input: ValueBody = { type: 'expression', body: '{{$_[goal]_target}}' };
    const result = ValueExpressionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toEqual({ type: 'scope', scope: 'goal', variable: 'target' });
  });

  it('should parse expression as nested reference for pure props', () => {
    const input: ValueBody = { type: 'expression', body: '{{ref_props_userId}}' };
    const result = ValueExpressionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toEqual({ type: 'props', variable: 'userId' });
  });

  it('should parse expression as nested reference for pure state', () => {
    const input: ValueBody = { type: 'expression', body: '{{ref_state_count}}' };
    const result = ValueExpressionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toEqual({ type: 'state', variable: 'count' });
  });

  it('should keep expression as string for mixed content', () => {
    const input: ValueBody = { type: 'expression', body: '{{a + {{ref_props_x}}}}' };
    const result = ValueExpressionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.expression).toBe('a + {{ref_props_x}}');
  });

  it('should throw error with correct message when body format is invalid', () => {
    const input: ValueBody = { type: 'expression', body: 'invalid' };
    expect(() => ValueExpressionParser(input)).toThrow(
      '[ValueExpressionParser] 验证失败: body 格式不正确: "invalid"。期望格式: {{ 表达式 }}'
    );
  });

  it('should throw error with correct message when type is not expression', () => {
    const input: ValueBody = { type: 'string', body: '{{a + b}}' };
    expect(() => ValueExpressionParser(input)).toThrow(
      '[ValueExpressionParser] 验证失败: type 必须为 "expression"，实际为 "string"。期望格式: {{ 表达式 }}'
    );
  });
});

describe('ValueFunctionParser', () => {
  it('should parse function with params and body', () => {
    const input: FunctionBody = { type: 'function', params: '{{x}}', body: 'return x' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toBe('{{x}}');
    expect(result.data?.body).toBe('return x');
  });

  it('should parse function params as nested reference for pure scope', () => {
    const input: FunctionBody = { type: 'function', params: '{{$_[core]_eventId}}', body: 'handleClick()' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({ type: 'scope', scope: 'core', variable: 'eventId' });
    expect(result.data?.body).toBe('handleClick()');
  });

  it('should parse function params as nested reference for pure props', () => {
    const input: FunctionBody = { type: 'function', params: '{{ref_props_itemId}}', body: 'return itemId' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({ type: 'props', variable: 'itemId' });
  });

  it('should parse function params as nested reference for pure state', () => {
    const input: FunctionBody = { type: 'function', params: '{{ref_state_count}}', body: 'return count' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toEqual({ type: 'state', variable: 'count' });
  });

  it('should keep function params as string for mixed content', () => {
    const input: FunctionBody = { type: 'function', params: '{id: {{$_[core]_id}}}', body: 'return id' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(true);
    expect(result.data?.params).toBe('{id: {{$_[core]_id}}}');
  });

  it('should throw error with correct message when params is empty', () => {
    const input: FunctionBody = { type: 'function', params: '', body: 'return x' };
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: params 不能为空。期望格式: { type: "function", params: "参数", body: "函数体" }'
    );
  });

  it('should throw error with correct message when body is empty', () => {
    const input: FunctionBody = { type: 'function', params: '{{x}}', body: '' };
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: body 不能为空。期望格式: { type: "function", params: "参数", body: "函数体" }'
    );
  });

  it('should throw error with correct message when type is not function', () => {
    const input = { type: 'string', params: '{{x}}', body: 'return x' } as unknown as FunctionBody;
    expect(() => ValueFunctionParser(input)).toThrow(
      '[ValueFunctionParser] 验证失败: type 必须为 "function"，实际为 "string"。期望格式: { type: "function", params: "参数", body: "函数体" }'
    );
  });
});

describe('parseNestedReference', () => {
  it('should parse pure scope reference', () => {
    const result = parseNestedReference('{{$_[core]_userName}}');
    expect(result).toEqual({ type: 'scope', scope: 'core', variable: 'userName' });
  });

  it('should parse pure goal scope reference', () => {
    const result = parseNestedReference('{{$_[goal]_target}}');
    expect(result).toEqual({ type: 'scope', scope: 'goal', variable: 'target' });
  });

  it('should parse pure props reference', () => {
    const result = parseNestedReference('{{ref_props_itemId}}');
    expect(result).toEqual({ type: 'props', variable: 'itemId' });
  });

  it('should parse pure state reference', () => {
    const result = parseNestedReference('{{ref_state_count}}');
    expect(result).toEqual({ type: 'state', variable: 'count' });
  });

  it('should return original string for mixed content with scope', () => {
    const result = parseNestedReference('handleClick({{$_[core]_id}})');
    expect(result).toBe('handleClick({{$_[core]_id}})');
  });

  it('should return original string for mixed content with props', () => {
    const result = parseNestedReference('prefix{{ref_props_x}}suffix');
    expect(result).toBe('prefix{{ref_props_x}}suffix');
  });

  it('should return original string for non-reference content', () => {
    const result = parseNestedReference('plain text');
    expect(result).toBe('plain text');
  });

  it('should return empty string for empty input', () => {
    const result = parseNestedReference('');
    expect(result).toBe('');
  });

  it('should return original string for invalid scope format', () => {
    const result = parseNestedReference('{{$_[invalid]_var}}');
    expect(result).toBe('{{$_[invalid]_var}}');
  });
});