import type { VueJsonPlugin } from '@json-engine/vue-json';
import { authConfigSchema } from './config-schema';
import { createAuthInstance } from './runtime/auth-factory';
import { createAuthScope } from './scope/auth-scope';
import type { AuthPluginConfig } from './types';

export const authPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-auth',
  version: '0.0.1',
  description: 'Authentication and authorization for vue-json',

  configSchema: authConfigSchema,

  scopeExtensions: [
    {
      key: '_auth',
      factory: (config: unknown) => createAuthScope(config as AuthPluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createAuthInstance',
      factory: createAuthInstance,
    },
  ],

  onInstall(context) {
    const config = context.config as AuthPluginConfig;
    console.log(`[plugin-auth] Installed with config:`, config);
  },
};

export default authPlugin;
