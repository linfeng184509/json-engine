import type { VueJsonPlugin } from '@json-engine/vue-json';
import { antdConfigSchema } from './config-schema';
import { createAntdFactory } from './runtime/antd-factory';
import { createAButton } from './components/Button';
import type { AntdPluginConfig } from './types';

export const antdPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-antd',
  version: '0.0.1',
  description: 'Ant Design Vue integration for vue-json',

  configSchema: antdConfigSchema,

  components: [
    {
      name: 'AButton',
      component: { render: createAButton },
    },
  ],

  runtimeExports: [
    {
      name: 'createAntdFactory',
      factory: createAntdFactory,
    },
  ],

  onInstall(context) {
    const config = context.config as AntdPluginConfig;
    console.log(`[plugin-antd] Installed with config:`, config);
  },
};

export default antdPlugin;
