import type { AuthPluginConfig, User } from '../types';

export interface AuthInstance {
  login: (credentials: unknown) => Promise<User>;
  logout: () => void;
  getUser: () => User | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export function createAuthInstance(_config: AuthPluginConfig): AuthInstance {
  let currentUser: User | null = null;

  const login = async (credentials: unknown): Promise<User> => {
    console.log('[auth] Logging in with:', credentials);
    currentUser = {
      id: '1',
      name: 'User',
      roles: ['user'],
      permissions: ['read', 'write'],
    };
    return currentUser;
  };

  const logout = () => {
    console.log('[auth] Logging out');
    currentUser = null;
  };

  const getUser = () => currentUser;

  const hasPermission = (permission: string) => {
    return currentUser?.permissions.includes(permission) ?? false;
  };

  const hasRole = (role: string) => {
    return currentUser?.roles.includes(role) ?? false;
  };

  return { login, logout, getUser, hasPermission, hasRole };
}
