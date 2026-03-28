import type {
  ValueBody,
  FunctionBody,
  ParseResult,
  ObjectParseData,
  ScopeParseData,
  VariableParseData,
  ExpressionParseData,
  StringParseData,
  FunctionParseData,
} from './types';
import {
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValuePropsParser,
  ValueStateParser,
  ValueExpressionParser,
  ValueFunctionParser,
} from './types';

type KeyParserFunction = (key: string, params?: Record<string, unknown>) => string;

interface KeyParserRegistry {
  [keyName: string]: KeyParserFunction;
}

type ParseCallback = (path: string, key: string, value: unknown) => void;

interface ParseConfig {
  keyParsers?: KeyParserRegistry;
  onParsed?: ParseCallback;
}

const globalKeyParserRegistry: KeyParserRegistry = {};

export function registerKeyParser(keyName: string, parser: KeyParserFunction): void {
  globalKeyParserRegistry[keyName] = parser;
}

export function unregisterKeyParser(keyName: string): void {
  delete globalKeyParserRegistry[keyName];
}

export function clearKeyParsers(): void {
  Object.keys(globalKeyParserRegistry).forEach((key) => {
    delete globalKeyParserRegistry[key];
  });
}

function parseValueByType(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  const valueObj = value as Record<string, unknown>;

  if (valueObj.type === 'function') {
    const functionBody: FunctionBody = {
      type: 'function',
      params: String(valueObj.params || ''),
      body: String(valueObj.body || ''),
    };
    const result: ParseResult<FunctionParseData> = ValueFunctionParser(functionBody);
    return result.data;
  }

  if (
    typeof valueObj.type === 'string' &&
    ['string', 'scope', 'props', 'state', 'expression', 'object'].includes(valueObj.type)
  ) {
    const valueBody: ValueBody = {
      type: valueObj.type as ValueBody['type'],
      body: String(valueObj.body || ''),
    };

    switch (valueBody.type) {
      case 'object': {
        const result: ParseResult<ObjectParseData> = ValueObjectParser(valueBody);
        return result.data;
      }
      case 'string': {
        const result: ParseResult<StringParseData> = ValueConstraintParser(valueBody);
        return result.data;
      }
      case 'scope': {
        const result: ParseResult<ScopeParseData> = ValueScopeParser(valueBody);
        return result.data;
      }
      case 'props': {
        const result: ParseResult<VariableParseData> = ValuePropsParser(valueBody);
        return result.data;
      }
      case 'state': {
        const result: ParseResult<VariableParseData> = ValueStateParser(valueBody);
        return result.data;
      }
      case 'expression': {
        const result: ParseResult<ExpressionParseData> = ValueExpressionParser(valueBody);
        return result.data;
      }
      default:
        return value;
    }
  }

  return value;
}

function parseKey(key: string, registry: KeyParserRegistry): string {
  const parser = registry[key];
  if (parser) {
    return parser(key);
  }
  return key;
}

function walkJson(data: unknown, config: ParseConfig, path: string): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    const parsedArray: unknown[] = [];
    for (let i = 0; i < data.length; i++) {
      const itemPath = `${path}[${i}]`;
      const parsedItem = walkJson(data[i], config, itemPath);
      parsedArray.push(parsedItem);
    }
    return parsedArray;
  }

  const obj = data as Record<string, unknown>;
  const parsedObj: Record<string, unknown> = {};

  const mergedRegistry = { ...globalKeyParserRegistry, ...config.keyParsers };

  for (const [key, value] of Object.entries(obj)) {
    const parsedKey = parseKey(key, mergedRegistry);
    const keyPath = path ? `${path}.${key}` : key;
    const parsedValue = parseValueByType(value);
    const finalValue = walkJson(parsedValue, config, keyPath);

    parsedObj[parsedKey] = finalValue;

    if (config.onParsed) {
      config.onParsed(keyPath, parsedKey, finalValue);
    }
  }

  return parsedObj;
}

export function parseJson(json: unknown, config: ParseConfig = {}): unknown {
  return walkJson(json, config, '');
}

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ParseCallback,
  ParseConfig,
};