import type { PiniaPluginConfig, CoreScopeStore } from '../types';
import { createPiniaInstance } from '../runtime/pinia-factory';

export function createPiniaScope(config: PiniaPluginConfig): CoreScopeStore {
  const pinia = createPiniaInstance(config);

  return {
    $store: new Map(),
    useStore: pinia.useStore,
    registerStore: pinia.registerStore,
  };
}
