import type { PermissionChecker } from '../types/auth';
import type { Platform } from '../types/platform';
import { getPermissionProvider } from './permission-provider';

const pagePermissionMap: Record<string, string> = {};

export function registerPagePermission(page: string, permission: string): void {
  pagePermissionMap[page] = permission;
}

export const PermissionCheckerImpl: PermissionChecker = {
  has(permission: string): boolean {
    const provider = getPermissionProvider();
    return provider.checkPermission(permission);
  },

  hasAny(permissions: string[]): boolean {
    if (permissions.length === 0) return false;
    return permissions.some(p => PermissionCheckerImpl.has(p));
  },

  hasAll(permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.every(p => PermissionCheckerImpl.has(p));
  },

  hasRole(role: string): boolean {
    const provider = getPermissionProvider();
    return provider.getRoles().includes(role);
  },

  isPlatform(platform: Platform): boolean {
    const provider = getPermissionProvider();
    return provider.getPlatform() === platform;
  },

  canAccessPage(page: string): boolean {
    const permission = pagePermissionMap[page];
    if (!permission) return true;
    return PermissionCheckerImpl.has(permission);
  },
};

export function has(permission: string): boolean {
  return PermissionCheckerImpl.has(permission);
}

export function hasAny(permissions: string[]): boolean {
  return PermissionCheckerImpl.hasAny(permissions);
}

export function hasAll(permissions: string[]): boolean {
  return PermissionCheckerImpl.hasAll(permissions);
}

export function hasRole(role: string): boolean {
  return PermissionCheckerImpl.hasRole(role);
}

export function canAccessPage(page: string): boolean {
  return PermissionCheckerImpl.canAccessPage(page);
}