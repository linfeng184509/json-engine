import { describe, it, expect } from 'vitest';
import type { ValueBody, FunctionBody } from './types';
import {
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

  it('should return error when scope is not in configured list', () => {
    const customScopeRegex = createScopeRegex(['custom']);
    const input: ValueBody = { type: 'scope', body: '{{$_other_varName}}' };
    const result = ValueScopeParser(input, customScopeRegex);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid body');
    }
  });

  it('should return error when body format is invalid', () => {
    const input: ValueBody = { type: 'scope', body: 'invalid' };
    const result = ValueScopeParser(input, DEFAULT_SCOPE_REGEX);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid body');
    }
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

  it('should parse computed variable', () => {
    const input: ValueBody = { type: 'reference', body: '{{ref_computed_total}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.prefix).toBe('computed');
    expect(result.data?.variable).toBe('total');
  });

  it('should parse reference with path', () => {
    const input: ValueBody = { type: 'reference', body: '{{ref_props_user.name}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.prefix).toBe('props');
    expect(result.data?.variable).toBe('user');
    expect(result.data?.path).toBe('name');
  });

  it('should parse reference with nested path', () => {
    const input: ValueBody = { type: 'reference', body: '{{ref_state_user.profile.email}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(true);
    expect(result.data?.prefix).toBe('state');
    expect(result.data?.variable).toBe('user');
    expect(result.data?.path).toBe('profile.email');
  });

  it('should return error when body format is invalid', () => {
    const input: ValueBody = { type: 'reference', body: 'invalid' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid body');
    }
  });

  it('should return error when type is not reference', () => {
    const input: ValueBody = { type: 'string', body: '{{ref_state_count}}' };
    const result = ValueReferenceParser(input, DEFAULT_REFERENCE_REGEX);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('type must be "reference"');
    }
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

  it('should return error when body format is invalid', () => {
    const input: ValueBody = { type: 'expression', body: 'invalid' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid body');
    }
  });

  it('should return error when type is not expression', () => {
    const input: ValueBody = { type: 'string', body: '{{a + b}}' };
    const result = ValueExpressionParser(input, DEFAULT_REFERENCE_REGEX, DEFAULT_SCOPE_REGEX, DEFAULT_INNER_REF_REGEX, DEFAULT_INNER_SCOPE_REGEX);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('type must be "expression"');
    }
  });
});

describe('ValueFunctionParser', () => {
  it('should parse function with empty params and body', () => {
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

  it('should return error when params is not triple braces', () => {
    const input: FunctionBody = { type: 'function', params: '{{"x": 123}}', body: '{{return x}}' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid params');
    }
  });

  it('should return error when body is not double braces', () => {
    const input: FunctionBody = { type: 'function', params: '{{{ "x": 123 }}}', body: 'return x' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid body');
    }
  });

  it('should return error when params JSON is invalid', () => {
    const input: FunctionBody = { type: 'function', params: '{{{invalid json}}}', body: '{{return x}}' };
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('invalid params JSON');
    }
  });

  it('should return error when type is not function', () => {
    const input = { type: 'string', params: '{{{ "x": 1 }}}', body: '{{return x}}' } as unknown as FunctionBody;
    const result = ValueFunctionParser(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('type must be "function"');
    }
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