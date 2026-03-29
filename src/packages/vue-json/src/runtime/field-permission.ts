import type { FieldPermission } from '../types/auth';
import { getPermissionProvider } from './permission-provider';

export function getFieldPermission(page: string, field: string): FieldPermission {
  const provider = getPermissionProvider();
  return provider.getFieldPermission(page, field);
}

export function canReadField(page: string, field: string): boolean {
  return getFieldPermission(page, field).read;
}

export function canWriteField(page: string, field: string): boolean {
  return getFieldPermission(page, field).write;
}

export function isFieldHidden(page: string, field: string): boolean {
  return getFieldPermission(page, field).hidden;
}

export function isFieldPrivate(page: string, field: string): boolean {
  return getFieldPermission(page, field).privacy;
}