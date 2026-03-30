import type { VueJsonPlugin } from '@json-engine/vue-json';
import { axiosConfigSchema } from './config-schema';
import { createApiCallParser } from './parser/api-parser';
import { createAxiosInstance } from './runtime/axios-factory';
import type { AxiosPluginConfig } from './types';

export const axiosPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-axios',
  version: '0.0.1',
  description: 'HTTP client integration for vue-json',

  configSchema: axiosConfigSchema,

  valueTypes: [
    {
      typeName: 'api-call',
      parser: createApiCallParser(),
      requiresBody: true,
    },
  ],

  runtimeExports: [
    {
      name: 'createAxiosInstance',
      factory: createAxiosInstance,
    },
  ],

  onInstall(context) {
    const config = context.config as AxiosPluginConfig;
    console.log(`[plugin-axios] Installed with config:`, config);
  },
};

export default axiosPlugin;
