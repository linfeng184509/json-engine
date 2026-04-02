import {
  createParserConfig,
  ValueReferenceParser,
  createReferenceRegex,
  type ParserConfig,
  type ParserOptions,
  type ValueBody,
} from '@json-engine/core-engine';

const VUE_REFERENCE_PREFIXES = ['props', 'state', 'computed'];
const VUE_SCOPE_NAMES = ['core', 'goal'];

function stateValueParser(body: string): unknown {
  const regex = createReferenceRegex(['state']);
  const valueBody: ValueBody = { type: 'reference', body };
  try {
    const result = ValueReferenceParser(valueBody, regex);
    if (result.success && result.data) {
      return result.data;
    }
  } catch {
    // Fallback: try to parse body directly
  }
  const match = body.match(/^\{\{ref_state_(.+)\}\}$/);
  if (match) {
    const fullPath = match[1];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'reference',
        prefix: 'state',
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'reference', prefix: 'state', variable: fullPath };
  }
  return { _type: 'reference', prefix: 'state', variable: body };
}

function propsValueParser(body: string): unknown {
  const regex = createReferenceRegex(['props']);
  const valueBody: ValueBody = { type: 'reference', body };
  try {
    const result = ValueReferenceParser(valueBody, regex);
    if (result.success && result.data) {
      return result.data;
    }
  } catch {
    // Fallback: try to parse body directly
  }
  const match = body.match(/^\{\{ref_props_(.+)\}\}$/);
  if (match) {
    const fullPath = match[1];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'reference',
        prefix: 'props',
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'reference', prefix: 'props', variable: fullPath };
  }
  return { _type: 'reference', prefix: 'props', variable: body };
}

function importValueParser(body: string): unknown {
  return { _type: 'import', path: body };
}

const vueParserConfig: ParserConfig = createParserConfig({
  referencePrefixes: VUE_REFERENCE_PREFIXES,
  scopeNames: VUE_SCOPE_NAMES,
  valueParsers: {
    state: stateValueParser,
    props: propsValueParser,
    import: importValueParser,
  },
  debug: {
    enabled: true,
    logLevel: 'debug',
    onTrace: (trace) => {
      console.log(
        `[DebugTrace] ${trace.parser} | ${trace.path} | ${trace.duration.toFixed(2)}ms`,
        trace.duration > 10 ? '⚠️ SLOW' : ''
      );
    },
  },
});

export { vueParserConfig, createParserConfig };
export type { ParserConfig, ParserOptions };