import type { AuthPluginConfig, CoreScopeAuth } from '../types';
import { createAuthInstance } from '../runtime/auth-factory';

export function createAuthScope(config: AuthPluginConfig): CoreScopeAuth {
  const auth = createAuthInstance(config);

  return {
    get user() {
      return auth.getUser();
    },
    isAuthenticated: () => auth.getUser() !== null,
    hasPermission: auth.hasPermission,
    hasRole: auth.hasRole,
    login: auth.login,
    logout: auth.logout,
  };
}
