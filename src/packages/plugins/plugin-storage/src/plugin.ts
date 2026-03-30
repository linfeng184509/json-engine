import type { VueJsonPlugin } from '@json-engine/vue-json';
import { storageConfigSchema } from './config-schema';
import { createStorageInstance } from './runtime/storage-factory';
import { createStorageScope } from './scope/storage-scope';
import type { StoragePluginConfig } from './types';

export const storagePlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-storage',
  version: '0.0.1',
  description: 'Storage integration for vue-json',

  configSchema: storageConfigSchema,

  scopeExtensions: [
    {
      key: '_storage',
      factory: (config: unknown) => createStorageScope(config as StoragePluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createStorageInstance',
      factory: createStorageInstance,
    },
  ],

  onInstall(context) {
    const config = context.config as StoragePluginConfig;
    console.log(`[plugin-storage] Installed with config:`, config);
  },
};

export default storagePlugin;
