import { describe, it, expect } from 'vitest';
import {
  maskName,
  maskPhone,
  maskIdCard,
  maskEmail,
  applyPrivacyMask,
  filterData,
} from '../../src/runtime/data-filter';
import type { FieldPermission } from '../../src/types';

describe('data-filter', () => {
  describe('maskName', () => {
    it('should mask name correctly', () => {
      expect(maskName('John')).toBe('J***');
      expect(maskName('Alice')).toBe('A****');
      expect(maskName('Bob')).toBe('B**');
    });

    it('should handle short names', () => {
      expect(maskName('A')).toBe('*');
      expect(maskName('')).toBe('*');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number correctly', () => {
      expect(maskPhone('13812345678')).toBe('*******5678');
      expect(maskPhone('15912345678')).toBe('*******5678');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhone('123456')).toBe('******');
    });
  });

  describe('maskIdCard', () => {
    it('should mask ID card correctly', () => {
      expect(maskIdCard('110101199001011234')).toBe('**************1234');
    });

    it('should handle short ID cards', () => {
      expect(maskIdCard('1234567')).toBe('*******');
    });
  });

  describe('maskEmail', () => {
    it('should mask email correctly', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(maskEmail('user@domain.org')).toBe('u**r@domain.org');
    });

    it('should handle short local parts', () => {
      expect(maskEmail('a@b.com')).toBe('*@b.com');
    });
  });

  describe('applyPrivacyMask', () => {
    it('should apply name mask', () => {
      expect(applyPrivacyMask('John', 'name')).toBe('J***');
    });

    it('should apply phone mask', () => {
      expect(applyPrivacyMask('13812345678', 'phone')).toBe('*******5678');
    });

    it('should handle null/undefined', () => {
      expect(applyPrivacyMask(null, 'name')).toBe('');
      expect(applyPrivacyMask(undefined, 'name')).toBe('');
    });
  });

  describe('filterData', () => {
    it('should filter hidden fields', () => {
      const data = { name: 'John', age: 30, secret: 'hidden' };
      const permissions: Record<string, FieldPermission> = {
        name: { read: true, write: true, hidden: false, privacy: false },
        age: { read: true, write: true, hidden: false, privacy: false },
        secret: { read: false, write: false, hidden: true, privacy: false },
      };

      const result = filterData(data, ['name', 'age', 'secret'], permissions);
      expect(result).toEqual({ name: 'John', age: 30 });
      expect(result).not.toHaveProperty('secret');
    });

    it('should filter non-readable fields', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const permissions: Record<string, FieldPermission> = {
        name: { read: true, write: true, hidden: false, privacy: false },
        email: { read: false, write: false, hidden: false, privacy: false },
      };

      const result = filterData(data, ['name', 'email'], permissions);
      expect(result).toEqual({ name: 'John' });
    });
  });
});