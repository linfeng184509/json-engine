import type {
  RouterConfig,
  Router,
  RouteConfig,
  NavigationGuard,
  RouteLocationNormalized,
  NavigationResult,
} from '../types/router';
import { has } from './permission-checker';

type GuardCallback = (to?: string | RouteLocationNormalized | null) => void;

export function createRouter(config: RouterConfig): Router {
  const routes = flattenRoutes(config.routes);
  const guards = config.guards;

  let currentPath = '/';
  const listeners: Array<(to: RouteLocationNormalized, from: RouteLocationNormalized) => void> = [];

  const router: Router = {
    install(_app: unknown): void {
      if (guards?.beforeEach) {
        router.beforeResolve(guards.beforeEach);
      }
      if (guards?.afterEach) {
        router.afterEach(guards.afterEach);
      }
    },

    push(to: string | RouteLocationNormalized): Promise<NavigationResult> {
      const path = typeof to === 'string' ? to : to.path;
      return navigateTo(path, false);
    },

    replace(to: string | RouteLocationNormalized): Promise<NavigationResult> {
      const path = typeof to === 'string' ? to : to.path;
      return navigateTo(path, true);
    },

    back(): void {
      window.history.back();
    },

    forward(): void {
      window.history.forward();
    },

    go(delta: number): void {
      window.history.go(delta);
    },

    beforeResolve(guard: NavigationGuard): () => void {
      const wrapper: NavigationGuard = (to, from, next) => {
        guard(to, from, (dest) => {
          executeGuards(to, from, next as GuardCallback, dest);
        });
      };
      listeners.push(wrapper as (to: RouteLocationNormalized, from: RouteLocationNormalized) => void);
      return () => {
        const idx = listeners.indexOf(wrapper as (to: RouteLocationNormalized, from: RouteLocationNormalized) => void);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },

    afterEach(guard: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void): () => void {
      listeners.push(guard);
      return () => {
        const idx = listeners.indexOf(guard);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },

    onError(_handler: (error: unknown) => void): () => void {
      return () => {};
    },
  };

  async function navigateTo(path: string, replace: boolean): Promise<NavigationResult> {
    const route = matchRoute(path);
    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }

    const from = createRouteLocation(currentPath);
    const to = createRouteLocation(path);

    if (route.meta?.requiresAuth) {
      const permissions = route.meta?.permissions || [];
      const hasPermission = permissions.length === 0 || permissions.some(p => has(p));
      if (!hasPermission) {
        throw new Error('Unauthorized');
      }
    }

    if (guards?.beforeEach) {
      await new Promise<void>((resolve) => {
        guards.beforeEach!(to, from, (dest) => {
          if (dest) {
            resolve();
          }
        });
      });
    }

    for (const listener of listeners) {
      listener(to, from);
    }

    currentPath = path;

    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }

    return undefined;
  }

  function matchRoute(path: string): RouteConfig | undefined {
    return routes.find(r => r.path === path);
  }

  function createRouteLocation(path: string): RouteLocationNormalized {
    return {
      path,
      params: {},
      query: {},
      hash: '',
      fullPath: path,
      matched: [],
      meta: {},
    };
  }

  async function executeGuards(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: GuardCallback,
    dest?: string | RouteLocationNormalized | null
  ): Promise<void> {
    if (dest === null) {
      next(null);
      return;
    }
    if (typeof dest === 'string') {
      next({ path: dest } as RouteLocationNormalized);
      return;
    }
    if (dest) {
      next(dest);
      return;
    }
    next({ path: to.path } as RouteLocationNormalized);
  }

  return router;
}

function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = [];
  for (const route of routes) {
    result.push(route);
    if (route.children) {
      result.push(...flattenRoutes(route.children));
    }
  }
  return result;
}

export function registerRoutes(_routes: RouteConfig[]): void {
  // Dynamic route registration would require store management
}

export function addRouteGuard(_guard: NavigationGuard): void {
  // Route guards are added during createRouter
}