import { createParserConfig, type ParserConfig, type ParserOptions } from '@json-engine/core-engine';

const VUE_REFERENCE_PREFIXES = ['props', 'state', 'computed'];
const VUE_SCOPE_NAMES = ['core', 'goal'];

export function createVueParserConfig(options?: ParserOptions): ParserConfig {
  return createParserConfig({
    referencePrefixes: VUE_REFERENCE_PREFIXES,
    scopeNames: VUE_SCOPE_NAMES,
    ...options,
  });
}

export const vueParserConfig = createVueParserConfig();

export type { ParserConfig, ParserOptions };
