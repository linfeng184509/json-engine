import type { ValueParserFn } from '@json-engine/core-engine';

export interface EChartsOptionParseResult {
  _type: 'echarts-option';
  option: any;
  autoResize?: boolean;
  theme?: string | object;
}

const EXPRESSION_REGEX = /^\{\{([\s\S]+)\}\}$/;

function processValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(EXPRESSION_REGEX);
    if (match) {
      return {
        _type: 'expression',
        expression: match[1].trim(),
      };
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => processValue(item));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = processValue(val);
    }
    return result;
  }

  return value;
}

export function createEChartsOptionParser(): ValueParserFn {
  return function parseEChartsOption(body: string): unknown {
    let parsed: unknown;

    if (typeof body !== 'string') {
      parsed = body;
    } else {
      try {
        parsed = JSON.parse(body);
      } catch (error) {
        throw new Error(
          `[EChartsOptionParser] Failed to parse option: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const processedOption = processValue(parsed);

    return {
      _type: 'echarts-option',
      option: processedOption,
    };
  };
}

export const EChartsOptionParser = createEChartsOptionParser();