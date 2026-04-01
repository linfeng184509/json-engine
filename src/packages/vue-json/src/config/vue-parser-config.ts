import {
  createParserConfig,
  parseJson,
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
      return {
        _type: 'state',
        variable: result.data.variable,
        path: result.data.path,
      };
    }
  } catch {
    // Fallback: treat body as variable name
  }
  const match = body.match(/^\{\{ref_state_(.+)\}\}$/);
  if (match) {
    const fullPath = match[1];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'state',
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'state', variable: fullPath };
  }
  return { _type: 'state', variable: body };
}

function propsValueParser(body: string): unknown {
  const regex = createReferenceRegex(['props']);
  const valueBody: ValueBody = { type: 'reference', body };
  try {
    const result = ValueReferenceParser(valueBody, regex);
    if (result.success && result.data) {
      return {
        _type: 'props',
        variable: result.data.variable,
        path: result.data.path,
      };
    }
  } catch {
    // Fallback: treat body as variable name
  }
  const match = body.match(/^\{\{ref_props_(.+)\}\}$/);
  if (match) {
    const fullPath = match[1];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'props',
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'props', variable: fullPath };
  }
  return { _type: 'props', variable: body };
}

function importValueParser(body: string): unknown {
  return { _type: 'import', path: body };
}

let vueParserConfig: ParserConfig;

function echartsOptionValueParser(body: string): unknown {
  try {
    const parsed = JSON.parse(body);
    const walked = parseJson(parsed, vueParserConfig);
    return { _type: 'echarts-option', option: walked };
  } catch {
    return { _type: 'echarts-option', option: body };
  }
}

vueParserConfig = createParserConfig({
  referencePrefixes: VUE_REFERENCE_PREFIXES,
  scopeNames: VUE_SCOPE_NAMES,
  valueParsers: {
    state: stateValueParser,
    props: propsValueParser,
    import: importValueParser,
    echartsOption: echartsOptionValueParser,
  },
});

export { vueParserConfig, createParserConfig };
export type { ParserConfig, ParserOptions };