// Types
export type {
  Platform,
  PlatformFeatures,
  PlatformInfo,
  VueJsonSchema,
  VueJsonSchemaInput,
  ParsedSchema,
  VueJsonAppSchema,
  VueJsonPlugin,
  PluginDeclaration,
  PluginConfig,
  RenderContext,
  UIComponentConfig,
  UIThemeConfig,
  UIConfig,
  AxiosRequestConfig,
  WSConfig,
  NetworkConfig,
  StorageConfig,
  I18nConfig,
  AuthConfig,
} from './types';

// Plugin
export { getPluginRegistry, PluginRegistry, loadAndInstallPlugins } from './plugin';

// Parser
export { parseSchema } from './parser';
export {
  registerDefaultKeyParsers,
  unregisterDefaultKeyParsers,
  registerVueJsonKeyParser,
  unregisterVueJsonKeyParser,
  clearVueJsonKeyParsers,
  toPascalCase,
  isValidVariableName,
} from './parser/key-parsers';

// Runtime
export {
  createState,
  createComputed,
  setupWatchers,
  setupProvide,
  setupInject,
  renderVNode,
  createComponent,
  clearComponentCache,
  injectStyles,
  removeStyles,
  updateStyles,
  generateComponentId,
  clearAllStyles,
  loadSchema,
  validateSchema,
  cacheSchema,
  clearSchemaCache,
  getCachedSchema,
  resolveImports,
  isSchemaWithImports,
  createSchemaLoader,
  getSchemaLoader,
  setSchemaLoader,
  loadComponent,
  clearSchemaLoaderCache,
  preloadSchemas,
} from './runtime';
export type { SchemaLoadResult, SchemaLoadOptions } from './runtime';

// Platform
export {
  detect,
  getPlatform,
  getPlatformFeatures,
  isPlatform,
  isMobileDevice,
} from './runtime/platform-detector';

// Composables
export {
  useVueJson,
  useJsonComponent,
  useJsonRenderer,
  useCoreScope,
  createCoreScope,
  setCoreScope,
  registerGlobalComponents,
  getGlobalComponents,
} from './composables';
export type {
  CoreScope,
  CoreScopeAuth,
  CoreScopeI18n,
  CoreScopeStorage,
  CoreScopeApi,
  CoreScopeWS,
  CoreScopeLoader,
  CoreScopeRouter,
} from './composables';

// Components
export { PageLoader, createPageLoader, createDefaultLoadingSpinner, createDefaultErrorUI } from './components';
export type { PageLoaderProps } from './components';

// Runtime (value-resolver)
export {
  evaluateExpression,
  executeFunction,
  resolvePropertyValue,
  isExpressionValue,
  isFunctionValue,
  isStateRef,
  isPropsRef,
  isScopeRef,
} from './runtime/value-resolver';

// Utils
export {
  evaluateFunction,
  resolveReference,
  clearExpressionCache,
  SchemaParseError,
  ValidationError,
  ExpressionError,
  ComponentCreationError,
  DirectiveError,
  generateTypes,
  writeTypeDefinition,
  inferSchemaType,
} from './utils';