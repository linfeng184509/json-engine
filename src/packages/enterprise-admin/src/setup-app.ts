import {
  registerPermissionProvider,
  createCoreScope,
  setCoreScope,
  registerPagePermission,
  getPluginRegistry,
} from '@json-engine/vue-json';
import type {
  PermissionProvider,
  FieldPermission,
  SOPStepPermission,
  VueJsonAppSchema,
} from '@json-engine/vue-json';

import { axiosPlugin } from '@json-engine/plugin-axios';
import { antdPlugin } from '@json-engine/plugin-antd';
import { routerPlugin } from '@json-engine/plugin-router';
import { websocketPlugin } from '@json-engine/plugin-websocket';
import { storagePlugin } from '@json-engine/plugin-storage';
import { authPlugin } from '@json-engine/plugin-auth';
import { i18nPlugin } from '@json-engine/plugin-i18n';

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
}

class EnterprisePermissionProvider implements PermissionProvider {
  private permissions: string[] = [];
  private roles: string[] = [];
  private userInfo: UserInfo | null = null;
  private storagePrefix: string;

  constructor(storagePrefix: string = 'ea_') {
    this.storagePrefix = storagePrefix;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const permissions = localStorage.getItem(`${this.storagePrefix}permissions`);
      const roles = localStorage.getItem(`${this.storagePrefix}roles`);
      const userInfo = localStorage.getItem(`${this.storagePrefix}userInfo`);

      this.permissions = permissions ? JSON.parse(permissions) : [];
      this.roles = roles ? JSON.parse(roles) : [];
      this.userInfo = userInfo ? JSON.parse(userInfo) : null;
    } catch {
      this.permissions = [];
      this.roles = [];
      this.userInfo = null;
    }
  }

  setPermissions(permissions: string[]): void {
    this.permissions = permissions;
    localStorage.setItem(`${this.storagePrefix}permissions`, JSON.stringify(permissions));
  }

  setRoles(roles: string[]): void {
    this.roles = roles;
    localStorage.setItem(`${this.storagePrefix}roles`, JSON.stringify(roles));
  }

  setUserInfo(userInfo: UserInfo): void {
    this.userInfo = userInfo;
    localStorage.setItem(`${this.storagePrefix}userInfo`, JSON.stringify(userInfo));
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  clear(): void {
    this.permissions = [];
    this.roles = [];
    this.userInfo = null;
    localStorage.removeItem(`${this.storagePrefix}permissions`);
    localStorage.removeItem(`${this.storagePrefix}roles`);
    localStorage.removeItem(`${this.storagePrefix}userInfo`);
    localStorage.removeItem(`${this.storagePrefix}token`);
  }

  getPermissions(): string[] {
    this.loadFromStorage();
    return this.permissions;
  }

  getRoles(): string[] {
    this.loadFromStorage();
    return this.roles;
  }

  getPlatform(): 'pc-browser' {
    return 'pc-browser';
  }

  checkPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  getFieldPermission(_page: string, _field: string): FieldPermission {
    return {
      read: true,
      write: true,
      hidden: false,
      privacy: false,
    };
  }

  getSOPStepPermission(_sop: string, _step: string): SOPStepPermission {
    return {
      canExecute: true,
      canView: true,
      availableFields: [],
    };
  }
}

let permissionProviderInstance: EnterprisePermissionProvider | null = null;
let storagePrefix: string = 'ea_';

export function getPermissionProviderInstance(): EnterprisePermissionProvider {
  if (!permissionProviderInstance) {
    permissionProviderInstance = new EnterprisePermissionProvider(storagePrefix);
  }
  return permissionProviderInstance;
}

export function getStoragePrefix(): string {
  return storagePrefix;
}

export async function setupApp(schema: VueJsonAppSchema): Promise<void> {
  const config = schema.config || {};
  storagePrefix = (config.storage as { prefix?: string })?.prefix || 'ea_';

  const registry = getPluginRegistry();

  registry.register(axiosPlugin);
  registry.register(antdPlugin);
  registry.register(routerPlugin);
  registry.register(websocketPlugin);
  registry.register(storagePlugin);
  registry.register(authPlugin);
  registry.register(i18nPlugin);

  if (schema.plugins) {
    await registry.installFromSchema(schema.plugins, config as Record<string, unknown>);
  }

  permissionProviderInstance = new EnterprisePermissionProvider(storagePrefix);
  registerPermissionProvider(permissionProviderInstance);

  if (config.auth && typeof config.auth === 'object' && 'pagePermissions' in config.auth) {
    const pagePerms = (config.auth as { pagePermissions?: Record<string, string> }).pagePermissions;
    if (pagePerms) {
      for (const [path, perm] of Object.entries(pagePerms)) {
        registerPagePermission(path, perm);
      }
    }
  }

  const scopeExtensions = registry.getScopeExtensions();
  const coreScope = createCoreScope();

  Object.assign(coreScope, scopeExtensions);

  setCoreScope(coreScope);

  console.log('[setupApp] Plugins installed:', registry.getInstalledPlugins().map((p) => p.definition.name));
}