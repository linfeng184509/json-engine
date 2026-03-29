import { parseJson } from '@json-engine/core-engine';
import type {
  VueJsonSchema,
  VueJsonSchemaInput,
  ParsedSchema,
  ParseResult,
  ParserContext,
  ExpressionValue,
  StateRef,
  PropsRef,
  ScopeRef,
  FunctionValue,
  PropertyValue,
  InitialValue,
} from '../types';
import { SchemaParseError, ValidationError } from '../utils/error';
import { parseProps } from './props-parser';
import { parseEmits } from './emits-parser';
import { parseState } from './state-parser';
import { parseComputed } from './computed-parser';
import { parseMethods } from './methods-parser';
import { parseWatch } from './watch-parser';
import { parseProvide, parseInject } from './provide-inject-parser';
import { parseLifecycle } from './lifecycle-parser';
import { parseComponents } from './components-parser';
import { parseRender } from './render-parser';
import { registerDefaultKeyParsers } from './key-parsers';

// 结构化类型的 type 值
const STRUCTURED_TYPE_VALUES = new Set([
  'expression',
  'state',
  'props',
  'scope',
  'function',
  'string',
  'object',
]);

// 需要添加类型标记的 type 值
const TYPE_MARKERS = new Set([
  'expression',
  'state',
  'props',
  'scope',
  'function',
]);

/**
 * 检查对象是否是结构化类型
 * 结构化类型必须有 type 字段和对应的 body/params 字段
 */
function isStructuredType(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  const type = record['type'];
  if (typeof type !== 'string' || !STRUCTURED_TYPE_VALUES.has(type)) {
    return false;
  }

  // 根据类型检查必要的字段
  switch (type) {
    case 'function':
      return 'params' in record && 'body' in record;
    case 'expression':
    case 'state':
    case 'props':
    case 'scope':
    case 'string':
    case 'object':
      return 'body' in record;
    default:
      return false;
  }
}

/**
 * 递归处理 Schema，为结构化类型添加 _type 标记
 * 同时处理 parseJson 不会处理的情况（如顶层对象）
 */
function processSchemaWithMarkers(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => processSchemaWithMarkers(item));
  }

  const obj = data as Record<string, unknown>;

  // 检查是否是结构化类型
  if (isStructuredType(obj)) {
    const type = obj['type'] as string;

    // 根据类型进行处理
    switch (type) {
      case 'function': {
        // 处理 function 类型
        const params = String(obj['params'] || '');
        const body = String(obj['body'] || '');
        return {
          _type: 'function',
          params: parseFunctionParams(params),
          body: parseFunctionBody(body),
        };
      }
      case 'expression': {
        // 处理 expression 类型
        const body = String(obj['body'] || '');
        return {
          _type: 'expression',
          expression: parseExpressionBody(body),
        };
      }
      case 'state': {
        // 处理 state 类型
        const body = String(obj['body'] || '');
        return {
          _type: 'state',
          variable: parseReferenceBody(body, 'state'),
        };
      }
      case 'props': {
        // 处理 props 类型
        const body = String(obj['body'] || '');
        return {
          _type: 'props',
          variable: parseReferenceBody(body, 'props'),
        };
      }
      case 'scope': {
        // 处理 scope 类型
        const body = String(obj['body'] || '');
        const match = body.match(/^\{\{\$_\[(core|goal)\]_(.+)\}\}$/);
        if (match) {
          return {
            _type: 'scope',
            scope: match[1],
            variable: match[2],
          };
        }
        return obj;
      }
      case 'string': {
        // 处理 string 类型
        const body = String(obj['body'] || '');
        const match = body.match(/^'([\s\S]*)'$/);
        if (match) {
          return match[1];
        }
        return obj;
      }
      case 'object': {
        // 处理 object 类型
        return obj;
      }
    }
  }

  // 递归处理对象的每个字段
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = processSchemaWithMarkers(value);
  }
  return result;
}

/**
 * 解析 function 的 params 字段
 */
