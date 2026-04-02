// Plugin
export { getPluginRegistry, PluginRegistry, loadAndInstallPlugins } from './plugin';
// Parser
export { parseSchema, getVueKeyParsers, toPascalCase, isValidVariableName } from './parser';
export { vueParserConfig, createParserConfig } from './config/vue-parser-config';
// Runtime
export { createState, createComputed, setupWatchers, setupProvide, setupInject, renderVNode, createComponent, clearComponentCache, injectStyles, removeStyles, updateStyles, generateComponentId, clearAllStyles, loadSchema, validateSchema, cacheSchema, clearSchemaCache, getCachedSchema, resolveImports, isSchemaWithImports, createSchemaLoader, getSchemaLoader, setSchemaLoader, loadComponent, clearSchemaLoaderCache, preloadSchemas, } from './runtime';
// Platform
export { detect, getPlatform, getPlatformFeatures, isPlatform, isMobileDevice, } from './runtime/platform-detector';
// Composables
export { useVueJson, useJsonComponent, useJsonRenderer, useCoreScope, createCoreScope, setCoreScope, registerGlobalComponents, getGlobalComponents, } from './composables';
// Components
export { PageLoader, createPageLoader, createDefaultLoadingSpinner, createDefaultErrorUI } from './components';
// Runtime (value-resolver)
export { evaluateExpression, executeFunction, resolvePropertyValue, isReferenceParseData, isExpressionParseData, isFunctionParseData, isScopeParseData, isStateReference, isPropsReference, isComputedReference, isEChartsOption, } from './runtime/value-resolver';
// Utils
export { evaluateFunction, resolveReference, clearExpressionCache, SchemaParseError, ValidationError, ExpressionError, ComponentCreationError, DirectiveError, generateTypes, writeTypeDefinition, inferSchemaType, } from './utils';
//# sourceMappingURL=index.js.map