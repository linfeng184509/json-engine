import { describe, it, expect } from 'vitest';
import { createEChartsOptionParser } from './echarts-option-parser';

describe('EChartsOptionParser', () => {
  const parseEChartsOption = createEChartsOptionParser();

  it('should parse echarts option string', () => {
    const input = JSON.stringify({
      xAxis: { type: 'category', data: ['A', 'B', 'C'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [1, 2, 3] }],
    });

    const result = parseEChartsOption(input);

    expect(result).toEqual({
      _type: 'echarts-option',
      option: {
        xAxis: { type: 'category', data: ['A', 'B', 'C'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [1, 2, 3] }],
      },
    });
  });

  it('should throw on invalid JSON string', () => {
    const input = 'not valid json';
    expect(() => parseEChartsOption(input)).toThrow('[EChartsOptionParser]');
  });

  it('should handle non-string input (object)', () => {
    const input = { xAxis: { type: 'category' } };
    const result = parseEChartsOption(input as any);

    expect(result).toEqual({
      _type: 'echarts-option',
      option: { xAxis: { type: 'category' } },
    });
  });

  it('should handle empty object', () => {
    const input = JSON.stringify({});
    const result = parseEChartsOption(input);

    expect(result).toEqual({
      _type: 'echarts-option',
      option: {},
    });
  });
});
