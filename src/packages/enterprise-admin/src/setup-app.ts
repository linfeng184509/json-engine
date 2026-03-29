import {
  registerPermissionProvider,
  createStorageAdapter,
  createCoreScope,
  setCoreScope,
  registerPagePermission,
} from '@json-engine/vue-json';
import type {
  PermissionProvider,
  FieldPermission,
  SOPStepPermission,
  VueJsonAppSchema,
  StorageConfig,
  WSConfig,
} from '@json-engine/vue-json';

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
let wsClient: WebSocket | null = null;
const wsHandlers: Map<string, Set<(data: unknown) => void>> = new Map();
let storagePrefix: string = 'ea_';

export function getPermissionProviderInstance(): EnterprisePermissionProvider {
  if (!permissionProviderInstance) {
    permissionProviderInstance = new EnterprisePermissionProvider(storagePrefix);
  }
  return permissionProviderInstance;
}

function initWebSocket(wsConfig: WSConfig, coreScope: VueJsonAppSchema): void {
  const token = localStorage.getItem(`${storagePrefix}token`);
  if (!token) return;

  const wsUrl = `${wsConfig.url}?token=${encodeURIComponent(token)}`;

  try {
    wsClient = new WebSocket(wsUrl);

    wsClient.onopen = () => {
      console.log('[WebSocket] Connected');
    };

    wsClient.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        const handlers = wsHandlers.get(type);
        if (handlers) {
          handlers.forEach(handler => handler(payload));
        }

        if (type === 'auth:kick') {
          getPermissionProviderInstance().clear();
          window.location.hash = '#/login';
          alert('您已在其他设备登录，当前会话已失效');
        }

        if (type === 'heartbeat') {
          wsClient?.send(JSON.stringify({ type: 'heartbeat:ack' }));
        }
      } catch (error) {
        console.error('[WebSocket] Message parse error:', error);
      }
    };

    wsClient.onclose = () => {
      console.log('[WebSocket] Disconnected');
      if (wsConfig.autoReconnect) {
        setTimeout(() => initWebSocket(wsConfig, coreScope), wsConfig.reconnectInterval || 5000);
      }
    };

    wsClient.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };
  } catch (error) {
    console.error('[WebSocket] Connection failed:', error);
  }
}

export function connectWebSocket(): void {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
  wsHandlers.clear();
}

export function disconnectWebSocket(): void {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
  wsHandlers.clear();
}

export function getStoragePrefix(): string {
  return storagePrefix;
}

export function setupApp(schema: VueJsonAppSchema): void {
  const storageConfig: StorageConfig = schema.storage || { prefix: 'ea_', sync: true };
  storagePrefix = storageConfig.prefix || 'ea_';

  createStorageAdapter(storageConfig);

  permissionProviderInstance = new EnterprisePermissionProvider(storagePrefix);
  registerPermissionProvider(permissionProviderInstance);

  if (schema.auth?.pagePermissions) {
    for (const [path, perm] of Object.entries(schema.auth.pagePermissions)) {
      registerPagePermission(path, perm as string);
    }
  }

  const coreScope = createCoreScope();
  setCoreScope(coreScope);

  const wsConfigs = schema.network?.websocket;
  if (wsConfigs && wsConfigs.length > 0) {
    const token = localStorage.getItem(`${storagePrefix}token`);
    if (token) {
      initWebSocket(wsConfigs[0], schema);
    }
  }
}