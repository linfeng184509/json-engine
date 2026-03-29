import type { PermissionProvider, FieldPermission, SOPStepPermission } from '../types/auth';
import type { Platform } from '../types/platform';

let globalProvider: PermissionProvider | null = null;

export const DefaultPermissionProvider: PermissionProvider = {
  getPermissions(): string[] {
    return [];
  },
  getRoles(): string[] {
    return [];
  },
  getPlatform(): Platform {
    return 'pc-browser';
  },
  checkPermission(_permission: string): boolean {
    return false;
  },
  getFieldPermission(_page: string, _field: string): FieldPermission {
    return {
      read: true,
      write: true,
      hidden: false,
      privacy: false,
    };
  },
  getSOPStepPermission(_sop: string, _step: string): SOPStepPermission {
    return {
      canExecute: false,
      canView: false,
      availableFields: [],
    };
  },
};

export function registerPermissionProvider(provider: PermissionProvider): void {
  globalProvider = provider;
}

export function getPermissionProvider(): PermissionProvider {
  return globalProvider ?? DefaultPermissionProvider;
}