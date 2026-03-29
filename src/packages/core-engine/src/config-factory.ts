import {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
} from './regex-factory';

type KeyParserFunction = (key: string, params?: Record<string, unknown>) => string;

interface KeyParserRegistry {
  [keyName: string]: KeyParserFunction;
}

type ValueParserFn = (body: string) => unknown;

interface ValueParserRegistry {
  [typeName: string]: ValueParserFn;
}

type ParseCallback = (path: string, key: string, value: unknown) => void;

interface ParserOptions {
  referencePrefixes?: string[];
  scopeNames?: string[];
  valueParsers?: ValueParserRegistry;
  keyParsers?: KeyParserRegistry;
  onParsed?: ParseCallback;
}

interface ParserConfig {
  referencePrefixes: string[];
  scopeNames: string[];
  referenceRegex: RegExp;
  scopeRegex: RegExp;
  innerReferenceRegex: RegExp;
  innerScopeRegex: RegExp;
  valueParsers: ValueParserRegistry;
  keyParsers: KeyParserRegistry;
  onParsed?: ParseCallback;
}

const DEFAULT_REFERENCE_PREFIXES = ['props', 'state', 'computed'];
const DEFAULT_SCOPE_NAMES = ['core', 'goal'];

function createParserConfig(options: ParserOptions = {}): ParserConfig {
  const referencePrefixes = options.referencePrefixes ?? DEFAULT_REFERENCE_PREFIXES;
  const scopeNames = options.scopeNames ?? DEFAULT_SCOPE_NAMES;

  return {
    referencePrefixes,
    scopeNames,
    referenceRegex: createReferenceRegex(referencePrefixes),
    scopeRegex: createScopeRegex(scopeNames),
    innerReferenceRegex: createInnerReferenceRegex(referencePrefixes),
    innerScopeRegex: createInnerScopeRegex(scopeNames),
    valueParsers: options.valueParsers ?? {},
    keyParsers: options.keyParsers ?? {},
    onParsed: options.onParsed,
  };
}

export {
  createParserConfig,
};

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ValueParserFn,
  ValueParserRegistry,
  ParseCallback,
  ParserOptions,
  ParserConfig,
};
