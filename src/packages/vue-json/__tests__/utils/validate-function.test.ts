import { describe, it, expect } from 'vitest';
import { validateFunctionValue } from '../../src/utils/validate-function';
import type { FunctionValue } from '../../src/types';

describe('validateFunctionValue', () => {
  it('should return valid FunctionValue when input is correct', () => {
    const input = { _type: 'function' as const, params: {}, body: 'return true' };
    const result = validateFunctionValue(input, 'test');
    expect(result).toEqual(input);
  });

  it('should return FunctionValue with non-empty params', () => {
    const input = { _type: 'function' as const, params: { x: 1, y: 2 }, body: 'return x + y' };
    const result = validateFunctionValue(input, 'test');
    expect(result.params).toEqual({ x: 1, y: 2 });
    expect(result.body).toBe('return x + y');
  });

  it('should throw when input is not an object', () => {
    expect(() => validateFunctionValue('not an object', 'path')).toThrow();
    expect(() => validateFunctionValue(123, 'path')).toThrow();
    expect(() => validateFunctionValue(true, 'path')).toThrow();
    expect(() => validateFunctionValue(undefined, 'path')).toThrow();
  });

  it('should throw when input is null', () => {
    expect(() => validateFunctionValue(null, 'path')).toThrow();
  });

  it('should throw when input is an array', () => {
    expect(() => validateFunctionValue([1, 2, 3], 'path')).toThrow();
  });

  it('should throw when _type is missing', () => {
    const input = { params: {}, body: 'return true' };
    expect(() => validateFunctionValue(input, 'path')).toThrow();
  });

  it('should throw when _type is not "function"', () => {
    const input = { _type: 'expression', params: {}, body: 'return true' };
    expect(() => validateFunctionValue(input, 'path')).toThrow();
  });

  it('should throw when body is missing', () => {
    const input = { _type: 'function' as const, params: {} };
    expect(() => validateFunctionValue(input, 'path')).toThrow();
  });

  it('should throw when body is not a string', () => {
    expect(() => validateFunctionValue({ _type: 'function' as const, params: {}, body: 123 }, 'path')).toThrow();
    expect(() => validateFunctionValue({ _type: 'function' as const, params: {}, body: null }, 'path')).toThrow();
    expect(() => validateFunctionValue({ _type: 'function' as const, params: {}, body: undefined }, 'path')).toThrow();
    expect(() => validateFunctionValue({ _type: 'function' as const, params: {}, body: {} }, 'path')).toThrow();
  });

  it('should throw when params is missing', () => {
    const input = { _type: 'function' as const, body: 'return true' };
    expect(() => validateFunctionValue(input, 'path')).toThrow();
  });

  it('should throw when params is null', () => {
    const input = { _type: 'function' as const, params: null, body: 'return true' };
    expect(() => validateFunctionValue(input, 'path')).toThrow();
  });

  it('should throw when params is not an object', () => {
    expect(() => validateFunctionValue({ _type: 'function' as const, params: 'not object', body: 'return true' }, 'path')).toThrow();
    expect(() => validateFunctionValue({ _type: 'function' as const, params: 123, body: 'return true' }, 'path')).toThrow();
  });

  it('should include correct path in error message for invalid type', () => {
    try {
      validateFunctionValue('invalid', 'my.path');
    } catch (e: unknown) {
      expect((e as Error).message).toContain('my.path');
    }
  });

  it('should include correct path in error message for missing body', () => {
    try {
      validateFunctionValue({ _type: 'function' as const, params: {} }, 'my.path');
    } catch (e: unknown) {
      expect((e as Error).message).toContain('my.path.body');
    }
  });

  it('should include correct path in error message for invalid params', () => {
    try {
      validateFunctionValue({ _type: 'function' as const, params: 'bad', body: 'return true' }, 'my.path');
    } catch (e: unknown) {
      expect((e as Error).message).toContain('my.path.params');
    }
  });
});
