export const VERSION = '0.0.1';

export type {
  FunctionBody,
  ValueBody,
  ValueBodyType,
  ParseResult,
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
  parseNestedReference,
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValueReferenceParser,
  ValueExpressionParser,
  ValueFunctionParser,
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
} from './parseJson';

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ValueParserFn,
  ValueParserRegistry,
  ParseCallback,
  ParserOptions,
  ParserConfig,
} from './config-factory';
