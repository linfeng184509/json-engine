import { describe, it, expect, vi } from 'vitest';
import { parseJson, createParserConfig } from './parseJson';
import { createDebugTracer } from './debug';
import type { ParseTrace } from './debug';

describe('DSL Node Tracing', () => {
  describe('basic tracing', () => {
    it('should trace reference nodes', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        referencePrefixes: ['state'],
        scopeNames: ['core'],
        debug: {
          enabled: true,
          logLevel: 'debug',
          onTrace: (trace) => traces.push(trace),
        },
      });

      const input = {
        user: { $ref: 'state.userName' },
      };

      const result = parseJson(input, config);

      expect(result).toBeDefined();
      
      const rootTrace = traces.find(t => t.path === 'root');
      expect(rootTrace).toBeDefined();
      expect(rootTrace?.parser).toBe('parseJson');
      
      const refTrace = traces.find(t => t.parser === 'walkJson:reference');
      expect(refTrace).toBeDefined();
      expect(refTrace?.path).toBe('user');
    });

    it('should trace expression nodes', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const input = {
        count: { $expr: 'state.count + 1' },
      };

      const result = parseJson(input, config);

      expect(result).toBeDefined();
      
      const exprTrace = traces.find(t => t.parser === 'walkJson:expression');
      expect(exprTrace).toBeDefined();
      expect(exprTrace?.path).toBe('count');
    });

    it('should trace function nodes', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const input = {
        onClick: { $fn: { params: [], body: 'console.log("click")' } },
      };

      const result = parseJson(input, config);

      expect(result).toBeDefined();
      
      const fnTrace = traces.find(t => t.parser === 'walkJson:function');
      expect(fnTrace).toBeDefined();
      expect(fnTrace?.path).toBe('onClick');
    });

    it('should NOT trace non-DSL nodes', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const input = {
        name: 'John Doe',
        age: 30,
        metadata: {
          role: 'admin',
        },
      };

      const result = parseJson(input, config);

      expect(result).toBeDefined();
      
      const rootTrace = traces.find(t => t.path === 'root');
      expect(rootTrace).toBeDefined();
      
      const nonDSLTraces = traces.filter(t => 
        !t.parser.includes('walkJson:') && t.path !== 'root'
      );
      expect(nonDSLTraces.length).toBe(0);
    });

    it('should trace nested DSL nodes', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        referencePrefixes: ['state'],
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const input = {
        header: {
          title: { $ref: 'state.title' },
        },
      };

      const result = parseJson(input, config);

      expect(result).toBeDefined();
      
      const nestedRefTrace = traces.find(t => 
        t.parser === 'walkJson:reference' && t.path === 'header.title'
      );
      expect(nestedRefTrace).toBeDefined();
    });

    it('should trace DSL nodes in arrays', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        referencePrefixes: ['state'],
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const input = {
        items: [
          { $ref: 'state.items[0]' },
          { $expr: 'state.count' },
        ],
      };

      const result = parseJson(input, config);

      expect(result).toBeDefined();
      
      const arrayRefTrace = traces.find(t => 
        t.parser === 'walkJson:reference' && t.path === 'items[0]'
      );
      expect(arrayRefTrace).toBeDefined();
      
      const arrayExprTrace = traces.find(t => 
        t.parser === 'walkJson:expression' && t.path === 'items[1]'
      );
      expect(arrayExprTrace).toBeDefined();
    });
  });

  describe('error tracing', () => {
    it('should trace errors in DSL nodes', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const invalidInput = {
        value: { type: 'reference', body: '{{invalid_ref}}' },
      };

      expect(() => parseJson(invalidInput, config)).toThrow();
      
      const errorTrace = traces.find(t => 
        t.parser === 'walkJson' && t.output instanceof Error
      );
      expect(errorTrace).toBeDefined();
    });

    it('should trace root errors', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        debug: {
          enabled: true,
          onTrace: (trace) => traces.push(trace),
        },
      });

      const invalidInput = {
        value: { type: 'reference', body: '{{invalid_ref}}' },
      };

      expect(() => parseJson(invalidInput, config)).toThrow();
      
      const rootErrorTrace = traces.find(t => 
        t.parser === 'parseJson' && t.output instanceof Error
      );
      expect(rootErrorTrace).toBeDefined();
    });
  });

  describe('disabled tracing', () => {
    it('should not trace when disabled', () => {
      const traces: ParseTrace[] = [];
      
      const config = createParserConfig({
        debug: {
          enabled: false,
        },
      });

      const input = { 
        user: { $ref: 'state.userName' },
        count: { $expr: 'state.count + 1' },
      };
      
      const result = parseJson(input, config);

      expect(result).toBeDefined();
      expect(traces.length).toBe(0);
    });

    it('should work without debug config', () => {
      const config = createParserConfig();

      const input = { 
        user: { $ref: 'state.userName' },
      };
      
      const result = parseJson(input, config);

      expect(result).toBeDefined();
    });
  });
});

