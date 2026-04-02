import type { DebugOptions } from './debug';

type KeyParserFunction = (key: string, params?: Record<string, unknown>) => string;

interface KeyParserRegistry {
  [keyName: string]: KeyParserFunction;
}

type ValueParserFn = (body: string) => unknown;

interface ValueParserRegistry {
  [typeName: string]: ValueParserFn;
}

type ParseCallback = (path: string, key: string, value: unknown) => void;

interface ParseError {
  code: string;
  parser: string;
  message: string;
  expected: string;
  received: string;
}

type ErrorCallback = (path: string, error: ParseError) => unknown;

interface ParserHooks {
  beforeParse?: (path: string, value: unknown) => unknown | void;
  afterParse?: (path: string, original: unknown, parsed: unknown) => void;
  onError?: (path: string, error: ParseError) => unknown | void;
  transformResult?: (path: string, result: unknown) => unknown;
}

interface CacheOptions {
  enabled: boolean;
  maxSize?: number;
  ttl?: number;
}

interface ParserOptions {
  referencePrefixes?: string[];
  scopeNames?: string[];
  valueParsers?: ValueParserRegistry;
  keyParsers?: KeyParserRegistry;
  onParsed?: ParseCallback;
  onError?: ErrorCallback;
  hooks?: ParserHooks;
  cache?: CacheOptions;
  debug?: DebugOptions;
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
  onError?: ErrorCallback;
  hooks?: ParserHooks;
  cache?: CacheOptions;
  debug?: DebugOptions;
}

const DEFAULT_REFERENCE_PREFIXES = ['props', 'state', 'computed'];
const DEFAULT_SCOPE_NAMES = ['core', 'goal'];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createParserConfig(options: ParserOptions = {}): ParserConfig {
  const referencePrefixes = options.referencePrefixes ?? DEFAULT_REFERENCE_PREFIXES;
  const scopeNames = options.scopeNames ?? DEFAULT_SCOPE_NAMES;

  const refPattern = referencePrefixes.map(escapeRegex).join('|');
  const scopePattern = scopeNames.map(escapeRegex).join('|');

  return {
    referencePrefixes,
    scopeNames,
    referenceRegex: new RegExp(`^\\{\\{ref_(${refPattern})_(.+)\\}\\}$`),
    scopeRegex: new RegExp(`^\\{\\{\\$_(${scopePattern})_(.+)\\}\\}$`),
    innerReferenceRegex: new RegExp(`^ref_(${refPattern})_([a-zA-Z_$][a-zA-Z0-9_$.]*)$`),
    innerScopeRegex: new RegExp(`^\\$_(${scopePattern})_([a-zA-Z_$][a-zA-Z0-9_$.]*)$`),
    valueParsers: options.valueParsers ?? {},
    keyParsers: options.keyParsers ?? {},
    onParsed: options.onParsed,
    onError: options.onError,
    hooks: options.hooks,
    cache: options.cache,
    debug: options.debug,
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
  ParseError,
  ErrorCallback,
  ParserHooks,
  CacheOptions,
  ParserOptions,
  ParserConfig,
};
