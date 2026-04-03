import {
  loadAndInstallPlugins,
  createCoreScope,
  setCoreScope,
  getPluginRegistry,
} from '@json-engine/vue-json';
import type { VueJsonAppSchema, VueJsonPlugin } from '@json-engine/vue-json';

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

  setCoreScope(coreScope);
}