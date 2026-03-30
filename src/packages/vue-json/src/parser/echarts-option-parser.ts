import type { ValueParserFn } from '@json-engine/core-engine';

export interface EChartsOptionParseResult {
  _type: 'echarts-option';
  option: any;
  autoResize?: boolean;
  theme?: string | object;
}

/**
 * ECharts 配置值解析器函数
 * 解析格式：{ type: 'echarts-option', body: { ... } }
 */
export function createEChartsOptionParser(): ValueParserFn {
  return function parseEChartsOption(body: string): unknown {
    if (typeof body !== 'string') {
      return {
        _type: 'echarts-option',
        option: body,
      };
    }

    try {
      const parsed = JSON.parse(body);
      return {
        _type: 'echarts-option',
        option: parsed,
      };
    } catch (error) {
      throw new Error(
        `[EChartsOptionParser] Failed to parse option: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}

export const EChartsOptionParser = createEChartsOptionParser;
