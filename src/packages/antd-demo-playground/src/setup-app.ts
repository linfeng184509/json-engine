import {
  loadAndInstallPlugins,
  createCoreScope,
  setCoreScope,
  getPluginRegistry,
  getSchemaLoader,
} from '@json-engine/vue-json';
import type { VueJsonAppSchema, VueJsonPlugin, CoreScope } from '@json-engine/vue-json';
import { hasSchema, loadSchema } from './schema-registry';

const pluginLoaders: Record<string, () => Promise<VueJsonPlugin>> = {
  '@json-engine/plugin-antd': () => import('@json-engine/plugin-antd').then((m) => m.default),
  '@json-engine/plugin-router': () => import('@json-engine/plugin-router').then((m) => m.default),
};

export async function setupApp(schema: VueJsonAppSchema): Promise<void> {
  const config = schema.config || {};

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
}