function parseFunctionParams(params: string): Record<string, unknown> {
  // params 格式: {{{ JSON }}} 或 {{{}}}
  const match = params.match(/^\{\{\{(.*)\}\}\}$/s);
  if (!match) {
    return {};
  }
  const content = match[1].trim();
  if (content === '') {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * 解析 function 的 body 字段
 */
function parseFunctionBody(body: string): string {
  // body 格式: {{ 函数体 }}
  const match = body.match(/^\{\{([\s\S]*)\}\}$/);
  if (!match) {
    return body;
  }
  return match[1];
}

/**
 * 解析 expression 的 body 字段
 */
function parseExpressionBody(body: string): string {
  // body 格式: {{ 表达式 }}
  const match = body.match(/^\{\{([\s\S]+)\}\}$/);
  if (!match) {
    return body;
  }
  return match[1].trim();
}

/**
 * 解析 state/props 的 body 字段，提取变量名
 */
function parseReferenceBody(body: string, type: 'state' | 'props'): string {
  const regex = type === 'state'
    ? /^\{\{ref_state_(.+)\}\}$/
    : /^\{\{ref_props_(.+)\}\}$/;
  const match = body.match(regex);
  if (match) {
    return match[1];
  }
  return body;
}

function createParserContext(schema: VueJsonSchema): ParserContext {
  return {
    schema,
    errors: [],
    warnings: [],
  };
}

function validateSchemaStructure(data: unknown): data is VueJsonSchema {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('', 'Schema must be an object');
  }

  const schema = data as Record<string, unknown>;

  if (typeof schema.name !== 'string' || !schema.name.trim()) {
    throw new ValidationError('name', 'Schema must have a valid "name" string');
  }

  if (!schema.render) {
    throw new ValidationError('render', 'Schema must have a "render" property');
  }

  const render = schema.render as Record<string, unknown>;
  if (!render.type || !['template', 'function'].includes(render.type as string)) {
    throw new ValidationError('render.type', 'Render type must be "template" or "function"');
  }

  return true;
}

export function parseSchema(input: VueJsonSchemaInput): ParseResult<ParsedSchema> {
  const context: ParserContext = createParserContext({} as VueJsonSchema);

  try {
    let json: unknown;

    if (typeof input === 'string') {
      try {
        json = JSON.parse(input);
      } catch (e) {
        throw new SchemaParseError('', `Invalid JSON string: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      json = input;
    }

    // 注册 KeyParser
    registerDefaultKeyParsers();

    // 处理 Schema，为结构化类型添加 _type 标记
    const typed = processSchemaWithMarkers(json) as VueJsonSchema;

    validateSchemaStructure(typed);
    context.schema = typed;

    const result: ParsedSchema = {
      name: typed.name,
      props: typed.props ? parseProps(typed.props, context) : undefined,
      emits: typed.emits ? parseEmits(typed.emits, context) : undefined,
      state: typed.state ? parseState(typed.state, context) : undefined,
      computed: typed.computed ? parseComputed(typed.computed, context) : undefined,
      methods: typed.methods ? parseMethods(typed.methods, context) : undefined,
      watch: typed.watch ? parseWatch(typed.watch, context) : undefined,
      provide: typed.provide ? parseProvide(typed.provide, context) : undefined,
      inject: typed.inject ? parseInject(typed.inject, context) : undefined,
      lifecycle: typed.lifecycle ? parseLifecycle(typed.lifecycle, context) : undefined,
      components: typed.components ? parseComponents(typed.components, context) : undefined,
      render: parseRender(typed.render, context),
      styles: typed.styles,
    };

    if (context.errors.length > 0) {
      return {
        success: false,
        errors: context.errors,
        warnings: context.warnings.length > 0 ? context.warnings : undefined,
      };
    }

    return {
      success: true,
      data: result,
      warnings: context.warnings.length > 0 ? context.warnings : undefined,
    };
  } catch (error) {
    if (error instanceof SchemaParseError || error instanceof ValidationError) {
      context.errors.push({
        path: error.path,
        message: error.message,
        value: error instanceof ValidationError ? error.actualValue : undefined,
      });
    } else {
      context.errors.push({
        path: '',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      success: false,
      errors: context.errors,
    };
  }
}

export { parseProps } from './props-parser';
export { parseEmits } from './emits-parser';
export { parseState } from './state-parser';
export { parseComputed } from './computed-parser';
export { parseMethods } from './methods-parser';
export { parseWatch } from './watch-parser';
export { parseProvide, parseInject } from './provide-inject-parser';
export { parseLifecycle } from './lifecycle-parser';
export { parseComponents } from './components-parser';
export { parseRender } from './render-parser';
export { registerDefaultKeyParsers, unregisterDefaultKeyParsers } from './key-parsers';
