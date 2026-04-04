import { getLogger } from '../utils/logger';
const logger = getLogger('PluginRegistry');
export class PluginRegistry {
    plugins = new Map();
    coreVersion;
    scopeExtensions = new Map();
    components = new Map();
    valueTypes = new Map();
    runtimeExports = new Map();
    constructor(options) {
        this.coreVersion = options.coreVersion;
    }
    /**
     * 注册插件
     */
    register(plugin) {
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
    async installFromSchema(declarations, config) {
        const installed = [];
        const failed = [];
        for (const decl of declarations) {
            try {
                const registered = this.plugins.get(decl.name);
                if (!registered) {
                    failed.push({ name: decl.name, error: `Unknown plugin: ${decl.name}` });
                    console.warn(`[PluginRegistry] Unknown plugin: ${decl.name}`);
                    continue;
                }
                if (registered.installed) {
                    installed.push(decl.name);
                    continue;
                }
                const pluginConfig = this.getPluginConfig(decl.name, config);
                await this.install(decl.name, pluginConfig);
                installed.push(decl.name);
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                failed.push({ name: decl.name, error: errorMsg });
                console.warn(`[PluginRegistry] Failed to install plugin "${decl.name}": ${errorMsg}`);
            }
        }
        return { installed, failed };
    }
    /**
     * 安装单个插件
     */
    async install(name, config) {
        const registered = this.plugins.get(name);
        if (!registered || registered.installed) {
            return;
        }
        const { definition } = registered;
        // 验证配置 Schema
        if (definition.configSchema) {
            const errors = this.validatePluginConfig(name, config, definition.configSchema);
            if (errors.length > 0) {
                throw new Error(`[PluginRegistry] Invalid config for plugin "${name}": ${errors.join('; ')}`);
            }
        }
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
        logger.info('Installed plugin: %s@%s', name, registered.version);
    }
    /**
     * 验证版本兼容性
     */
    validateVersion(pluginVersion) {
        const [coreMajor, coreMinor] = this.coreVersion.split('.').slice(0, 2);
        const [pluginMajor, pluginMinor] = pluginVersion.split('.').slice(0, 2);
        if (coreMajor !== pluginMajor || coreMinor !== pluginMinor) {
            throw new Error(`[PluginRegistry] Plugin version ${pluginVersion} is incompatible with core version ${this.coreVersion}. Major and minor versions must match.`);
        }
    }
    /**
     * 验证插件配置
     */
    validatePluginConfig(_pluginName, config, schema) {
        const errors = [];
        const configObj = config;
        const schemaObj = schema;
        // 基础类型检查
        if (schemaObj.type === 'object' && schemaObj.properties) {
            const properties = schemaObj.properties;
            const required = schemaObj.required || [];
            // 检查必填字段
            for (const field of required) {
                if (!configObj || !(field in configObj)) {
                    errors.push(`Missing required field: ${field}`);
                }
            }
            // 检查字段类型
            if (configObj) {
                for (const [field, fieldSchema] of Object.entries(properties)) {
                    if (field in configObj) {
                        const value = configObj[field];
                        const expectedType = fieldSchema.type;
                        if (expectedType && !this.checkType(value, expectedType)) {
                            errors.push(`Field "${field}" expected type "${expectedType}", got "${typeof value}"`);
                        }
                    }
                }
            }
        }
        return errors;
    }
    /**
     * 检查值类型
     */
    checkType(value, expectedType) {
        if (value === null || value === undefined) {
            return expectedType === 'null' || expectedType === 'undefined';
        }
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        return actualType === expectedType;
    }
    /**
     * 检查 peerDependencies
     */
    checkPeerDependencies(plugin) {
        if (!plugin.name.includes('/plugin-')) {
            return;
        }
        const pluginShortName = plugin.name.replace('@json-engine/plugin-', '');
        const peerMap = {
            axios: 'axios',
            antd: 'ant-design-vue',
            router: 'vue-router',
            echarts: 'echarts',
            pinia: 'pinia',
        };
        const peerDep = peerMap[pluginShortName];
        if (peerDep) {
            try {
                if (typeof require !== 'undefined' && require.resolve) {
                    require.resolve(peerDep);
                }
            }
            catch {
                console.warn(`[${plugin.name}] peerDependency "${peerDep}" not installed.\nPlease run: npm install ${peerDep}`);
            }
        }
    }
    /**
     * 获取插件配置
     */
    getPluginConfig(name, config) {
        const configKey = name.replace('@json-engine/plugin-', '');
        return config[configKey];
    }
    /**
     * 获取 Scope 扩展
     */
    getScopeExtensions() {
        return Object.fromEntries(this.scopeExtensions);
    }
    /**
     * 获取组件
     */
    getComponent(name) {
        return this.components.get(name);
    }
    /**
     * 获取值类型
     */
    getValueType(typeName) {
        return this.valueTypes.get(typeName);
    }
    /**
     * 获取运行时导出
     */
    getRuntimeExport(name) {
        return this.runtimeExports.get(name);
    }
    /**
     * 获取已安装的插件
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }
    /**
     * 获取所有已安装插件
     */
    getInstalledPlugins() {
        return Array.from(this.plugins.values()).filter((p) => p.installed);
    }
    /**
     * 获取所有已注册的组件
     * 返回 Record<string, Component> 格式，值为完整的 PluginComponentDefinition
     */
    getAllComponents() {
        return Object.fromEntries(this.components);
    }
}
let globalRegistry = null;
export function getPluginRegistry() {
    if (!globalRegistry) {
        globalRegistry = new PluginRegistry({ coreVersion: '0.0.1' });
    }
    return globalRegistry;
}
export function resetPluginRegistry() {
    globalRegistry = null;
}
/**
 * 从声明动态加载并安装插件
 *
 * @param declarations - 插件声明列表
 * @param config - 插件配置
 * @param loaders - 可选的插件加载器映射表，用于动态加载插件
 * @returns 安装结果，包含成功和失败的插件列表
 */
export async function loadAndInstallPlugins(declarations, config, loaders) {
    const registry = getPluginRegistry();
    for (const decl of declarations) {
        const pluginName = decl.name;
        if (!registry.getPlugin(pluginName)) {
            if (loaders && loaders[pluginName]) {
                try {
                    const plugin = await loaders[pluginName]();
                    registry.register(plugin);
                }
                catch (error) {
                    console.warn(`[loadAndInstallPlugins] Failed to load plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            else {
                try {
                    const module = await import(
                    /* @vite-ignore */
                    /* webpackIgnore: true */
                    pluginName);
                    const plugin = module.default;
                    if (!plugin) {
                        console.warn(`[loadAndInstallPlugins] Plugin ${pluginName} has no default export`);
                        continue;
                    }
                    registry.register(plugin);
                }
                catch (error) {
                    console.warn(`[loadAndInstallPlugins] Failed to load plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
    }
    return registry.installFromSchema(declarations, config);
}
//# sourceMappingURL=plugin-registry.js.map