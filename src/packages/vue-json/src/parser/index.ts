import type { VueJsonSchema, VueJsonSchemaInput, ParsedSchema, ParseResult, ParserContext } from '../types';
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
    let schema: VueJsonSchema;

    registerDefaultKeyParsers();

    if (typeof input === 'string') {
      try {
        schema = JSON.parse(input);
      } catch (e) {
        throw new SchemaParseError('', `Invalid JSON string: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      schema = input;
    }

    validateSchemaStructure(schema);
    context.schema = schema;

    const result: ParsedSchema = {
      name: schema.name,
      props: schema.props ? parseProps(schema.props, context) : undefined,
      emits: schema.emits ? parseEmits(schema.emits, context) : undefined,
      state: schema.state ? parseState(schema.state, context) : undefined,
      computed: schema.computed ? parseComputed(schema.computed, context) : undefined,
      methods: schema.methods ? parseMethods(schema.methods, context) : undefined,
      watch: schema.watch ? parseWatch(schema.watch, context) : undefined,
      provide: schema.provide ? parseProvide(schema.provide, context) : undefined,
      inject: schema.inject ? parseInject(schema.inject, context) : undefined,
      lifecycle: schema.lifecycle ? parseLifecycle(schema.lifecycle, context) : undefined,
      components: schema.components ? parseComponents(schema.components, context) : undefined,
      render: parseRender(schema.render, context),
      styles: schema.styles,
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