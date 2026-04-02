import type { VueJsonPlugin, PluginInstallContext } from '@json-engine/vue-json'
import { registerGlobalComponents } from '@json-engine/vue-json'
import { antdConfigSchema } from './config-schema'
import { createAntdFactory } from './runtime/antd-factory'
import { getAntdComponents } from './antdComponents'
import { getAntdIconComponents } from './iconComponents'
import type { AntdPluginConfig } from './types'
import { message, notification, Modal } from 'ant-design-vue'

function createAntdScope(_config: AntdPluginConfig) {
  return {
    message,
    notification,
    modal: {
      confirm: Modal.confirm,
      info: Modal.info,
      success: Modal.success,
      error: Modal.error,
      warning: Modal.warning,
      destroyAll: Modal.destroyAll,
    },
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

    if (config.includeIcons) {
      const iconComponents = getAntdIconComponents()
      registerGlobalComponents(iconComponents)
      console.log(`[plugin-antd] Registered ${Object.keys(iconComponents).length} icon components`)
    }
  },
}

export { getAntdComponents, getAntdComponentCategories } from './antdComponents'

export default antdPlugin