export const VERSION = '0.0.1';

export type {
  FunctionBody,
  ValueBody,
  ValueBodyType,
  ParseResult,
  ParseError,
  ObjectParseData,
  ObjectParseResult,
  AbstractScopeParseData,
  AbstractReferenceParseData,
  ExpressionParseData,
  StringParseData,
  FunctionParseData,
  ParseDataType,
} from './types';

export {
  createError,
  createTypeGuard,
  parseNestedReference,
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValueReferenceParser,
  ValueExpressionParser,
  ValueFunctionParser,
  isScopeParseData,
  isReferenceParseData,
  isExpressionParseData,
  isFunctionParseData,
  isStringParseData,
  isObjectParseResult,
} from './types';

export {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
} from './regex-factory';

export {
  createParserConfig,
  parseJson,
  normalizeValue,
} from './parseJson';

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ValueParserFn,
  ValueParserRegistry,
  ParseCallback,
  ParseError as ConfigParseError,
  ErrorCallback,
  ParserHooks,
  CacheOptions,
  ParserOptions,
  ParserConfig,
} from './config-factory';

export {
  ParserCache,
  createParserCache,
} from './cache';

export type {
  CacheOptions as CacheConfigOptions,
  CacheEntry,
} from './cache';

export {
  DebugTracer,
  createDebugTracer,
} from './debug';

export type {
  ParseTrace,
  TraceContext,
  LogLevel,
  DebugOptions,
} from './debug';

export {
  validateSchema,
  createSchemaValidator,
  createJsonSchema,
} from './schema-validator';

export type {
  SchemaType,
  JsonSchema,
  ValidationError,
  ValidationResult,
} from './schema-validator';
