interface KeyLifeParser {
  name: string;
  params: Record<string, unknown>;
  parseRule: Function;
  valueType: 'function';
}

interface KeyEventParser {
  name: string;
  params: Record<string, unknown>;
  parseRule: Function;
  valueType: 'function';
}

interface KeyAttrParser {
  name: string;
  parseRule: Function;
  valueType: 'string' | 'expression' | 'scope' | 'props' | 'state' | 'object';
}

interface FunctionBody {
  type: 'function';
  params: string;
  body: string;
}

interface ValueBody {
  type: 'string' | 'scope' | 'props' | 'state' | 'expression' | 'object';
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

interface ScopeParseData {
  scope: 'core' | 'goal';
  variable: string;
}

interface VariableParseData {
  variable: string;
}

interface NestedReferenceData {
  type: 'scope' | 'props' | 'state';
  variable: string;
  scope?: 'core' | 'goal';
}

type NestedReferenceResult = string | NestedReferenceData;

interface ExpressionParseData {
  expression: NestedReferenceResult;
}

interface StringParseData {
  value: string;
}

interface FunctionParseData {
  params: Record<string, unknown>;
  body: string;
}

const OBJECT_REGEX = /^\{\{\{\[([^\]]+)\]:\[([\s\S]*)\]\}\}\}$/;
const SCOPE_REGEX = /^\{\{\$_\[(core|goal)\]_(.+)\}\}$/;
const PROPS_REGEX = /^\{\{ref_props_(.+)\}\}$/;
const STATE_REGEX = /^\{\{ref_state_(.+)\}\}$/;
const EXPRESSION_REGEX = /^\{\{([\s\S]+)\}\}$/;
const STRING_REGEX = /^'([\s\S]*)'$/;
const FUNCTION_PARAMS_REGEX = /^\{\{\{(.*)\}\}\}$/s;
const FUNCTION_BODY_REGEX = /^\{\{([\s\S]*)\}\}$/;

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

function parseNestedReference(content: string): NestedReferenceResult {
  if (!content) return content;

  const scopeMatch = content.match(SCOPE_REGEX);
  if (scopeMatch) {
    return { type: 'scope', scope: scopeMatch[1] as 'core' | 'goal', variable: scopeMatch[2] };
  }

  const propsMatch = content.match(PROPS_REGEX);
  if (propsMatch) {
    return { type: 'props', variable: propsMatch[1] };
  }

  const stateMatch = content.match(STATE_REGEX);
  if (stateMatch) {
    return { type: 'state', variable: stateMatch[1] };
  }

  const innerScopeMatch = content.match(/^\$_\[(core|goal)\]_([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
  if (innerScopeMatch) {
    return { type: 'scope', scope: innerScopeMatch[1] as 'core' | 'goal', variable: innerScopeMatch[2] };
  }

  const innerPropsMatch = content.match(/^ref_props_([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
  if (innerPropsMatch) {
    return { type: 'props', variable: innerPropsMatch[1] };
  }

  const innerStateMatch = content.match(/^ref_state_([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
  if (innerStateMatch) {
    return { type: 'state', variable: innerStateMatch[1] };
  }

  return content;
}

const ValueObjectParser = (value: ValueBody): ParseResult<ObjectParseData> => {
  if (value.type !== 'object') {
    throw createError('ValueObjectParser', `type 必须为 "object"，实际为 "${value.type}"`, '{{{[键]:[值]}}}');
  }

  const match = value.body.match(OBJECT_REGEX);
  if (!match) {
    throw createError('ValueObjectParser', `body 格式不正确: "${value.body}"`, '{{{[键]:[值]}}}');
  }

  const key = match[1];
  const rawValue = match[2];
  const parsedValue = parseValue(rawValue);

  return {
    success: true,
    data: { key, value: parsedValue },
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
    data: { value: match[1] },
  };
};

const ValueScopeParser = (value: ValueBody): ParseResult<ScopeParseData> => {
  if (value.type !== 'scope') {
    throw createError('ValueScopeParser', `type 必须为 "scope"，实际为 "${value.type}"`, '{{$_[core|goal]_变量名}}');
  }

  const match = value.body.match(SCOPE_REGEX);
  if (!match) {
    throw createError('ValueScopeParser', `body 格式不正确: "${value.body}"`, '{{$_[core|goal]_变量名}}');
  }

  return {
    success: true,
    data: { scope: match[1] as 'core' | 'goal', variable: match[2] },
  };
};

const ValuePropsParser = (value: ValueBody): ParseResult<VariableParseData> => {
  if (value.type !== 'props') {
    throw createError('ValuePropsParser', `type 必须为 "props"，实际为 "${value.type}"`, '{{ref_props_变量名}}');
  }

  const match = value.body.match(PROPS_REGEX);
  if (!match) {
    throw createError('ValuePropsParser', `body 格式不正确: "${value.body}"`, '{{ref_props_变量名}}');
  }

  return {
    success: true,
    data: { variable: match[1] },
  };
};

const ValueStateParser = (value: ValueBody): ParseResult<VariableParseData> => {
  if (value.type !== 'state') {
    throw createError('ValueStateParser', `type 必须为 "state"，实际为 "${value.type}"`, '{{ref_state_变量名}}');
  }

  const match = value.body.match(STATE_REGEX);
  if (!match) {
    throw createError('ValueStateParser', `body 格式不正确: "${value.body}"`, '{{ref_state_变量名}}');
  }

  return {
    success: true,
    data: { variable: match[1] },
  };
};

const ValueExpressionParser = (value: ValueBody): ParseResult<ExpressionParseData> => {
  if (value.type !== 'expression') {
    throw createError('ValueExpressionParser', `type 必须为 "expression"，实际为 "${value.type}"`, '{{ 表达式 }}');
  }

  const match = value.body.match(EXPRESSION_REGEX);
  if (!match) {
    throw createError('ValueExpressionParser', `body 格式不正确: "${value.body}"`, '{{ 表达式 }}');
  }

  const trimmedExpression = match[1].trim();
  const parsedExpression = parseNestedReference(trimmedExpression);

  return {
    success: true,
    data: { expression: parsedExpression },
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
    data: { params: parsedParams, body: bodyMatch[1] },
  };
};

export type {
  KeyLifeParser,
  KeyEventParser,
  KeyAttrParser,
  FunctionBody,
  ValueBody,
  ParseResult,
  ObjectParseData,
  ScopeParseData,
  VariableParseData,
  ExpressionParseData,
  StringParseData,
  FunctionParseData,
  NestedReferenceData,
  NestedReferenceResult,
};

export {
  ValueObjectParser,
  ValueConstraintParser,
  ValueScopeParser,
  ValuePropsParser,
  ValueStateParser,
  ValueExpressionParser,
  ValueFunctionParser,
  parseNestedReference,
};