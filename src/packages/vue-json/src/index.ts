// Types
export type * from './types';

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
} from './runtime';

// Composables
export { useVueJson, useJsonComponent, useJsonRenderer } from './composables';

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