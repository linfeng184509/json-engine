import type {
  ValueBody,
  FunctionBody,
  ParseResult,
  ObjectParseResult,
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
import { createParserConfig, type ParserConfig, type ParserOptions } from './config-factory';

type KeyParserFunction = (key: string, params?: Record<string, unknown>) => string;

interface KeyParserRegistry {
  [keyName: string]: KeyParserFunction;
}

type ParseCallback = (path: string, key: string, value: unknown) => void;

function parseValueByType(
  value: unknown,
  config: ParserConfig,
  path?: string
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
    if (!result.success) {
      if (config.onError) {
        return config.onError(path ?? '', result.error);
      }
      throw new Error(result.error.message);
    }
    return result.data;
  }

  if (
    valueObj.type === 'reference' &&
    typeof valueObj.prefix === 'string' &&
    typeof valueObj.variable === 'string'
  ) {
    const body = `{{ref_${valueObj.prefix}_${valueObj.variable}${valueObj.path ? '.' + valueObj.path : ''}}}`;
    const result = ValueReferenceParser({ type: 'reference', body }, config.referenceRegex);
    if (!result.success) {
      if (config.onError) {
        return config.onError(path ?? '', result.error);
      }
      throw new Error(result.error.message);
    }
    return result.data;
  }

  if (
    valueObj.type === 'function' &&
    'params' in valueObj &&
    'body' in valueObj
  ) {
    const functionBody: FunctionBody = {
      type: 'function',
      params: String(valueObj.params || ''),
      body: String(valueObj.body || ''),
    };
    const result: ParseResult<FunctionParseData> = ValueFunctionParser(functionBody);
    if (!result.success) {
      if (config.onError) {
        return config.onError(path ?? '', result.error);
      }
      throw new Error(result.error.message);
    }
    return result.data;
  }

  if (
    typeof valueObj.type === 'string' &&
    'body' in valueObj &&
    ['string', 'scope', 'reference', 'expression', 'object'].includes(valueObj.type)
  ) {
    const valueBody: ValueBody = {
      type: valueObj.type as ValueBody['type'],
      body: String(valueObj.body || ''),
    };

    switch (valueBody.type) {
      case 'object': {
        const result: ParseResult<ObjectParseResult> = ValueObjectParser(
          valueBody,
          config.innerReferenceRegex,
          config.innerScopeRegex
        );
        if (!result.success) {
          if (config.onError) {
            return config.onError(path ?? '', result.error);
          }
          throw new Error(result.error.message);
        }
        return result.data;
      }
      case 'string': {
        const result: ParseResult<StringParseData> = ValueConstraintParser(valueBody);
        if (!result.success) {
          if (config.onError) {
            return config.onError(path ?? '', result.error);
          }
          throw new Error(result.error.message);
        }
        return result.data;
      }
      case 'scope': {
        const result: ParseResult<AbstractScopeParseData> = ValueScopeParser(valueBody, config.scopeRegex);
        if (!result.success) {
          if (config.onError) {
            return config.onError(path ?? '', result.error);
          }
          throw new Error(result.error.message);
        }
        return result.data;
      }
      case 'reference': {
        const result: ParseResult<AbstractReferenceParseData> = ValueReferenceParser(valueBody, config.referenceRegex);
        if (!result.success) {
          if (config.onError) {
            return config.onError(path ?? '', result.error);
          }
          throw new Error(result.error.message);
        }
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
        if (!result.success) {
          if (config.onError) {
            return config.onError(path ?? '', result.error);
          }
          throw new Error(result.error.message);
        }
        return result.data;
      }
      default:
        return value;
    }
  }

  // Handle custom value parsers
  if (typeof valueObj.type === 'string' && config.valueParsers && config.valueParsers[valueObj.type]) {
    const parser = config.valueParsers[valueObj.type];
    
    // First, recursively walk the body to resolve any nested expressions
    const body = valueObj.body !== undefined ? valueObj.body : valueObj;
    const walkedBody = walkJson(body, config, '');
    
    // Convert to string for parser
    const bodyStr = typeof walkedBody === 'string' ? walkedBody : JSON.stringify(walkedBody);
    return parser(bodyStr);
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
      let item = data[i];

      if (config.hooks?.beforeParse) {
        const hookResult = config.hooks.beforeParse(itemPath, item);
        if (hookResult !== undefined) {
          item = hookResult;
        }
      }

      const parsedValue = parseValueByType(item, config);
      let parsedItem = walkJson(parsedValue, config, itemPath);

      if (config.hooks?.transformResult) {
        parsedItem = config.hooks.transformResult(itemPath, parsedItem);
      }

      if (config.hooks?.afterParse) {
        config.hooks.afterParse(itemPath, data[i], parsedItem);
      }

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
    let currentValue = value;

    if (config.hooks?.beforeParse) {
      const hookResult = config.hooks.beforeParse(keyPath, currentValue);
      if (hookResult !== undefined) {
        currentValue = hookResult;
      }
    }

    const parsedValue = parseValueByType(currentValue, config);
    let finalValue = walkJson(parsedValue, config, keyPath);

    if (config.hooks?.transformResult) {
      finalValue = config.hooks.transformResult(keyPath, finalValue);
    }

    if (config.hooks?.afterParse) {
      config.hooks.afterParse(keyPath, currentValue, finalValue);
    }

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
  const parsed = parseValueByType(input, parserConfig);
  return walkJson(parsed, parserConfig, '');
}

export { createParserConfig };

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ParseCallback,
  ParserConfig,
  ParserOptions,
};
