import type { VueJsonPlugin } from '@json-engine/vue-json';
import { websocketConfigSchema } from './config-schema';
import { createWebSocketInstance } from './runtime/websocket-factory';
import { createWSScope } from './scope/ws-scope';
import type { WebSocketPluginConfig } from './types';

export const websocketPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-websocket',
  version: '0.0.1',
  description: 'WebSocket integration for vue-json',

  configSchema: websocketConfigSchema,

  scopeExtensions: [
    {
      key: '_ws',
      factory: (config: unknown) => createWSScope(config as WebSocketPluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createWebSocketInstance',
      factory: createWebSocketInstance,
    },
  ],

  onInstall(context) {
    const config = context.config as WebSocketPluginConfig;
    console.log(`[plugin-websocket] Installed with config:`, config);
  },
};

export default websocketPlugin;
