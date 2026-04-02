interface FunctionBody {
  type: 'function';
  params: string;
  body: string;
}

type ValueBodyType = 'string' | 'scope' | 'reference' | 'expression' | 'object' | 'function';

interface ValueBody {
  type: ValueBodyType;
  body: string;
}

interface ParseError {
  code: string;
  parser: string;
  message: string;
  expected: string;
  received: string;
}

type ParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ParseError };

interface ObjectParseData {
  key: string;
  value: unknown;
}

interface AbstractScopeParseData {
  _type: 'scope';
  scope: string;
  variable: string;
}

interface AbstractReferenceParseData {
  _type: 'reference';
  prefix: string;
  variable: string;
  path?: string;
}

interface ExpressionParseData {
  _type: 'expression';
  expression: string | AbstractReferenceParseData | AbstractScopeParseData;
}

interface StringParseData {
  _type: 'string';
  value: string;
}

interface FunctionParseData {
  _type: 'function';
  params: Record<string, unknown>;
  body: string;
}

interface ObjectParseResult {
  _type: 'object';
  value: Record<string, unknown>;
}

type ParseDataType = StringParseData | ObjectParseResult | AbstractScopeParseData | AbstractReferenceParseData | ExpressionParseData | FunctionParseData;

const FUNCTION_PARAMS_REGEX = /^\{\{\{(.*)\}\}\}$/s;
const FUNCTION_BODY_REGEX = /^\{\{([\s\S]*)\}\}$/;
const EXPRESSION_REGEX = /^\{\{([\s\S]+)\}\}$/;

function createError(parserName: string, reason: string, example: string): ParseError {
  return {
    code: 'PARSE_ERROR',
    parser: parserName,
    message: `[${parserName}] Parse failed: ${reason}. Expected: ${example}`,
    expected: example,
    received: reason,
  };
}

function parseNestedReference(
  content: string,
  referenceRegex: RegExp,
  scopeRegex: RegExp,
  innerRefRegex: RegExp,
  innerScopeRegex: RegExp
): string | AbstractReferenceParseData | AbstractScopeParseData {
  if (!content) return content;

  const scopeMatch = content.match(scopeRegex);
  if (scopeMatch) {
    return { _type: 'scope', scope: scopeMatch[1], variable: scopeMatch[2] };
  }

  const refMatch = content.match(referenceRegex);
  if (refMatch) {
    const fullPath = refMatch[2];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'reference',
        prefix: refMatch[1],
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'reference', prefix: refMatch[1], variable: fullPath };
  }

  const innerScopeMatch = content.match(innerScopeRegex);
  if (innerScopeMatch) {
    return { _type: 'scope', scope: innerScopeMatch[1], variable: innerScopeMatch[2] };
  }

  const innerRefMatch = content.match(innerRefRegex);
  if (innerRefMatch) {
    const fullPath = innerRefMatch[2];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'reference',
        prefix: innerRefMatch[1],
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'reference', prefix: innerRefMatch[1], variable: fullPath };
  }

  return content;
}

function parseObjectValue(
  rawValue: string,
  innerRefRegex: RegExp,
  innerScopeRegex: RegExp
): unknown {
  if (!rawValue || rawValue.trim() === '') {
    return rawValue;
  }

  if (rawValue.startsWith('ref_')) {
    const refMatch = rawValue.match(innerRefRegex);
    if (refMatch) {
      const prefix = refMatch[1];
      const variable = refMatch[2];
      const dotIndex = variable.indexOf('.');
      if (dotIndex > 0) {
        return {
          _type: 'reference',
          prefix,
          variable: variable.substring(0, dotIndex),
          path: variable.substring(dotIndex + 1)
        };
      }
      return { _type: 'reference', prefix, variable };
    }
  }

  if (rawValue.startsWith('$_')) {
    const scopeMatch = rawValue.match(innerScopeRegex);
    if (scopeMatch) {
      return { _type: 'scope', scope: scopeMatch[1], variable: scopeMatch[2] };
    }
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return processObjectProperties(parsed, innerRefRegex, innerScopeRegex);
    }
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        if (typeof item === 'string') {
          return parseObjectValue(item, innerRefRegex, innerScopeRegex);
        }
        if (typeof item === 'object' && item !== null) {
          return processObjectProperties(item, innerRefRegex, innerScopeRegex);
        }
        return item;
      });
    }
    return parsed;
  } catch {
    return rawValue;
  }
}

