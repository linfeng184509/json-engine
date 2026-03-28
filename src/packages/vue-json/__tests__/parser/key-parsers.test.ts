import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  registerDefaultKeyParsers,
  unregisterDefaultKeyParsers,
  registerVueJsonKeyParser,
  unregisterVueJsonKeyParser,
  clearVueJsonKeyParsers,
  toPascalCase,
  isValidVariableName,
} from '../../src/parser/key-parsers';

describe('key-parsers', () => {
  beforeEach(() => {
    clearVueJsonKeyParsers();
  });

  afterEach(() => {
    clearVueJsonKeyParsers();
  });

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

  describe('registerDefaultKeyParsers', () => {
    it('should register default parsers without error', () => {
      expect(() => registerDefaultKeyParsers()).not.toThrow();
    });

    it('should allow unregistering default parsers', () => {
      registerDefaultKeyParsers();
      expect(() => unregisterDefaultKeyParsers()).not.toThrow();
    });
  });

  describe('registerVueJsonKeyParser', () => {
    it('should register custom parser', () => {
      const customParser = (key: string) => key.toUpperCase();
      expect(() => registerVueJsonKeyParser('uppercase', customParser)).not.toThrow();
    });

    it('should allow unregistering custom parser', () => {
      const customParser = (key: string) => key.toUpperCase();
      registerVueJsonKeyParser('uppercase', customParser);
      expect(() => unregisterVueJsonKeyParser('uppercase')).not.toThrow();
    });

    it('should allow re-registering with same name', () => {
      const parser1 = (key: string) => key.toUpperCase();
      const parser2 = (key: string) => key.toLowerCase();
      registerVueJsonKeyParser('transform', parser1);
      expect(() => registerVueJsonKeyParser('transform', parser2)).not.toThrow();
    });
  });

  describe('clearVueJsonKeyParsers', () => {
    it('should clear all parsers without error', () => {
      registerVueJsonKeyParser('test', (key) => key);
      expect(() => clearVueJsonKeyParsers()).not.toThrow();
    });
  });
});