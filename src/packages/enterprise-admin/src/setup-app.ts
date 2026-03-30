import {
  createCoreScope,
  setCoreScope,
  getPluginRegistry,
} from '@json-engine/vue-json';
import type { VueJsonAppSchema } from '@json-engine/vue-json';

import { axiosPlugin } from '@json-engine/plugin-axios';
import { antdPlugin } from '@json-engine/plugin-antd';
import { routerPlugin } from '@json-engine/plugin-router';
import { websocketPlugin } from '@json-engine/plugin-websocket';
import { storagePlugin } from '@json-engine/plugin-storage';
import { authPlugin } from '@json-engine/plugin-auth';
import { i18nPlugin } from '@json-engine/plugin-i18n';

let storagePrefix: string = 'ea_';

export function getStoragePrefix(): string {
  return storagePrefix;
}

export async function setupApp(schema: VueJsonAppSchema): Promise<void> {
  const config = schema.config || {};
  storagePrefix = (config.storage as { prefix?: string })?.prefix || 'ea_';

  const registry = getPluginRegistry();

  registry.register(axiosPlugin);
  registry.register(antdPlugin);
  registry.register(routerPlugin);
  registry.register(websocketPlugin);
  registry.register(storagePlugin);
  registry.register(authPlugin);
  registry.register(i18nPlugin);

  if (schema.plugins) {
    await registry.installFromSchema(schema.plugins, config as Record<string, unknown>);
  }

  const scopeExtensions = registry.getScopeExtensions();
  const coreScope = createCoreScope();

  Object.assign(coreScope, scopeExtensions);

  setCoreScope(coreScope);

  console.log('[setupApp] Plugins installed:', registry.getInstalledPlugins().map((p) => p.definition.name));
}