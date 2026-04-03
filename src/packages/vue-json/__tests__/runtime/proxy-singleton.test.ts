import { describe, it, expect, vi } from 'vitest';
import { h, ref } from 'vue';
import {
  applyVIf,
  applyVShow,
  applyVBind,
  applyVHtml,
  applyVText,
  applyVElseIf,
} from '../../src/runtime/directive-runtime';
import { createStateProxy } from '../../src/runtime/state-factory';
import type { VNodeDefinition, RenderContext, ExpressionValue } from '../../src/types';

describe('proxy singleton evaluation', () => {
  const baseState = { count: ref(42), message: ref('Hello') };
  const baseComputed = { doubled: ref(84) };

  const createContext = (withProxies = true): RenderContext => {
    const stateProxy = withProxies ? createStateProxy(baseState) : undefined;
    const computedProxy = withProxies ? createStateProxy(baseComputed as Record<string, ReturnType<typeof ref>>) : undefined;
    return {
      props: { title: 'Test' },
      state: baseState,
      computed: baseComputed,
      methods: {},
      components: {},
      slots: {},
      attrs: {},
      emit: () => {},
      provide: {},
      stateProxy,
      computedProxy,
    };
  };

  const createContextWithoutProxies = (): RenderContext => ({
    props: { title: 'Test' },
    state: baseState,
    computed: baseComputed,
    methods: {},
    components: {},
    slots: {},
    attrs: {},
    emit: () => {},
    provide: {},
  });

  describe('Proxy reuse across directive types', () => {
    it('should use context stateProxy in applyVIf', () => {
      const context = createContext(true);
      const condition: ExpressionValue = { _type: 'expression', expression: '$state.count > 0' };
      const result = applyVIf(condition, context);
      expect(result).toBe(true);
    });

    it('should use context stateProxy in applyVBind', () => {
      const context = createContext(true);
      const expr: ExpressionValue = { _type: 'expression', expression: '$state.count' };
      const vBind = { 'data-count': expr };
      const result = applyVBind(vBind, context);
      expect(result['data-count']).toBe(42);
    });

    it('should use context stateProxy in applyVHtml', () => {
      const context = createContext(true);
      const expr: ExpressionValue = { _type: 'expression', expression: '$state.message' };
      const result = applyVHtml(expr, context);
      expect(result).toBe('Hello');
    });

    it('should use context stateProxy in applyVText', () => {
      const context = createContext(true);
      const expr: ExpressionValue = { _type: 'expression', expression: '$state.message' };
      const result = applyVText(expr, context);
      expect(result).toBe('Hello');
    });

    it('should use context stateProxy in applyVElseIf', () => {
      const context = createContext(true);
      const condition: ExpressionValue = { _type: 'expression', expression: '$state.count === 42' };
      const result = applyVElseIf(condition, context);
      expect(result).toBe(true);
    });

    it('should use context stateProxy in applyVShow', () => {
      const context = createContext(true);
      const vnode = h('div', { style: {} });
      const condition: ExpressionValue = { _type: 'expression', expression: '$state.count > 0' };
      const result = applyVShow(vnode, condition, context);
      expect(result).toBe(vnode);
    });
  });

  describe('Backward compatibility for context without proxies', () => {
    it('should fall back to on-demand proxy creation in applyVIf', () => {
      const context = createContextWithoutProxies();
      const condition: ExpressionValue = { _type: 'expression', expression: '$state.count > 0' };
      const result = applyVIf(condition, context);
      expect(result).toBe(true);
    });

    it('should fall back to on-demand proxy creation in applyVBind', () => {
      const context = createContextWithoutProxies();
      const expr: ExpressionValue = { _type: 'expression', expression: '$state.count' };
      const vBind = { 'data-count': expr };
      const result = applyVBind(vBind, context);
      expect(result['data-count']).toBe(42);
    });

    it('should fall back to on-demand proxy creation in applyVHtml', () => {
      const context = createContextWithoutProxies();
      const expr: ExpressionValue = { _type: 'expression', expression: '$state.message' };
      const result = applyVHtml(expr, context);
      expect(result).toBe('Hello');
    });

    it('should fall back to on-demand proxy creation in applyVText', () => {
      const context = createContextWithoutProxies();
      const expr: ExpressionValue = { _type: 'expression', expression: '$state.message' };
      const result = applyVText(expr, context);
      expect(result).toBe('Hello');
    });

    it('should fall back to on-demand proxy creation in applyVElseIf', () => {
      const context = createContextWithoutProxies();
      const condition: ExpressionValue = { _type: 'expression', expression: '$state.count === 42' };
      const result = applyVElseIf(condition, context);
      expect(result).toBe(true);
    });
  });

  describe('Proxy produces identical behavior', () => {
    it('should produce same result with proxy as with fresh proxy', () => {
      const contextWithProxy = createContext(true);
      const contextWithoutProxy = createContextWithoutProxies();

      const expr: ExpressionValue = { _type: 'expression', expression: '$state.count + 1' };

      const resultWith = applyVBind({ result: expr }, contextWithProxy);
      const resultWithout = applyVBind({ result: expr }, contextWithoutProxy);

      expect(resultWith.result).toBe(resultWithout.result);
      expect(resultWith.result).toBe(43);
    });
  });
});
