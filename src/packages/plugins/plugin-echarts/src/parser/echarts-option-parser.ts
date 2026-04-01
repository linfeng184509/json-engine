import type { ValueParserFn } from '@json-engine/core-engine';

export interface EChartsOptionParseResult {
  _type: 'echarts-option';
  option: unknown;
}

export function createEChartsOptionParser(): ValueParserFn {
  return function parseEChartsOption(body: string): unknown {
    try {
      const parsed = JSON.parse(body);
      return { _type: 'echarts-option', option: parsed };
    } catch {
      return { _type: 'echarts-option', option: body };
    }
  };
}

export const EChartsOptionParser = createEChartsOptionParser();