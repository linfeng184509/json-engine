import {
  registerPermissionProvider,
  createStorageAdapter,
} from '@json-engine/vue-json';
import type {
  PermissionProvider,
  FieldPermission,
  SOPStepPermission,
} from '@json-engine/vue-json/types';
import {
  createCoreScope,
  setCoreScope,
} from '@json-engine/vue-json';
import type {
  CoreScope,
  CoreScopeWS,
} from '@json-engine/vue-json';

const STORAGE_PREFIX = 'ea_';

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

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const permissions = localStorage.getItem(`${STORAGE_PREFIX}permissions`);
      const roles = localStorage.getItem(`${STORAGE_PREFIX}roles`);
      const userInfo = localStorage.getItem(`${STORAGE_PREFIX}userInfo`);

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
    localStorage.setItem(`${STORAGE_PREFIX}permissions`, JSON.stringify(permissions));
  }

  setRoles(roles: string[]): void {
    this.roles = roles;
    localStorage.setItem(`${STORAGE_PREFIX}roles`, JSON.stringify(roles));
  }

  setUserInfo(userInfo: UserInfo): void {
    this.userInfo = userInfo;
    localStorage.setItem(`${STORAGE_PREFIX}userInfo`, JSON.stringify(userInfo));
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  clear(): void {
    this.permissions = [];
    this.roles = [];
    this.userInfo = null;
    localStorage.removeItem(`${STORAGE_PREFIX}permissions`);
    localStorage.removeItem(`${STORAGE_PREFIX}roles`);
    localStorage.removeItem(`${STORAGE_PREFIX}userInfo`);
    localStorage.removeItem(`${STORAGE_PREFIX}token`);
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

export function getPermissionProviderInstance(): EnterprisePermissionProvider {
  if (!permissionProviderInstance) {
    permissionProviderInstance = new EnterprisePermissionProvider();
  }
  return permissionProviderInstance;
}

let wsClient: WebSocket | null = null;
const wsHandlers: Map<string, Set<(data: unknown) => void>> = new Map();

function initWebSocket(coreScope: CoreScope): void {
  const token = localStorage.getItem(`${STORAGE_PREFIX}token`);
  if (!token) return;

  const wsUrl = `ws://localhost:8080?token=${encodeURIComponent(token)}`;
  
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
      setTimeout(() => initWebSocket(coreScope), 5000);
    };

    wsClient.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    const ws: CoreScopeWS = {
      send: (channel: string, data: unknown) => {
        if (wsClient?.readyState === WebSocket.OPEN) {
          wsClient.send(JSON.stringify({ type: channel, payload: data }));
        }
      },
      subscribe: (channel: string, handler: (data: unknown) => void) => {
        if (!wsHandlers.has(channel)) {
          wsHandlers.set(channel, new Set());
        }
        wsHandlers.get(channel)!.add(handler);
      },
      unsubscribe: (channel: string, handler: (data: unknown) => void) => {
        wsHandlers.get(channel)?.delete(handler);
      },
    };

    (coreScope as unknown as Record<string, unknown>)._ws = ws;
  } catch (error) {
    console.error('[WebSocket] Connection failed:', error);
  }
}

export function connectWebSocket(): void {
  const coreScope = createCoreScope();
  initWebSocket(coreScope);
}

export function disconnectWebSocket(): void {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
  wsHandlers.clear();
}

export function setupApp(): void {
  createStorageAdapter({ prefix: STORAGE_PREFIX, sync: true });
  
  const provider = getPermissionProviderInstance();
  registerPermissionProvider(provider);

  const coreScope = createCoreScope();
  setCoreScope(coreScope);

  const token = localStorage.getItem(`${STORAGE_PREFIX}token`);
  if (token) {
    initWebSocket(coreScope);
  }
}

export { STORAGE_PREFIX };