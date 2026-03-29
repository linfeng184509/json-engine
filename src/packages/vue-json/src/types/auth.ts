import type { Platform } from './platform';

export interface FieldPermission {
  read: boolean;
  write: boolean;
  hidden: boolean;
  privacy: boolean;
}

export interface SOPStepPermission {
  canExecute: boolean;
  canView: boolean;
  availableFields: string[];
}

export interface PermissionProvider {
  getPermissions(): string[];
  getRoles(): string[];
  getPlatform(): Platform;
  checkPermission(permission: string): boolean;
  getFieldPermission(page: string, field: string): FieldPermission;
  getSOPStepPermission(sop: string, step: string): SOPStepPermission;
}

export interface PermissionChecker {
  has(permission: string): boolean;
  hasAny(permissions: string[]): boolean;
  hasAll(permissions: string[]): boolean;
  hasRole(role: string): boolean;
  isPlatform(platform: Platform): boolean;
  canAccessPage(page: string): boolean;
}

export interface AuthDirectiveConfig {
  vAuth?: string;
  vAuthAny?: string[];
  vAuthAll?: string[];
  vAuthRole?: string;
}

export type PrivacyType = 'name' | 'phone' | 'idcard' | 'email' | 'custom';

export interface DataFilterOptions {
  privacyMask?: boolean;
  privacyType?: PrivacyType;
  customMask?: (value: string) => string;
}

export interface SOPStep {
  id: string;
  name: string;
  permissions?: string[];
  availableFields?: string[];
  nextSteps?: string[];
  conditions?: Record<string, unknown>;
}

export interface SOPConfig {
  id: string;
  name: string;
  steps: Record<string, SOPStep>;
  initialStep: string;
}

export interface PagePermission {
  page: string;
  permission: string;
  fields?: Record<string, FieldPermission>;
}