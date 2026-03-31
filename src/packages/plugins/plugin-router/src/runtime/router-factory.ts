import type { RouterPluginConfig, RouteDefinition, MatchedRoute } from '../types';

export interface RouterInstance {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  go: (n: number) => void;
  getCurrentRoute: () => string;
  getMatchedRoute: () => MatchedRoute | null;
}

function getHashPath(): string {
  return window.location.hash.slice(1) || '/';
}

function matchRoute(path: string, routes: RouteDefinition[]): MatchedRoute | null {
  const cleanPath = path.split('?')[0] || '/';

  for (const route of routes) {
    if (route.path === cleanPath) {
      return {
        path: cleanPath,
        route,
        params: {},
      };
    }

    if (route.children && route.children.length > 0) {
      const childPath = cleanPath.startsWith(route.path)
        ? cleanPath.slice(route.path.length) || '/'
        : null;

      if (childPath !== null) {
        const childMatch = matchRoute(childPath, route.children);
        if (childMatch) {
          return {
            path: cleanPath,
            route,
            params: {},
            children: [childMatch],
          };
        }
      }
    }
  }

  for (const route of routes) {
    if (route.path === '/:pathMatch(.*)*') {
      return {
        path: cleanPath,
        route,
        params: { pathMatch: cleanPath },
      };
    }
  }

  return null;
}

export function createRouterInstance(config: RouterPluginConfig): RouterInstance {
  const mode = config.mode || 'hash';

  const push = (path: string) => {
    if (mode === 'hash') {
      window.location.hash = path;
    } else {
      window.history.pushState({}, '', path);
    }
  };

  const replace = (path: string) => {
    if (mode === 'hash') {
      window.location.replace(`#${path}`);
    } else {
      window.history.replaceState({}, '', path);
    }
  };

  const back = () => {
    window.history.back();
  };

  const forward = () => {
    window.history.forward();
  };

  const go = (n: number) => {
    window.history.go(n);
  };

  const getCurrentRoute = () => {
    if (mode === 'hash') {
      return getHashPath();
    }
    return window.location.pathname;
  };

  const getMatchedRoute = (): MatchedRoute | null => {
    const currentPath = getCurrentRoute();
    const routes = (window as any).__APP_ROUTES__ || [];
    return matchRoute(currentPath, routes);
  };

  return {
    push,
    replace,
    back,
    forward,
    go,
    getCurrentRoute,
    getMatchedRoute,
  };
}