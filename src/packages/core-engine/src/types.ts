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

interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

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
  key: string;
  value: unknown;
}

type ParseDataType = StringParseData | ObjectParseResult | AbstractScopeParseData | AbstractReferenceParseData | ExpressionParseData | FunctionParseData;

const STRING_REGEX = /^'([\s\S]*)'$/;
const FUNCTION_PARAMS_REGEX = /^\{\{\{(.*)\}\}\}$/s;
const FUNCTION_BODY_REGEX = /^\{\{([\s\S]*)\}\}$/;
const OBJECT_REGEX = /^\{\{\{([^:]+):([\s\S]*)\}\}\}$/;
const EXPRESSION_REGEX = /^\{\{([\s\S]+)\}\}$/;

function createError(parserName: string, reason: string, example: string): Error {
  return new Error(`[${parserName}] 验证失败: ${reason}。期望格式: ${example}`);
}

function parseValue(rawValue: string): unknown {
  if (!rawValue) return rawValue;

  if (rawValue.startsWith('{{') && rawValue.endsWith('}}')) {
    return rawValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
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

const ValueObjectParser = (value: ValueBody): ParseResult<ObjectParseResult> => {
  if (value.type !== 'object') {
    throw createError('ValueObjectParser', `type 必须为 "object"，实际为 "${value.type}"`, '{{{键: 值}}}');
  }

  const match = value.body.match(OBJECT_REGEX);
  if (!match) {
    throw createError('ValueObjectParser', `body 格式不正确: "${value.body}"`, '{{{键: 值}}}');
  }

  const key = match[1].trim();
  const rawValue = match[2].trim();
  const parsedValue = parseValue(rawValue);

  return {
    success: true,
    data: { _type: 'object', key, value: parsedValue },
  };
};

const ValueConstraintParser = (value: ValueBody): ParseResult<StringParseData> => {
  if (value.type !== 'string') {
    throw createError('ValueConstraintParser', `type 必须为 "string"，实际为 "${value.type}"`, "'字符串内容'");
  }

  const match = value.body.match(STRING_REGEX);
  if (!match) {
    throw createError('ValueConstraintParser', `body 必须被单引号包裹: "${value.body}"`, "'字符串内容'");
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
    throw createError('ValueScopeParser', `type 必须为 "scope"，实际为 "${value.type}"`, '{{$_[*]_变量名}}');
  }

  const match = value.body.match(scopeRegex);
  if (!match) {
    throw createError('ValueScopeParser', `body 格式不正确: "${value.body}"`, '{{$_[*]_变量名}}');
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
    throw createError('ValueReferenceParser', `type 必须为 "reference"，实际为 "${value.type}"`, '{{ref_*_变量名}}');
  }

  const match = value.body.match(referenceRegex);
  if (!match) {
    throw createError('ValueReferenceParser', `body 格式不正确: "${value.body}"`, '{{ref_*_变量名}}');
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
    throw createError('ValueExpressionParser', `type 必须为 "expression"，实际为 "${value.type}"`, '{{ 表达式 }}');
  }

  const match = value.body.match(EXPRESSION_REGEX);
  if (!match) {
    throw createError('ValueExpressionParser', `body 格式不正确: "${value.body}"`, '{{ 表达式 }}');
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
    throw createError('ValueFunctionParser', `type 必须为 "function"，实际为 "${value.type}"`, '{{{参数对象}}}, {{函数体}}');
  }

  const paramsMatch = value.params.match(FUNCTION_PARAMS_REGEX);
  if (!paramsMatch) {
    throw createError('ValueFunctionParser', `params 格式不正确，期望三花括号: "${value.params}"`, '{{{参数对象}}}');
  }

  const bodyMatch = value.body.match(FUNCTION_BODY_REGEX);
  if (!bodyMatch) {
    throw createError('ValueFunctionParser', `body 格式不正确，期望双花括号: "${value.body}"`, '{{函数体}}');
  }

  let parsedParams: Record<string, unknown>;
  const paramsContent = paramsMatch[1].trim();

  if (paramsContent === '') {
    parsedParams = {};
  } else {
    try {
      parsedParams = JSON.parse(paramsContent);
    } catch {
      throw createError('ValueFunctionParser', `params JSON 解析失败: "${paramsContent}"`, '{{{ "key": "value" }}}');
    }
  }

  return {
    success: true,
    data: { _type: 'function', params: parsedParams, body: bodyMatch[1] },
  };
};

function isScopeParseData(value: unknown): value is AbstractScopeParseData {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'scope';
}

function isReferenceParseData(value: unknown): value is AbstractReferenceParseData {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'reference';
}

function isExpressionParseData(value: unknown): value is ExpressionParseData {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'expression';
}

function isFunctionParseData(value: unknown): value is FunctionParseData {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'function';
}

function isStringParseData(value: unknown): value is StringParseData {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'string';
}

function isObjectParseResult(value: unknown): value is ObjectParseResult {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'object';
}

export {
  createError,
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
  ObjectParseData,
  ObjectParseResult,
  AbstractScopeParseData,
  AbstractReferenceParseData,
  ExpressionParseData,
  StringParseData,
  FunctionParseData,
  ParseDataType,
};
