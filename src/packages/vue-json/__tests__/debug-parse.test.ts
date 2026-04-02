import { describe, it, expect } from 'vitest';
import { parseJson } from '@json-engine/core-engine';

describe('debug parseJson', () => {
  it('should parse render with function type - debug', () => {
    const content = {
      type: 'function',
      $fn: {
        params: {},
        body: 'return h("div");',
      },
    };
    
    const contentResult = parseJson(content) as any;
    console.log('Content Result:', JSON.stringify(contentResult, null, 2));
    expect(contentResult).toBeDefined();
  });

  it('should parse expression type', () => {
    const content = {
      type: 'expression',
      expression: '$state.count',
    };
    
    const contentResult = parseJson(content) as any;
    console.log('Expression Result:', JSON.stringify(contentResult, null, 2));
    expect(contentResult).toBeDefined();
  });

  it('should parse function params directly', () => {
    const content = {
      type: 'function',
      $fn: {
        params: {},
        body: 'return h("div");',
      },
    };
    
    console.log('Before parseJson:', JSON.stringify(content, null, 2));
    const result = parseJson(content) as any;
    console.log('After parseJson:', JSON.stringify(result, null, 2));
    console.log('params type:', typeof result.params);
    console.log('params value:', result.params);
    expect(result).toBeDefined();
  });
});
