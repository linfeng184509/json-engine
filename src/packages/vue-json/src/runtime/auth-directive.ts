import type { AuthDirectiveConfig } from '../types/auth';
import { has, hasAny, hasAll, hasRole } from './permission-checker';
import { getFieldPermission } from './field-permission';
import { canExecuteSOPStep, canViewSOPStep } from './sop-permission';
import { isPlatform, isMobileDevice } from './platform-detector';
import type { Platform } from '../types/platform';

export interface DirectiveContext {
  visible: boolean;
  readOnly?: boolean;
  reason?: string;
}

export function checkPermissionDirective(config: string | AuthDirectiveConfig): DirectiveContext {
  if (typeof config === 'string') {
    return checkSimplePermission(config);
  }

  return checkComplexPermission(config);
}

function checkSimplePermission(permission: string): DirectiveContext {
  if (has(permission)) {
    return { visible: true };
  }
  return { visible: false, reason: `Missing permission: ${permission}` };
}

function checkComplexPermission(config: AuthDirectiveConfig): DirectiveContext {
  if (config.vAuth) {
    if (!has(config.vAuth)) {
      return { visible: false, reason: `Missing permission: ${config.vAuth}` };
    }
  }

  if (config.vAuthAny && config.vAuthAny.length > 0) {
    if (!hasAny(config.vAuthAny)) {
      return { visible: false, reason: `Missing any permission: ${config.vAuthAny.join(', ')}` };
    }
  }

  if (config.vAuthAll && config.vAuthAll.length > 0) {
    if (!hasAll(config.vAuthAll)) {
      return { visible: false, reason: `Missing all permissions: ${config.vAuthAll.join(', ')}` };
    }
  }

  if (config.vAuthRole && !hasRole(config.vAuthRole)) {
    return { visible: false, reason: `Missing role: ${config.vAuthRole}` };
  }

  return { visible: true };
}

export function checkPlatformDirective(
  platform: Platform | Platform[] | { exclude?: Platform | Platform[] }
): DirectiveContext {
  if (typeof platform === 'string') {
    if (isPlatform(platform)) {
      return { visible: true };
    }
    return { visible: false, reason: `Platform mismatch: expected ${platform}` };
  }

  if (Array.isArray(platform)) {
    const currentPlatform = getCurrentPlatform();
    if (platform.includes(currentPlatform)) {
      return { visible: true };
    }
    return { visible: false, reason: `Platform not in allowed list: ${platform.join(', ')}` };
  }

  if ('exclude' in platform && platform.exclude) {
    const exclude = platform.exclude;
    const currentPlatform = getCurrentPlatform();
    if (Array.isArray(exclude)) {
      if (exclude.includes(currentPlatform)) {
        return { visible: false, reason: `Platform excluded: ${currentPlatform}` };
      }
    } else {
      if (exclude === currentPlatform) {
        return { visible: false, reason: `Platform excluded: ${currentPlatform}` };
      }
    }
  }

  return { visible: true };
}

export function checkFieldPermissionDirective(
  page: string,
  field: string,
  mode: 'read' | 'write' = 'read'
): DirectiveContext {
  const permission = getFieldPermission(page, field);

  if (mode === 'read') {
    if (!permission.read) {
      return { visible: false, reason: `No read permission for field: ${field}` };
    }
    if (permission.hidden) {
      return { visible: false, reason: `Field is hidden: ${field}` };
    }
  }

  if (mode === 'write') {
    if (!permission.write) {
      return { visible: false, readOnly: true, reason: `No write permission for field: ${field}` };
    }
  }

  return { visible: true };
}

export function checkSOPPermissionDirective(
  sop: string,
  step: string,
  mode: 'execute' | 'view' = 'view'
): DirectiveContext {
  if (mode === 'execute') {
    if (!canExecuteSOPStep(sop, step)) {
      return { visible: false, reason: `Cannot execute SOP step: ${sop}/${step}` };
    }
  }

  if (mode === 'view') {
    if (!canViewSOPStep(sop, step)) {
      return { visible: false, reason: `Cannot view SOP step: ${sop}/${step}` };
    }
  }

  return { visible: true };
}

function getCurrentPlatform(): Platform {
  if (typeof navigator !== 'undefined' && navigator.platform) {
    if (/mobile|pda|android|iphone/i.test(navigator.platform)) {
      if (typeof screen !== 'undefined' && screen.width < 480) {
        return 'pda';
      }
      return 'pad';
    }
  }
  return isMobileDevice() ? 'pad' : 'pc-browser';
}