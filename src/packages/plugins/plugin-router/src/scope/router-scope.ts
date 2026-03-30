import type { RouterPluginConfig, CoreScopeRouter } from '../types';
import { createRouterInstance } from '../runtime/router-factory';

export function createRouterScope(config: RouterPluginConfig): CoreScopeRouter {
  const router = createRouterInstance(config);
  return {
    push: router.push,
    replace: router.replace,
    back: router.back,
    forward: router.forward,
    go: router.go,
    getCurrentRoute: router.getCurrentRoute,
  };
}
