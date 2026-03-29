// Types
export type {
  Platform,
  PlatformFeatures,
  PlatformInfo,
  FieldPermission,
  SOPStepPermission,
  PermissionProvider,
  PermissionChecker,
  AuthDirectiveConfig,
  PrivacyType,
  DataFilterOptions,
  SOPStep,
  SOPConfig,
  PagePermission,
  VueJsonSchema,
  VueJsonSchemaInput,
  ParsedSchema,
  RouteConfig,
  RouteMeta,
  NavigationGuard,
  NavigationGuardCallback,
  RouteLocationNormalized,
  RouteRecordNormalized,
  RouterConfig,
  RouterGuards,
  Router,
  NavigationResult,
  PluginConfig,
  UIComponentConfig,
  UIThemeConfig,
  UIConfig,
  AxiosRequestConfig,
  AxiosRetryConfig,
  WSConfig,
  NetworkConfig,
  StorageConfig,
  I18nLocaleConfig,
  I18nConfig,
  AuthConfig,
  VueJsonAppSchema,
} from './types';

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
  createStorageAdapter,
  syncToStorage,
  syncFromStorage,
  removeFromStorage,
  createRouter,
  registerRoutes,
  addRouteGuard,
  setupUIComponents,
  registerComponents,
  getComponent,
  hasComponent,
  configureTheme,
  getTheme,
  loadSchema,
  validateSchema,
  cacheSchema,
  clearSchemaCache,
  getCachedSchema,
  resolveImports,
  isSchemaWithImports,
} from './runtime';

// Platform
export {
  detect,
  getPlatform,
  getPlatformFeatures,
  isPlatform,
  isMobileDevice,
} from './runtime/platform-detector';

// Permission
export {
  registerPermissionProvider,
  getPermissionProvider,
  DefaultPermissionProvider,
} from './runtime/permission-provider';
export {
  PermissionCheckerImpl,
  has,
  hasAny,
  hasAll,
  hasRole,
  canAccessPage,
  registerPagePermission,
} from './runtime/permission-checker';
export {
  getFieldPermission,
  canReadField,
  canWriteField,
  isFieldHidden,
  isFieldPrivate,
} from './runtime/field-permission';
export {
  maskName,
  maskPhone,
  maskIdCard,
  maskEmail,
  applyPrivacyMask,
  filterData,
  filterDataWithPrivacy,
} from './runtime/data-filter';
export {
  getSOPStepPermission,
  canExecuteSOPStep,
  canViewSOPStep,
  getAvailableFields,
  validateSOPStepPermissions,
  getNextAvailableSteps,
} from './runtime/sop-permission';

// Composables
export { useVueJson, useJsonComponent, useJsonRenderer, useCoreScope, createCoreScope, setCoreScope } from './composables';
export type { CoreScope, CoreScopeAuth, CoreScopeI18n, CoreScopeStorage, CoreScopeApi, CoreScopeWS } from './composables';

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