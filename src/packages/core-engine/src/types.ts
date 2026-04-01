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

const STRING_REGEX = /^'([\s\S]*)'$/;
const FUNCTION_PARAMS_REGEX = /^\{\{\{(.*)\}\}\}$/s;
const FUNCTION_BODY_REGEX = /^\{\{([\s\S]*)\}\}$/;
const OBJECT_REGEX = /^\{\{\{([\s\S]*)\}\}\}$/;
const EXPRESSION_REGEX = /^\{\{([\s\S]+)\}\}$/;

function createError(parserName: string, reason: string, example: string): ParseError {
  return {
    code: 'PARSE_ERROR',
    parser: parserName,
    message: `[${parserName}] 验证失败: ${reason}。期望格式: ${example}`,
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
    return { _type: 'reference', prefix: innerRefMatch[1], variable: innerRefMatch[2] };
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
      error: createError('ValueObjectParser', `type 必须为 "object"，实际为 "${value.type}"`, '{{{ key: value, ... }}}'),
    };
  }

  const match = value.body.match(OBJECT_REGEX);
  if (!match) {
    return {
      success: false,
      error: createError('ValueObjectParser', `body 格式不正确: "${value.body}"`, '{{{ key: value, ... }}}'),
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
      
      processedContent = processedContent.replace(/(\[\s*)([a-zA-Z_$][a-zA-Z0-9_$.]*)(\s*[,\]])/g, (match, prefix, value, suffix) => {
        if (/^[\d.]+$/.test(value) || value === 'true' || value === 'false' || value === 'null') {
          return match;
        }
        return `${prefix}"${value}"${suffix}`;
      });
      
      processedContent = processedContent.replace(/(:\s*)([a-zA-Z_$][a-zA-Z0-9_$.]*)(\s*[,}]|\s*$)/g, (match, prefix, value, suffix) => {
        if (/^[\d.]+$/.test(value) || value === 'true' || value === 'false' || value === 'null') {
          return match;
        }
        return `${prefix}"${value}"${suffix}`;
      });

      parsed = JSON.parse(`{${processedContent}}`);
    } catch (e) {
      return {
        success: false,
        error: createError('ValueObjectParser', `无法解析对象内容: ${e instanceof Error ? e.message : String(e)}`, '{{{ key: value, ... }}}'),
      };
    }
  }

  const result = processObjectProperties(parsed, innerRefRegex, innerScopeRegex);

  return {
    success: true,
    data: { _type: 'object', value: result },
  };
};

const ValueConstraintParser = (value: ValueBody): ParseResult<StringParseData> => {
  if (value.type !== 'string') {
    return {
      success: false,
      error: createError('ValueConstraintParser', `type 必须为 "string"，实际为 "${value.type}"`, "'字符串内容'"),
    };
  }

  const match = value.body.match(STRING_REGEX);
  if (!match) {
    return {
      success: false,
      error: createError('ValueConstraintParser', `body 必须被单引号包裹: "${value.body}"`, "'字符串内容'"),
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
      error: createError('ValueScopeParser', `type 必须为 "scope"，实际为 "${value.type}"`, '{{$_[*]_变量名}}'),
    };
  }

  const match = value.body.match(scopeRegex);
  if (!match) {
    return {
      success: false,
      error: createError('ValueScopeParser', `body 格式不正确: "${value.body}"`, '{{$_[*]_变量名}}'),
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
      error: createError('ValueReferenceParser', `type 必须为 "reference"，实际为 "${value.type}"`, '{{ref_*_变量名}}'),
    };
  }

  const match = value.body.match(referenceRegex);
  if (!match) {
    return {
      success: false,
      error: createError('ValueReferenceParser', `body 格式不正确: "${value.body}"`, '{{ref_*_变量名}}'),
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
      error: createError('ValueExpressionParser', `type 必须为 "expression"，实际为 "${value.type}"`, '{{ 表达式 }}'),
    };
  }

  const match = value.body.match(EXPRESSION_REGEX);
  if (!match) {
    return {
      success: false,
      error: createError('ValueExpressionParser', `body 格式不正确: "${value.body}"`, '{{ 表达式 }}'),
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
      error: createError('ValueFunctionParser', `type 必须为 "function"，实际为 "${value.type}"`, '{{{参数对象}}}, {{函数体}}'),
    };
  }

  const paramsMatch = value.params.match(FUNCTION_PARAMS_REGEX);
  if (!paramsMatch) {
    return {
      success: false,
      error: createError('ValueFunctionParser', `params 格式不正确，期望三花括号: "${value.params}"`, '{{{参数对象}}}'),
    };
  }

  const bodyMatch = value.body.match(FUNCTION_BODY_REGEX);
  if (!bodyMatch) {
    return {
      success: false,
      error: createError('ValueFunctionParser', `body 格式不正确，期望双花括号: "${value.body}"`, '{{函数体}}'),
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
        error: createError('ValueFunctionParser', `params JSON 解析失败: "${paramsContent}"`, '{{{ "key": "value" }}}'),
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
