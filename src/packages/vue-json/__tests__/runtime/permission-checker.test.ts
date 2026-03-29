import { describe, it, expect, beforeEach } from 'vitest';
import {
  PermissionCheckerImpl,
  has,
  hasAny,
  hasAll,
  hasRole,
  registerPagePermission,
} from '../../src/runtime/permission-checker';
import {
  registerPermissionProvider,
  DefaultPermissionProvider,
} from '../../src/runtime/permission-provider';
import type { PermissionProvider } from '../../src/types';

describe('permission-checker', () => {
  beforeEach(() => {
    registerPermissionProvider(DefaultPermissionProvider);
  });

  describe('PermissionCheckerImpl.has', () => {
    it('should return false with default provider', () => {
      expect(PermissionCheckerImpl.has('user.list.view')).toBe(false);
    });

    it('should return true when provider grants permission', () => {
      const customProvider: PermissionProvider = {
        getPermissions: () => ['user.list.view', 'user.list.edit'],
        getRoles: () => [],
        getPlatform: () => 'pc-browser',
        checkPermission: (p) => p === 'user.list.view',
        getFieldPermission: () => ({ read: true, write: true, hidden: false, privacy: false }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };
      registerPermissionProvider(customProvider);

      expect(PermissionCheckerImpl.has('user.list.view')).toBe(true);
      expect(PermissionCheckerImpl.has('user.list.delete')).toBe(false);
    });
  });

  describe('PermissionCheckerImpl.hasAny', () => {
    it('should return false with empty array', () => {
      expect(PermissionCheckerImpl.hasAny([])).toBe(false);
    });

    it('should return true if any permission matches', () => {
      const customProvider: PermissionProvider = {
        getPermissions: () => ['user.list.view'],
        getRoles: () => [],
        getPlatform: () => 'pc-browser',
        checkPermission: (p) => p === 'user.list.view',
        getFieldPermission: () => ({ read: true, write: true, hidden: false, privacy: false }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };
      registerPermissionProvider(customProvider);

      expect(PermissionCheckerImpl.hasAny(['user.list.view', 'user.list.edit'])).toBe(true);
      expect(PermissionCheckerImpl.hasAny(['user.list.edit', 'user.list.delete'])).toBe(false);
    });
  });

  describe('PermissionCheckerImpl.hasAll', () => {
    it('should return true with empty array', () => {
      expect(PermissionCheckerImpl.hasAll([])).toBe(true);
    });

    it('should return true if all permissions match', () => {
      const customProvider: PermissionProvider = {
        getPermissions: () => ['user.list.view', 'user.list.edit'],
        getRoles: () => [],
        getPlatform: () => 'pc-browser',
        checkPermission: (p) => p === 'user.list.view' || p === 'user.list.edit',
        getFieldPermission: () => ({ read: true, write: true, hidden: false, privacy: false }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };
      registerPermissionProvider(customProvider);

      expect(PermissionCheckerImpl.hasAll(['user.list.view', 'user.list.edit'])).toBe(true);
      expect(PermissionCheckerImpl.hasAll(['user.list.view', 'user.list.delete'])).toBe(false);
    });
  });

  describe('PermissionCheckerImpl.hasRole', () => {
    it('should return false with default provider', () => {
      expect(PermissionCheckerImpl.hasRole('admin')).toBe(false);
    });

    it('should return true when user has role', () => {
      const customProvider: PermissionProvider = {
        getPermissions: () => [],
        getRoles: () => ['admin', 'user'],
        getPlatform: () => 'pc-browser',
        checkPermission: () => false,
        getFieldPermission: () => ({ read: true, write: true, hidden: false, privacy: false }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };
      registerPermissionProvider(customProvider);

      expect(PermissionCheckerImpl.hasRole('admin')).toBe(true);
      expect(PermissionCheckerImpl.hasRole('superadmin')).toBe(false);
    });
  });

  describe('PermissionCheckerImpl.isPlatform', () => {
    it('should return true for matching platform', () => {
      const customProvider: PermissionProvider = {
        getPermissions: () => [],
        getRoles: () => [],
        getPlatform: () => 'pda',
        checkPermission: () => false,
        getFieldPermission: () => ({ read: true, write: true, hidden: false, privacy: false }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };
      registerPermissionProvider(customProvider);

      expect(PermissionCheckerImpl.isPlatform('pda')).toBe(true);
      expect(PermissionCheckerImpl.isPlatform('pc-browser')).toBe(false);
    });
  });

  describe('PermissionCheckerImpl.canAccessPage', () => {
    it('should return true when no permission is registered for page', () => {
      expect(PermissionCheckerImpl.canAccessPage('any-page')).toBe(true);
    });

    it('should return true when user has page permission', () => {
      registerPagePermission('admin-page', 'admin.access');

      const customProvider: PermissionProvider = {
        getPermissions: () => ['admin.access'],
        getRoles: () => [],
        getPlatform: () => 'pc-browser',
        checkPermission: (p) => p === 'admin.access',
        getFieldPermission: () => ({ read: true, write: true, hidden: false, privacy: false }),
        getSOPStepPermission: () => ({ canExecute: false, canView: false, availableFields: [] }),
      };
      registerPermissionProvider(customProvider);

      expect(PermissionCheckerImpl.canAccessPage('admin-page')).toBe(true);
      expect(PermissionCheckerImpl.canAccessPage('other-page')).toBe(true);
    });
  });

  describe('has', () => {
    it('should delegate to PermissionCheckerImpl', () => {
      expect(has('test')).toBe(false);
    });
  });

  describe('hasAny', () => {
    it('should delegate to PermissionCheckerImpl', () => {
      expect(hasAny(['test1', 'test2'])).toBe(false);
    });
  });

  describe('hasAll', () => {
    it('should delegate to PermissionCheckerImpl', () => {
      expect(hasAll([])).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should delegate to PermissionCheckerImpl', () => {
      expect(hasRole('admin')).toBe(false);
    });
  });

  describe('registerPagePermission', () => {
    it('should register page permission mapping', () => {
      registerPagePermission('secret-page', 'secret.access');
      expect(PermissionCheckerImpl.canAccessPage('secret-page')).toBe(false);
    });
  });
});