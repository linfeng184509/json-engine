import { createParserConfig, type ParserConfig, type ParserOptions } from '@json-engine/core-engine';
import { createEChartsOptionParser } from '../parser/echarts-option-parser';

const VUE_REFERENCE_PREFIXES = ['props', 'state', 'computed'];
const VUE_SCOPE_NAMES = ['core', 'goal'];

export function createVueParserConfig(options?: ParserOptions): ParserConfig {
  const config = createParserConfig({
    referencePrefixes: VUE_REFERENCE_PREFIXES,
    scopeNames: VUE_SCOPE_NAMES,
    ...options,
  });

  // Register ECharts option parser
  const echartsParser = createEChartsOptionParser();
  config.valueParsers['echarts-option'] = echartsParser;

  return config;
}

export const vueParserConfig = createVueParserConfig();

export type { ParserConfig, ParserOptions };
