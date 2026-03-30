import type { VueJsonPlugin } from '@json-engine/vue-json';
import { i18nConfigSchema } from './config-schema';
import { createI18nInstance } from './runtime/i18n-factory';
import { createI18nScope } from './scope/i18n-scope';
import type { I18nPluginConfig } from './types';

export const i18nPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-i18n',
  version: '0.0.1',
  description: 'Internationalization for vue-json',

  configSchema: i18nConfigSchema,

  scopeExtensions: [
    {
      key: '_i18n',
      factory: (config: unknown) => createI18nScope(config as I18nPluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createI18nInstance',
      factory: createI18nInstance,
    },
  ],

  onInstall(context) {
    const config = context.config as I18nPluginConfig;
    console.log(`[plugin-i18n] Installed with config:`, config);
  },
};

export default i18nPlugin;
