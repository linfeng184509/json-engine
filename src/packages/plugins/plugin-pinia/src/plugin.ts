import type { VueJsonPlugin } from '@json-engine/vue-json';
import { piniaConfigSchema } from './config-schema';
import { createPiniaInstance } from './runtime/pinia-factory';
import { createPiniaScope } from './scope/pinia-scope';
import type { PiniaPluginConfig } from './types';

export const piniaPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-pinia',
  version: '0.0.1',
  description: 'Pinia integration for vue-json',

  configSchema: piniaConfigSchema,

  scopeExtensions: [
    {
      key: '_pinia',
      factory: (config: unknown) => createPiniaScope(config as PiniaPluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createPiniaInstance',
      factory: createPiniaInstance,
    },
  ],

  onInstall(context) {
    const config = context.config as PiniaPluginConfig;
    console.log(`[plugin-pinia] Installed with config:`, config);
  },
};

export default piniaPlugin;
