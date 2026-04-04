import {
  loadAndInstallPlugins,
  createCoreScope,
  setCoreScope,
  getPluginRegistry,
  getSchemaLoader,
} from '@json-engine/vue-json';
import type { VueJsonAppSchema, VueJsonPlugin, CoreScope } from '@json-engine/vue-json';
import { hasSchema, loadSchema } from './schema-registry';

let storagePrefix: string = 'ea_';

export function getStoragePrefix(): string {
  return storagePrefix;
}

const pluginLoaders: Record<string, () => Promise<VueJsonPlugin>> = {
  '@json-engine/plugin-axios': () => import('@json-engine/plugin-axios').then((m) => m.default),
  '@json-engine/plugin-antd': () => import('@json-engine/plugin-antd').then((m) => m.default),
  '@json-engine/plugin-router': () => import('@json-engine/plugin-router').then((m) => m.default),
  '@json-engine/plugin-websocket': () => import('@json-engine/plugin-websocket').then((m) => m.default),
  '@json-engine/plugin-storage': () => import('@json-engine/plugin-storage').then((m) => m.default),
  '@json-engine/plugin-auth': () => import('@json-engine/plugin-auth').then((m) => m.default),
  '@json-engine/plugin-i18n': () => import('@json-engine/plugin-i18n').then((m) => m.default),
  '@json-engine/plugin-echarts': () => import('@json-engine/plugin-echarts').then((m) => m.default),
};

export async function setupApp(schema: VueJsonAppSchema): Promise<void> {
  const config = schema.config || {};
  storagePrefix = (config.storage as { prefix?: string })?.prefix || 'ea_';

  if (schema.plugins) {
    await loadAndInstallPlugins(schema.plugins, config as Record<string, unknown>, pluginLoaders);
  }

  const scopeExtensions = getPluginRegistry().getScopeExtensions();
  const coreScope = createCoreScope();

  Object.assign(coreScope, scopeExtensions);

  const schemaLoader = getSchemaLoader();
  schemaLoader.setRegistryLoader(async (path: string) => {
    if (hasSchema(path)) {
      return loadSchema(path);
    }
    const response = await fetch(path);
    return response.json();
  });

  (coreScope as CoreScope & { getCachedJsonText: (path: string) => string | null }).getCachedJsonText = (path: string) => {
    return schemaLoader.getCachedJsonText(path);
  };

  setCoreScope(coreScope);

  console.log('[setupApp] Plugins installed:', getPluginRegistry().getInstalledPlugins().map((p) => p.definition.name));
}