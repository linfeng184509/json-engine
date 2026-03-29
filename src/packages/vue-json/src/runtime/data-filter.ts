import type { FieldPermission, PrivacyType } from '../types/auth';

export function maskName(name: string): string {
  if (!name || name.length < 2) return '*';
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 1);
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 7) return '*'.repeat(phone.length);
  const visible = phone.slice(-4);
  const masked = '*'.repeat(phone.length - 4);
  return masked + visible;
}

export function maskIdCard(idCard: string): string {
  if (idCard.length < 8) return '*'.repeat(idCard.length);
  const visible = idCard.slice(-4);
  const masked = '*'.repeat(idCard.length - 4);
  return masked + visible;
}

export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '*';
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex);
  if (localPart.length <= 2) return '*'.repeat(localPart.length) + domainPart;
  return localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1] + domainPart;
}

export function applyPrivacyMask(value: unknown, privacyType: PrivacyType): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  switch (privacyType) {
    case 'name': return maskName(str);
    case 'phone': return maskPhone(str);
    case 'idcard': return maskIdCard(str);
    case 'email': return maskEmail(str);
    case 'custom': return '*'.repeat(str.length);
    default: return '*'.repeat(str.length);
  }
}

export function filterData<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
  permissions: Record<string, FieldPermission>
): Partial<T> {
  const result: Partial<T> = {};
  for (const field of fields) {
    const permission = permissions[field];
    if (!permission) {
      result[field as keyof T] = data[field as keyof T];
      continue;
    }
    if (permission.hidden) continue;
    if (!permission.read) continue;
    result[field as keyof T] = data[field as keyof T];
  }
  return result;
}

export function filterDataWithPrivacy<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
  permissions: Record<string, FieldPermission>,
  privacyTypeMap?: Record<string, PrivacyType>
): Partial<T> {
  const result: Partial<T> = {};
  for (const field of fields) {
    const permission = permissions[field];
    if (!permission) {
      result[field as keyof T] = data[field as keyof T];
      continue;
    }
    if (permission.hidden) continue;
    if (!permission.read) continue;
    const value = data[field as keyof T];
    if (permission.privacy && privacyTypeMap?.[field]) {
      result[field as keyof T] = applyPrivacyMask(value, privacyTypeMap[field]) as T[keyof T];
    } else {
      result[field as keyof T] = value;
    }
  }
  return result;
}