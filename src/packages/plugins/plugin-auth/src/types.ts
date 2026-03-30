export interface AuthPluginConfig {
  permissionProvider?: unknown;
  pagePermissions?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface CoreScopeAuth {
  user: User | null;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  login: (credentials: unknown) => Promise<User | null>;
  logout: () => void;
}