function processObjectProperties(
  obj: Record<string, unknown>,
  innerRefRegex: RegExp,
  innerScopeRegex: RegExp
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      result[key] = parseObjectValue(val, innerRefRegex, innerScopeRegex);
    } else if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        result[key] = val.map(item => {
          if (typeof item === 'string') {
            return parseObjectValue(item, innerRefRegex, innerScopeRegex);
          }
          if (typeof item === 'object' && item !== null) {
            return processObjectProperties(item, innerRefRegex, innerScopeRegex);
          }
          return item;
        });
      } else {
        result[key] = processObjectProperties(val as Record<string, unknown>, innerRefRegex, innerScopeRegex);
      }
    } else {
      result[key] = val;
    }
  }
  return result;
}

const ValueObjectParser = (
  value: ValueBody,
  innerRefRegex: RegExp,
  innerScopeRegex: RegExp
): ParseResult<ObjectParseResult> => {
  if (value.type !== 'object') {
    return {
      success: false,
      error: createError('ValueObjectParser', `type must be "object", got "${value.type}"`, '{{{ key: value, ... }}}'),
    };
  }

  const match = value.body.match(/^\{\{\{([\s\S]*)\}\}\}$/);
  if (!match) {
    return {
      success: false,
      error: createError('ValueObjectParser', `invalid body: "${value.body}"`, '{{{ key: value, ... }}}'),
    };
  }

  const content = match[1].trim();

  if (!content) {
    return {
      success: true,
      data: { _type: 'object', value: {} }
    };
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(`{${content}}`);
  } catch {
    try {
      let processedContent = content;
      processedContent = processedContent.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');
      processedContent = processedContent.replace(/(\[\s*)([a-zA-Z_$][a-zA-Z0-9_$.]*)(\s*[,\]])/g, (m, prefix, val, suffix) => {
        if (/^[\d.]+$/.test(val) || val === 'true' || val === 'false' || val === 'null') return m;
        return `${prefix}"${val}"${suffix}`;
      });
      processedContent = processedContent.replace(/(:\s*)([a-zA-Z_$][a-zA-Z0-9_$.]*)(\s*[,}]|\s*$)/g, (m, prefix, val, suffix) => {
        if (/^[\d.]+$/.test(val) || val === 'true' || val === 'false' || val === 'null') return m;
        return `${prefix}"${val}"${suffix}`;
      });
      parsed = JSON.parse(`{${processedContent}}`);
    } catch (e) {
      return {
        success: false,
        error: createError('ValueObjectParser', `cannot parse object: ${e instanceof Error ? e.message : String(e)}`, '{{{ key: value, ... }}}'),
      };
    }
  }

  const result = processObjectProperties(parsed, innerRefRegex, innerScopeRegex);

  return {
    success: true,
    data: { _type: 'object', value: result },
  };
};

const STRING_REGEX = /^'([\s\S]*)'$/;

const ValueConstraintParser = (value: ValueBody): ParseResult<StringParseData> => {
  if (value.type !== 'string') {
    return {
      success: false,
      error: createError('ValueConstraintParser', `type must be "string", got "${value.type}"`, "'string content'"),
    };
  }

  const match = value.body.match(STRING_REGEX);
  if (!match) {
    return {
      success: false,
      error: createError('ValueConstraintParser', `body must be wrapped in single quotes: "${value.body}"`, "'string content'"),
    };
  }

  return {
    success: true,
    data: { _type: 'string', value: match[1] },
  };
};

const ValueScopeParser = (
  value: ValueBody,
  scopeRegex: RegExp
): ParseResult<AbstractScopeParseData> => {
  if (value.type !== 'scope') {
    return {
      success: false,
      error: createError('ValueScopeParser', `type must be "scope", got "${value.type}"`, '{{$_[*]_variableName}}'),
    };
  }

  const match = value.body.match(scopeRegex);
  if (!match) {
    return {
      success: false,
      error: createError('ValueScopeParser', `invalid body: "${value.body}"`, '{{$_[*]_variableName}}'),
    };
  }

  return {
    success: true,
    data: { _type: 'scope', scope: match[1], variable: match[2] },
  };
};

