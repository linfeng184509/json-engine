import type { RouterPluginConfig } from '../types';

export interface RouterInstance {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  go: (n: number) => void;
  getCurrentRoute: () => string;
}

function getHashPath(): string {
  return window.location.hash.slice(1) || '/';
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

  return {
    push,
    replace,
    back,
    forward,
    go,
    getCurrentRoute,
  };
}