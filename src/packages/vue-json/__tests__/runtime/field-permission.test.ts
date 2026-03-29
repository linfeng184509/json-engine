import { describe, it, expect } from 'vitest';
import {
  getFieldPermission,
  canReadField,
  canWriteField,
  isFieldHidden,
  isFieldPrivate,
} from '../../src/runtime/field-permission';
import {
  registerPermissionProvider,
  DefaultPermissionProvider,
} from '../../src/runtime/permission-provider';
import type { PermissionProvider } from '../../src/types';

describe('field-permission', () => {
  describe('DefaultPermissionProvider', () => {
    it('should return default field permission with read/write true, hidden/privacy false', () => {
      const result = DefaultPermissionProvider.getFieldPermission('page1', 'field1');
      expect(result).toEqual({
        read: true,
        write: true,
        hidden: false,
        privacy: false,
      });
    });
  });

  describe('getFieldPermission', () => {
    it('should return field permission from provider', () => {
      const customProvider: PermissionProvider = {
        getPermissions: () => [],
        getRoles: () => [],
        getPlatform: () => 'pc-browser',
        checkPermission: () => false,
        getFieldPermission: (page, field) => ({
          read: page === 'user-list' && field === 'name',
          write: page === 'user-list' && field === 'name',
          hidden: false,
          privacy: false,
        }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };

      registerPermissionProvider(customProvider);

      const result = getFieldPermission('user-list', 'name');
      expect(result.read).toBe(true);

      const result2 = getFieldPermission('user-list', 'email');
      expect(result2.read).toBe(false);

      registerPermissionProvider(DefaultPermissionProvider);
    });
  });

  describe('canReadField', () => {
    it('should return true when field has read permission', () => {
      const result = canReadField('page1', 'field1');
      expect(result).toBe(true);
    });
  });

  describe('canWriteField', () => {
    it('should return true when field has write permission', () => {
      const result = canWriteField('page1', 'field1');
      expect(result).toBe(true);
    });
  });

  describe('isFieldHidden', () => {
    it('should return false for default provider', () => {
      const result = isFieldHidden('page1', 'field1');
      expect(result).toBe(false);
    });
  });

  describe('isFieldPrivate', () => {
    it('should return false for default provider', () => {
      const result = isFieldPrivate('page1', 'field1');
      expect(result).toBe(false);
    });
  });
});