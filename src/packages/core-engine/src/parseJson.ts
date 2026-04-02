import type {
  ValueBody,
  FunctionBody,
  ParseResult,
  AbstractScopeParseData,
  AbstractReferenceParseData,
  ExpressionParseData,
  FunctionParseData,
} from './types';
import {
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

/**
 * Transforms structured DSL input ($ref/$expr/$fn/$scope) into
 * the internal { type, body } format that existing parsers understand.
 * 
 * Legacy { type: 'xxx', body: '...' } format is NOT supported.
 */
function normalizeValue(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }

  const obj = value as Record<string, unknown>;

  // $ref — reference to state/props/computed
  // Output structured format (prefix + variable) that passes legacy format check
  if ('$ref' in obj && typeof obj.$ref === 'string') {
    const refPath = obj.$ref as string;
    const dotIndex = refPath.indexOf('.');
    if (dotIndex < 0) {
      return value;
    }
    const prefix = refPath.substring(0, dotIndex);
    const rest = refPath.substring(dotIndex + 1);
    const varDotIndex = rest.indexOf('.');
    if (varDotIndex > 0) {
      const variable = rest.substring(0, varDotIndex);
      const path = rest.substring(varDotIndex + 1);
      return { type: 'reference', prefix, variable, path };
    }
    return { type: 'reference', prefix, variable: rest };
  }

  // $expr — expression
  if ('$expr' in obj && typeof obj.$expr === 'string') {
    return { type: 'expression', body: `{{${obj.$expr}}}` };
  }

  // $fn — function
  if ('$fn' in obj) {
    if (typeof obj.$fn === 'string') {
      return { type: 'function', params: '{{{}}}', body: `{{${obj.$fn}}}` };
    }
    const fnObj = obj.$fn as Record<string, unknown>;
    if (Array.isArray(fnObj.params)) {
      const paramsJson = JSON.stringify(
        Object.fromEntries(fnObj.params.map((p: string) => [p, null]))
      );
      return { type: 'function', params: `{{{ ${paramsJson} }}}`, body: `{{${fnObj.body}}}` };
    }
    return { type: 'function', params: '{{{}}}', body: `{{${fnObj.body}}}` };
  }

  // $scope — service injection
  if ('$scope' in obj && typeof obj.$scope === 'string') {
    const scopePath = obj.$scope as string;
    const dotIndex = scopePath.indexOf('.');
    if (dotIndex > 0) {
      const scope = scopePath.substring(0, dotIndex);
      const variable = scopePath.substring(dotIndex + 1);
      return { type: 'scope', body: `{{$_[${scope}]_${variable}}}` };
    }
  }

  // Legacy format detection: { type: 'xxx', body: '...' } is NOT supported
  // But allow structured formats: { type: 'reference', prefix, variable } and { type: 'scope', scope, variable }
  if ('type' in obj && 'body' in obj && typeof obj.type === 'string') {
    const isStructuredReference = obj.type === 'reference' && 'prefix' in obj && 'variable' in obj;
    const isStructuredScope = obj.type === 'scope' && 'scope' in obj && 'variable' in obj;
    
    if (!isStructuredReference && !isStructuredScope) {
      throw new Error(
        `[parseJson] Legacy format { type: '${obj.type}', body: '...' } is no longer supported. ` +
        `Use new format: $ref, $expr, $fn, or $scope.`
      );
    }
  }

  return value;
}

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

  // Handle structured reference input: { type: 'reference', prefix, variable }
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

  // Handle structured scope input: { type: 'scope', scope, variable }
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

  // Handle function input: { type: 'function', params, body }
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

  // Handle body-based value types: { type: 'string'|'reference'|'scope'|'expression', body: '...' }
  if (
    typeof valueObj.type === 'string' &&
    'body' in valueObj &&
    ['string', 'scope', 'reference', 'expression'].includes(valueObj.type)
  ) {
    const valueBody: ValueBody = {
      type: valueObj.type as ValueBody['type'],
      body: String(valueObj.body || ''),
    };

    switch (valueBody.type) {
      case 'string': {
        // String values pass through as-is (no more single-quote wrapping)
        return { _type: 'string', value: valueBody.body };
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
    const body = valueObj.body !== undefined ? valueObj.body : valueObj;
    const walkedBody = walkJson(body, config, '');
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

      const normalized = normalizeValue(item);
      const parsedValue = parseValueByType(normalized, config);
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

    const normalized = normalizeValue(currentValue);
    const parsedValue = parseValueByType(normalized, config);
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
  const normalized = normalizeValue(input);
  const parsed = parseValueByType(normalized, parserConfig);
  return walkJson(parsed, parserConfig, '');
}

export { createParserConfig, normalizeValue };

export type {
  KeyParserFunction,
  KeyParserRegistry,
  ParseCallback,
  ParserConfig,
  ParserOptions,
};
