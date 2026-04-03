import type { RegisteredPlugin, VueJsonPlugin, PluginDeclaration } from '../types/plugin.definitions';
export interface PluginRegistryOptions {
    coreVersion: string;
}
export declare class PluginRegistry {
    private plugins;
    private coreVersion;
    private scopeExtensions;
    private components;
    private valueTypes;
    private runtimeExports;
    constructor(options: PluginRegistryOptions);
    /**
     * 注册插件
     */
    register(plugin: VueJsonPlugin): void;
    /**
     * 从 Schema 声明安装插件
     */
    installFromSchema(declarations: {
        name: string;
        version?: string;
    }[], config: Record<string, unknown>): Promise<{
        installed: string[];
        failed: {
            name: string;
            error: string;
        }[];
    }>;
    /**
     * 安装单个插件
     */
    private install;
    /**
     * 验证版本兼容性
     */
    private validateVersion;
    /**
     * 验证插件配置
     */
    private validatePluginConfig;
    /**
     * 检查值类型
     */
    private checkType;
    /**
     * 检查 peerDependencies
     */
    private checkPeerDependencies;
    /**
     * 获取插件配置
     */
    private getPluginConfig;
    /**
     * 获取 Scope 扩展
     */
    getScopeExtensions(): Record<string, unknown>;
    /**
     * 获取组件
     */
    getComponent(name: string): unknown | undefined;
    /**
     * 获取值类型
     */
    getValueType(typeName: string): unknown | undefined;
    /**
     * 获取运行时导出
     */
    getRuntimeExport(name: string): ((...args: unknown[]) => unknown) | undefined;
    /**
     * 获取已安装的插件
     */
    getPlugin(name: string): RegisteredPlugin | undefined;
    /**
     * 获取所有已安装插件
     */
    getInstalledPlugins(): RegisteredPlugin[];
    /**
     * 获取所有已注册的组件
     * 返回 Record<string, Component> 格式，值为完整的 PluginComponentDefinition
     */
    getAllComponents(): Record<string, unknown>;
}
export declare function getPluginRegistry(): PluginRegistry;
export declare function resetPluginRegistry(): void;
/**
 * 从声明动态加载并安装插件
 *
 * @param declarations - 插件声明列表
 * @param config - 插件配置
 * @param loaders - 可选的插件加载器映射表，用于动态加载插件
 * @returns 安装结果，包含成功和失败的插件列表
 */
export declare function loadAndInstallPlugins(declarations: PluginDeclaration[], config: Record<string, unknown>, loaders?: Record<string, () => Promise<VueJsonPlugin>>): Promise<{
    installed: string[];
    failed: {
        name: string;
        error: string;
    }[];
}>;
//# sourceMappingURL=plugin-registry.d.ts.map