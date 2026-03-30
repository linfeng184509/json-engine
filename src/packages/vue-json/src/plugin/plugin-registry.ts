import type { RegisteredPlugin, VueJsonPlugin } from '../types/plugin.definitions';

export interface PluginRegistryOptions {
  coreVersion: string;
}

export class PluginRegistry {
  private plugins: Map<string, RegisteredPlugin> = new Map();
  private coreVersion: string;
  private scopeExtensions: Map<string, unknown> = new Map();
  private components: Map<string, unknown> = new Map();
  private valueTypes: Map<string, unknown> = new Map();
  private runtimeExports: Map<string, (...args: unknown[]) => unknown> = new Map();

  constructor(options: PluginRegistryOptions) {
    this.coreVersion = options.coreVersion;
  }

  /**
   * 注册插件
   */
  register(plugin: VueJsonPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginRegistry] Plugin ${plugin.name} already registered`);
      return;
    }

    this.validateVersion(plugin.version);

    this.plugins.set(plugin.name, {
      definition: plugin,
      installed: false,
      version: plugin.version,
    });
  }

  /**
   * 从 Schema 声明安装插件
   */
  async installFromSchema(
    declarations: { name: string; version?: string }[],
    config: Record<string, unknown>
  ): Promise<void> {
    for (const decl of declarations) {
      const registered = this.plugins.get(decl.name);
      if (!registered) {
        throw new Error(`[PluginRegistry] Unknown plugin: ${decl.name}`);
      }

      if (registered.installed) {
        continue;
      }

      const pluginConfig = this.getPluginConfig(decl.name, config);
      await this.install(decl.name, pluginConfig);
    }
  }

  /**
   * 安装单个插件
   */
  private async install(name: string, config: unknown): Promise<void> {
    const registered = this.plugins.get(name);
    if (!registered || registered.installed) {
      return;
    }

    const { definition } = registered;

    this.checkPeerDependencies(definition);

    if (definition.valueTypes) {
      for (const vt of definition.valueTypes) {
        this.valueTypes.set(vt.typeName, vt);
      }
    }

    if (definition.components) {
      for (const comp of definition.components) {
        this.components.set(comp.name, comp);
      }
    }

    if (definition.scopeExtensions) {
      for (const ext of definition.scopeExtensions) {
        const scopeValue = ext.factory(config);
        this.scopeExtensions.set(ext.key, scopeValue);
      }
    }

    if (definition.runtimeExports) {
      for (const exp of definition.runtimeExports) {
        this.runtimeExports.set(exp.name, exp.factory);
      }
    }

    if (definition.onInstall) {
      await definition.onInstall({
        config,
        registerValueType: (def) => {
          this.valueTypes.set(def.typeName, def);
        },
        registerComponent: (def) => {
          this.components.set(def.name, def);
        },
        extendScope: (ext) => {
          this.scopeExtensions.set(ext.key, ext.factory(config));
        },
        addRuntimeExport: (exp) => {
          this.runtimeExports.set(exp.name, exp.factory);
        },
      });
    }

    registered.installed = true;
    console.log(`[PluginRegistry] Installed plugin: ${name}@${registered.version}`);
  }

  /**
   * 验证版本兼容性
   */
  private validateVersion(pluginVersion: string): void {
    const [coreMajor, coreMinor] = this.coreVersion.split('.').slice(0, 2);
    const [pluginMajor, pluginMinor] = pluginVersion.split('.').slice(0, 2);

    if (coreMajor !== pluginMajor || coreMinor !== pluginMinor) {
      throw new Error(
        `[PluginRegistry] Plugin version ${pluginVersion} is incompatible with core version ${this.coreVersion}. Major and minor versions must match.`
      );
    }
  }

  /**
   * 检查 peerDependencies
   */
  private checkPeerDependencies(plugin: VueJsonPlugin): void {
    if (!plugin.name.includes('/plugin-')) {
      return;
    }

    const pluginShortName = plugin.name.replace('@json-engine/plugin-', '');
    const peerMap: Record<string, string> = {
      axios: 'axios',
      antd: 'ant-design-vue',
      router: 'vue-router',
      echarts: 'echarts',
      pinia: 'pinia',
      i18n: 'vue-i18n',
    };

    const peerDep = peerMap[pluginShortName];
    if (peerDep) {
      try {
        require.resolve(peerDep);
      } catch {
        console.warn(
          `[${plugin.name}] peerDependency "${peerDep}" not installed.\nPlease run: npm install ${peerDep}`
        );
      }
    }
  }

  /**
   * 获取插件配置
   */
  private getPluginConfig(name: string, config: Record<string, unknown>): unknown {
    const configKey = name.replace('@json-engine/plugin-', '');
    return config[configKey];
  }

  /**
   * 获取 Scope 扩展
   */
  getScopeExtensions(): Record<string, unknown> {
    return Object.fromEntries(this.scopeExtensions);
  }

  /**
   * 获取组件
   */
  getComponent(name: string): unknown | undefined {
    return this.components.get(name);
  }

  /**
   * 获取值类型
   */
  getValueType(typeName: string): unknown | undefined {
    return this.valueTypes.get(typeName);
  }

  /**
   * 获取运行时导出
   */
  getRuntimeExport(name: string): ((...args: unknown[]) => unknown) | undefined {
    return this.runtimeExports.get(name);
  }

  /**
   * 获取已安装的插件
   */
  getPlugin(name: string): RegisteredPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有已安装插件
   */
  getInstalledPlugins(): RegisteredPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.installed);
  }
}

let globalRegistry: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry({ coreVersion: '0.0.1' });
  }
  return globalRegistry;
}

export function resetPluginRegistry(): void {
  globalRegistry = null;
}