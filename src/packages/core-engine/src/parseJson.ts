import type {
  ValueBody,
  FunctionBody,
  ParseResult,
  ObjectParseData,
  AbstractScopeParseData,
  AbstractReferenceParseData,
  ExpressionParseData,
  StringParseData,
  FunctionParseData,
} from './types';
import {
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValueReferenceParser,
  ValueExpressionParser,
  ValueFunctionParser,
} from './types';
import {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
} from './regex-factory';
import { createParserConfig, type ParserConfig, type ParserOptions } from './config-factory';

type KeyParserFunction = (key: string, params?: Record<string, unknown>) => string;

interface KeyParserRegistry {
  [keyName: string]: KeyParserFunction;
}

type ParseCallback = (path: string, key: string, value: unknown) => void;

function parseValueByType(
  value: unknown,
  config: ParserConfig
): unknown {
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

  if (
    valueObj.type === 'scope' &&
    typeof valueObj.scope === 'string' &&
    typeof valueObj.variable === 'string'
  ) {
    const result = ValueScopeParser({ type: 'scope', body: `{{$_[${valueObj.scope}]_${valueObj.variable}}}` }, config.scopeRegex);
    return result.data;
  }

  if (
    valueObj.type === 'reference' &&
    typeof valueObj.prefix === 'string' &&
    typeof valueObj.variable === 'string'
  ) {
    const body = `{{ref_${valueObj.prefix}_${valueObj.variable}${valueObj.path ? '.' + valueObj.path : ''}}}`;
    const result = ValueReferenceParser({ type: 'reference', body }, config.referenceRegex);
    return result.data;
  }

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
    ['string', 'scope', 'reference', 'expression', 'object', 'function'].includes(valueObj.type)
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
        const result: ParseResult<AbstractScopeParseData> = ValueScopeParser(valueBody, config.scopeRegex);
        return result.data;
      }
      case 'reference': {
        const result: ParseResult<AbstractReferenceParseData> = ValueReferenceParser(valueBody, config.referenceRegex);
        return result.data;
      }
      case 'expression': {
        const result: ParseResult<ExpressionParseData> = ValueExpressionParser(
          valueBody,
          config.referenceRegex,
          config.scopeRegex,
          config.innerReferenceRegex,
          config.innerScopeRegex
        );
        return result.data;
      }
      case 'function': {
        const functionBody: FunctionBody = {
          type: 'function',
          params: valueBody.body.match(/^\{\{\{(.*)\}\}\}$/s)?.[1] ?? '',
          body: valueBody.body.match(/^\{\{(.*)\}\}$/)?.[1] ?? valueBody.body,
        };
        const funcResult: ParseResult<FunctionParseData> = ValueFunctionParser(functionBody);
        return funcResult.data;
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

function walkJson(data: unknown, config: ParserConfig, path: string): unknown {
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
      const parsedValue = parseValueByType(data[i], config);
      const parsedItem = walkJson(parsedValue, config, itemPath);
      parsedArray.push(parsedItem);
    }
    return parsedArray;
  }

  const obj = data as Record<string, unknown>;
  const parsedObj: Record<string, unknown> = {};

  const mergedRegistry = { ...config.keyParsers };

  for (const [key, value] of Object.entries(obj)) {
    const parsedKey = parseKey(key, mergedRegistry);
    const keyPath = path ? `${path}.${key}` : key;
    const parsedValue = parseValueByType(value, config);
    const finalValue = walkJson(parsedValue, config, keyPath);

    parsedObj[parsedKey] = finalValue;

    if (config.onParsed) {
      config.onParsed(keyPath, parsedKey, finalValue);
    }
  }

  return parsedObj;
}

export function parseJson(input: unknown, config?: ParserConfig | ParserOptions): unknown {
  const parserConfig = config instanceof Object && 'referencePrefixes' in config
    ? config as ParserConfig
    : createParserConfig(config as ParserOptions);
  return walkJson(input, parserConfig, '');
}

export { createParserConfig };

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ParseCallback,
  ParserConfig,
  ParserOptions,
};
