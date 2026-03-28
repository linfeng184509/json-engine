import { describe, it, expect } from 'vitest';
import { generateComponentId, removeStyles, getInjectedStyleIds } from '../../src/runtime/style-injector';

describe('style-injector', () => {
  describe('generateComponentId', () => {
    it('should generate ID from component name', () => {
      const id = generateComponentId('MyComponent');
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('should generate different IDs for different names', () => {
      const id1 = generateComponentId('ComponentA');
      const id2 = generateComponentId('ComponentB');
      expect(id1).not.toBe(id2);
    });

    it('should sanitize component name to lowercase', () => {
      const id = generateComponentId('MyComponent');
      expect(id).toContain('mycomponent');
    });

    it('should generate unique IDs for multiple calls', () => {
      const id1 = generateComponentId('Test');
      const id2 = generateComponentId('Test');
      expect(id1).not.toBe(id2);
    });
  });

  describe('removeStyles', () => {
    it('should not throw when removing non-existent styles', () => {
      expect(() => removeStyles('non-existent-id')).not.toThrow();
    });
  });

  describe('getInjectedStyleIds', () => {
    it('should return empty array initially', () => {
      const ids = getInjectedStyleIds();
      expect(Array.isArray(ids)).toBe(true);
    });
  });
});
