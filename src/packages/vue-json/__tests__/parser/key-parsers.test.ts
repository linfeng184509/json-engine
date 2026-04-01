import { describe, it, expect } from 'vitest';
import {
  getVueKeyParsers,
  toPascalCase,
  isValidVariableName,
} from '../../src/parser/key-parsers';

describe('key-parsers', () => {
  describe('toPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('my-component')).toBe('MyComponent');
    });

    it('should convert single word to PascalCase', () => {
      expect(toPascalCase('component')).toBe('Component');
    });

    it('should handle multiple dashes', () => {
      expect(toPascalCase('my-long-component-name')).toBe('MyLongComponentName');
    });

    it('should handle already PascalCase', () => {
      expect(toPascalCase('MyComponent')).toBe('MyComponent');
    });
  });

  describe('isValidVariableName', () => {
    it('should return true for valid variable names', () => {
      expect(isValidVariableName('count')).toBe(true);
      expect(isValidVariableName('userName')).toBe(true);
      expect(isValidVariableName('_private')).toBe(true);
      expect(isValidVariableName('$jquery')).toBe(true);
    });

    it('should return false for invalid variable names', () => {
      expect(isValidVariableName('123abc')).toBe(false);
      expect(isValidVariableName('my-var')).toBe(false);
      expect(isValidVariableName('my.var')).toBe(false);
      expect(isValidVariableName('')).toBe(false);
    });

    it('should return true for reserved word-like names', () => {
      expect(isValidVariableName('class')).toBe(true);
      expect(isValidVariableName('function')).toBe(true);
    });
  });

  describe('getVueKeyParsers', () => {
    it('should return key parsers registry', () => {
      const parsers = getVueKeyParsers();
      expect(parsers).toBeDefined();
      expect(typeof parsers.componentName).toBe('function');
      expect(typeof parsers.stateKey).toBe('function');
    });

    it('should transform component names', () => {
      const parsers = getVueKeyParsers();
      expect(parsers.componentName('my-button')).toBe('MyButton');
    });

    it('should validate state keys', () => {
      const parsers = getVueKeyParsers();
      expect(parsers.stateKey('count')).toBe('count');
      expect(() => parsers.stateKey('123invalid')).toThrow();
    });
  });
});