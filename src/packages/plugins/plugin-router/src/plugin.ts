import type { VueJsonPlugin, PluginInstallContext } from '@json-engine/vue-json';
import { routerConfigSchema } from './config-schema';
import { createRouterInstance } from './runtime/router-factory';
import { createRouterScope } from './scope/router-scope';
import type { RouterPluginConfig } from './types';

export const routerPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-router',
  version: '0.0.1',
  description: 'Vue Router integration for vue-json',

  configSchema: routerConfigSchema,

  scopeExtensions: [
    {
      key: '_router',
      factory: (config: unknown) => createRouterScope(config as RouterPluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createRouterInstance',
      factory: createRouterInstance,
    },
  ],

  onInstall(context: PluginInstallContext) {
    const config = context.config as RouterPluginConfig;
    console.log(`[plugin-router] Installed with config:`, config);
  },
};

export default routerPlugin;