const ValueReferenceParser = (
  value: ValueBody,
  referenceRegex: RegExp
): ParseResult<AbstractReferenceParseData> => {
  if (value.type !== 'reference') {
    return {
      success: false,
      error: createError('ValueReferenceParser', `type must be "reference", got "${value.type}"`, '{{ref_*_variableName}}'),
    };
  }

  const match = value.body.match(referenceRegex);
  if (!match) {
    return {
      success: false,
      error: createError('ValueReferenceParser', `invalid body: "${value.body}"`, '{{ref_*_variableName}}'),
    };
  }

  const fullPath = match[2];
  const dotIndex = fullPath.indexOf('.');
  if (dotIndex > 0) {
    return {
      success: true,
      data: {
        _type: 'reference',
        prefix: match[1],
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      },
    };
  }
  return {
    success: true,
    data: { _type: 'reference', prefix: match[1], variable: fullPath },
  };
};

const ValueExpressionParser = (
  value: ValueBody,
  referenceRegex: RegExp,
  scopeRegex: RegExp,
  innerRefRegex: RegExp,
  innerScopeRegex: RegExp
): ParseResult<ExpressionParseData> => {
  if (value.type !== 'expression') {
    return {
      success: false,
      error: createError('ValueExpressionParser', `type must be "expression", got "${value.type}"`, '{{ expression }}'),
    };
  }

  const match = value.body.match(EXPRESSION_REGEX);
  if (!match) {
    return {
      success: false,
      error: createError('ValueExpressionParser', `invalid body: "${value.body}"`, '{{ expression }}'),
    };
  }

  const trimmedExpression = match[1].trim();
  const parsedExpression = parseNestedReference(
    trimmedExpression,
    referenceRegex,
    scopeRegex,
    innerRefRegex,
    innerScopeRegex
  );

  return {
    success: true,
    data: { _type: 'expression', expression: parsedExpression },
  };
};

const ValueFunctionParser = (value: FunctionBody): ParseResult<FunctionParseData> => {
  if (value.type !== 'function') {
    return {
      success: false,
      error: createError('ValueFunctionParser', `type must be "function", got "${value.type}"`, '{{{params}}}, {{body}}'),
    };
  }

  const paramsMatch = value.params.match(FUNCTION_PARAMS_REGEX);
  if (!paramsMatch) {
    return {
      success: false,
      error: createError('ValueFunctionParser', `invalid params, expected triple braces: "${value.params}"`, '{{{params}}}'),
    };
  }

  const bodyMatch = value.body.match(FUNCTION_BODY_REGEX);
  if (!bodyMatch) {
    return {
      success: false,
      error: createError('ValueFunctionParser', `invalid body, expected double braces: "${value.body}"`, '{{body}}'),
    };
  }

  let parsedParams: Record<string, unknown>;
  const paramsContent = paramsMatch[1].trim();

  if (paramsContent === '') {
    parsedParams = {};
  } else {
    try {
      parsedParams = JSON.parse(paramsContent);
    } catch {
      return {
        success: false,
        error: createError('ValueFunctionParser', `invalid params JSON: "${paramsContent}"`, '{{{ "key": "value" }}}'),
      };
    }
  }

  return {
    success: true,
    data: { _type: 'function', params: parsedParams, body: bodyMatch[1] },
  };
};

function createTypeGuard<T extends { _type: string }>(
  type: T['_type']
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) return false;
    return (value as Record<string, unknown>)._type === type;
  };
}

const isScopeParseData = createTypeGuard<AbstractScopeParseData>('scope');
const isReferenceParseData = createTypeGuard<AbstractReferenceParseData>('reference');
const isExpressionParseData = createTypeGuard<ExpressionParseData>('expression');
const isFunctionParseData = createTypeGuard<FunctionParseData>('function');
const isStringParseData = createTypeGuard<StringParseData>('string');
const isObjectParseResult = createTypeGuard<ObjectParseResult>('object');

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
};

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
};
