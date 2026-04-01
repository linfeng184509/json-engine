import type { VueJsonPlugin, PluginInstallContext } from '@json-engine/vue-json'
import { registerGlobalComponents } from '@json-engine/vue-json'
import { antdConfigSchema } from './config-schema'
import { createAntdFactory } from './runtime/antd-factory'
import { getAntdComponents } from './antdComponents'
import type { AntdPluginConfig } from './types'
import { message, notification } from 'ant-design-vue'

function createAntdScope(_config: AntdPluginConfig) {
  return {
    message,
    notification,
  }
}

export const antdPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-antd',
  version: '0.0.1',
  description: 'Ant Design Vue integration for vue-json',

  configSchema: antdConfigSchema,

  scopeExtensions: [
    {
      key: '_antd',
      factory: (config: unknown) => createAntdScope(config as AntdPluginConfig),
    },
  ],

  runtimeExports: [
    {
      name: 'createAntdFactory',
      factory: createAntdFactory,
    },
  ],

  onInstall(context: PluginInstallContext) {
    const config = context.config as AntdPluginConfig
    console.log(`[plugin-antd] Installing with config:`, config)

    const allComponents = getAntdComponents()
    registerGlobalComponents(allComponents)
    console.log(`[plugin-antd] Registered ${Object.keys(allComponents).length} components`)
  },
}

export { getAntdComponents, getAntdComponentCategories } from './antdComponents'

export default antdPlugin