describe('DebugTracer standalone', () => {
  describe('performance analysis', () => {
    it('should collect slow traces', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      tracer.startTrace('slow-op', {}, 'test');
      const start = performance.now();
      while (performance.now() - start < 15) {
      }
      tracer.endTrace({ path: 'slow-op', input: {}, parser: 'test', startTime: start }, 'result');
      
      tracer.startTrace('fast-op', {}, 'test');
      tracer.endTrace({ path: 'fast-op', input: {}, parser: 'test', startTime: performance.now() }, 'result');
      
      const slowTraces = tracer.getSlowTraces(10);
      expect(slowTraces.length).toBeGreaterThan(0);
      expect(slowTraces[0].path).toBe('slow-op');
    });

    it('should calculate total and average duration', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      for (let i = 0; i < 5; i++) {
        const ctx = tracer.startTrace(`op-${i}`, {}, 'test');
        tracer.endTrace(ctx, `result-${i}`);
      }
      
      const total = tracer.getTotalDuration();
      const avg = tracer.getAverageDuration();
      
      expect(total).toBeGreaterThanOrEqual(0);
      expect(avg).toBeGreaterThanOrEqual(0);
      expect(tracer.size()).toBe(5);
    });
  });

  describe('trace filtering', () => {
    it('should filter traces by path', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      const ctx1 = tracer.startTrace('path.a', {}, 'test');
      tracer.endTrace(ctx1, 'result');
      
      const ctx2 = tracer.startTrace('path.b', {}, 'test');
      tracer.endTrace(ctx2, 'result');
      
      const ctx3 = tracer.startTrace('other.c', {}, 'test');
      tracer.endTrace(ctx3, 'result');
      
      const pathTraces = tracer.getTracesByPath('path.a');
      expect(pathTraces.length).toBe(1);
      expect(pathTraces[0].path).toBe('path.a');
    });

    it('should filter traces by parser', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      const ctx1 = tracer.startTrace('op1', {}, 'parseValue');
      tracer.endTrace(ctx1, 'result');
      
      const ctx2 = tracer.startTrace('op2', {}, 'parseJson');
      tracer.endTrace(ctx2, 'result');
      
      const parserTraces = tracer.getTracesByParser('parseValue');
      expect(parserTraces.length).toBe(1);
      expect(parserTraces[0].parser).toBe('parseValue');
    });
  });

  describe('trace management', () => {
    it('should clear traces', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      const ctx = tracer.startTrace('test', {}, 'test');
      tracer.endTrace(ctx, 'result');
      
      expect(tracer.size()).toBe(1);
      
      tracer.clear();
      expect(tracer.size()).toBe(0);
    });

    it('should export and import traces', () => {
      const tracer1 = createDebugTracer({ enabled: true });
      
      const ctx = tracer1.startTrace('test', { input: 'data' }, 'test');
      tracer1.endTrace(ctx, { output: 'result' });
      
      const exported = tracer1.exportTraces();
      expect(exported).toContain('test');
      
      const tracer2 = createDebugTracer({ enabled: true });
      tracer2.importTraces(exported);
      
      expect(tracer2.size()).toBe(1);
      expect(tracer2.getTraces()[0].path).toBe('test');
    });

    it('should handle invalid JSON import', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      tracer.importTraces('invalid json');
      
      expect(tracer.size()).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should toggle enabled state', () => {
      const tracer = createDebugTracer({ enabled: false });
      
      expect(tracer.isEnabled()).toBe(false);
      
      tracer.setEnabled(true);
      expect(tracer.isEnabled()).toBe(true);
      
      tracer.setEnabled(false);
      expect(tracer.isEnabled()).toBe(false);
    });

    it('should change log level', () => {
      const tracer = createDebugTracer({ enabled: true, logLevel: 'error' });
      
      tracer.setLogLevel('debug');
      
      expect(() => tracer.setLogLevel('info')).not.toThrow();
    });

    it('should update onTrace callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const tracer = createDebugTracer({
        enabled: true,
        onTrace: callback1,
      });
      
      tracer.setOnTrace(callback2);
      
      const ctx = tracer.startTrace('test', {}, 'test');
      tracer.endTrace(ctx, 'result');
      
      expect(callback2).toHaveBeenCalled();
      expect(callback1).not.toHaveBeenCalled();
    });
  });

  describe('trace data structure', () => {
    it('should capture complete trace information', () => {
      const tracer = createDebugTracer({ enabled: true });
      
      const input = { test: 'data' };
      const output = { result: 'success' };
      
      const ctx = tracer.startTrace('test-path', input, 'test-parser');
      tracer.endTrace(ctx, output);
      
      const traces = tracer.getTraces();
      expect(traces.length).toBe(1);
      
      const trace = traces[0];
      expect(trace.path).toBe('test-path');
      expect(trace.input).toEqual(input);
      expect(trace.output).toEqual(output);
      expect(trace.parser).toBe('test-parser');
      expect(trace.duration).toBeGreaterThanOrEqual(0);
      expect(trace.timestamp).toBeGreaterThan(0);
    });
  });
});