export type { Platform, PlatformFeatures, PlatformInfo, VueJsonSchema, VueJsonSchemaInput, ParsedSchema, VueJsonAppSchema, VueJsonPlugin, PluginDeclaration, PluginConfig, PluginInstallContext, RenderContext, UIComponentConfig, UIThemeConfig, UIConfig, AxiosRequestConfig, WSConfig, NetworkConfig, StorageConfig, I18nConfig, AuthConfig, } from './types';
export { getPluginRegistry, PluginRegistry, loadAndInstallPlugins } from './plugin';
export { parseSchema, getVueKeyParsers, toPascalCase, isValidVariableName } from './parser';
export { vueParserConfig, createParserConfig } from './config/vue-parser-config';
export type { ParserConfig, ParserOptions } from './config/vue-parser-config';
export { createState, createComputed, setupWatchers, setupProvide, setupInject, renderVNode, createComponent, clearComponentCache, injectStyles, removeStyles, updateStyles, generateComponentId, clearAllStyles, loadSchema, validateSchema, cacheSchema, clearSchemaCache, getCachedSchema, resolveImports, isSchemaWithImports, createSchemaLoader, getSchemaLoader, setSchemaLoader, loadComponent, clearSchemaLoaderCache, preloadSchemas, } from './runtime';
export type { SchemaLoadResult, SchemaLoadOptions } from './runtime';
export { detect, getPlatform, getPlatformFeatures, isPlatform, isMobileDevice, } from './runtime/platform-detector';
export { useVueJson, useJsonComponent, useJsonRenderer, useCoreScope, createCoreScope, setCoreScope, registerGlobalComponents, getGlobalComponents, } from './composables';
export type { CoreScope, CoreScopeAuth, CoreScopeI18n, CoreScopeStorage, CoreScopeApi, CoreScopeWS, CoreScopeLoader, CoreScopeRouter, } from './composables';
export { PageLoader, createPageLoader, createDefaultLoadingSpinner, createDefaultErrorUI } from './components';
export type { PageLoaderProps } from './components';
export { evaluateExpression, executeFunction, resolvePropertyValue, isReferenceParseData, isExpressionParseData, isFunctionParseData, isScopeParseData, isStateReference, isPropsReference, isComputedReference, isEChartsOption, } from './runtime/value-resolver';
export { evaluateFunction, resolveReference, clearExpressionCache, SchemaParseError, ValidationError, ExpressionError, ComponentCreationError, DirectiveError, generateTypes, writeTypeDefinition, inferSchemaType, } from './utils';
//# sourceMappingURL=index.d.ts.map