import { describe, it, expect } from 'vitest';
import { h } from 'vue';
import {
  applyVIf,
  applyVShow,
  applyVModel,
  applyVOn,
  applyVBind,
  applyVHtml,
  applyVText,
} from '../../src/runtime/directive-runtime';
import type { VNodeDefinition, RenderContext, ExpressionValue, FunctionValue, StateRef, PropsRef } from '../../src/types';

describe('directive-runtime', () => {
  const mockContext: RenderContext = {
    props: { modelValue: 'test', title: 'Test Title' },
    state: { count: { value: 0 }, inputValue: { value: 'test value' }, visible: { value: true } },
    computed: { doubled: { value: 0 } },
    methods: { handleClick: () => {} },
    components: {},
    slots: {},
    attrs: {},
    emit: () => {},
    provide: {},
  };

  describe('applyVIf', () => {
    it('should return true for truthy condition', () => {
      const condition: ExpressionValue = { _type: 'expression', expression: 'true' };
      const result = applyVIf(condition, mockContext);
      expect(result).toBe(true);
    });

    it('should return false for falsy condition', () => {
      const condition: ExpressionValue = { _type: 'expression', expression: 'false' };
      const result = applyVIf(condition, mockContext);
      expect(result).toBe(false);
    });

    it('should return true for string "true"', () => {
      const condition: ExpressionValue = { _type: 'expression', expression: '"true"' };
      const result = applyVIf(condition, mockContext);
      expect(result).toBe(true);
    });

    it('should return false for empty string', () => {
      const condition: ExpressionValue = { _type: 'expression', expression: '""' };
      const result = applyVIf(condition, mockContext);
      expect(result).toBe(false);
    });

    it('should evaluate core-engine state reference', () => {
      const ctx = { ...mockContext, state: { show: { value: true } } };
      const condition: ExpressionValue = { _type: 'expression', expression: 'ref_state_show' };
      const result = applyVIf(condition, ctx);
      expect(result).toBe(true);
    });

    it('should throw error for invalid expression', () => {
      const condition: ExpressionValue = { _type: 'expression', expression: 'invalid+++expression' };
      expect(() => applyVIf(condition, mockContext)).toThrow();
    });
  });

  describe('applyVShow', () => {
    it('should return same vnode when condition is true', () => {
      const vnode = h('div', { style: {} });
      const condition: ExpressionValue = { _type: 'expression', expression: 'true' };
      const result = applyVShow(vnode, condition, mockContext);
      expect(result).toBe(vnode);
    });

    it('should set display none when condition is false', () => {
      const vnode = h('div', { style: {} });
      const condition: ExpressionValue = { _type: 'expression', expression: 'false' };
      const result = applyVShow(vnode, condition, mockContext);
      expect(result.props?.style).toHaveProperty('display', 'none');
    });

    it('should preserve existing style when setting display', () => {
      const vnode = h('div', { style: { color: 'red' } });
      const condition: ExpressionValue = { _type: 'expression', expression: 'false' };
      const result = applyVShow(vnode, condition, mockContext);
      expect(result.props?.style).toHaveProperty('color', 'red');
      expect(result.props?.style).toHaveProperty('display', 'none');
    });

    it('should evaluate core-engine state reference', () => {
      const vnode = h('div', { style: {} });
      const ctx = { ...mockContext, state: { visible: { value: false } } };
      const condition: ExpressionValue = { _type: 'expression', expression: 'ref_state_visible' };
      const result = applyVShow(vnode, condition, ctx);
      expect(result.props?.style).toHaveProperty('display', 'none');
    });
  });

  describe('applyVModel', () => {
    it('should return empty object when vModel is undefined', () => {
      const result = applyVModel(undefined, mockContext);
      expect(result).toEqual({});
    });

    it('should return binding props with modelValue and onInput', () => {
      const prop: StateRef = { _type: 'state', variable: 'inputValue' };
      const vModel = { prop };
      const result = applyVModel(vModel, mockContext);
      expect(result).toHaveProperty('modelValue');
      expect(result).toHaveProperty('onInput');
    });

    it('should use custom prop name but still use onInput', () => {
      const prop: StateRef = { _type: 'state', variable: 'inputValue' };
      const vModel = { prop, event: 'value' };
      const result = applyVModel(vModel, mockContext);
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('onInput');
      expect(result).not.toHaveProperty('modelValue');
    });
  });

  describe('applyVOn', () => {
    it('should return empty object when vOn is undefined', () => {
      const result = applyVOn(undefined, mockContext);
      expect(result).toEqual({});
    });

    it('should return empty object when vOn is empty', () => {
      const result = applyVOn({}, mockContext);
      expect(result).toEqual({});
    });

    it('should create event handler for click', () => {
      const handler: FunctionValue = { _type: 'function', params: {}, body: 'methods.handleClick();' };
      const vOn = { click: handler };
      const result = applyVOn(vOn, mockContext);
      expect(result).toHaveProperty('onClick');
      expect(typeof result.onClick).toBe('function');
    });

    it('should handle event with modifiers', () => {
      const handler: FunctionValue = { _type: 'function', params: {}, body: 'methods.handleClick();' };
      const vOn = { 'click.prevent': handler };
      const result = applyVOn(vOn, mockContext);
      expect(result).toHaveProperty('onClick');
    });

    it('should create handler for input event', () => {
      const handler: FunctionValue = { _type: 'function', params: {}, body: 'value = $event.target.value;' };
      const vOn = { input: handler };
      const result = applyVOn(vOn, mockContext);
      expect(result).toHaveProperty('onInput');
      expect(typeof result.onInput).toBe('function');
    });
  });

  describe('applyVBind', () => {
    it('should return empty object when vBind is undefined', () => {
      const result = applyVBind(undefined, mockContext);
      expect(result).toEqual({});
    });

    it('should return empty object when vBind is empty', () => {
      const result = applyVBind({}, mockContext);
      expect(result).toEqual({});
    });

    it('should bind disabled property', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: 'false' };
      const vBind = { disabled: expr };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('disabled');
    });

    it('should bind class property', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: '"active"' };
      const vBind = { class: expr };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('class');
    });

    it('should bind using core-engine state reference', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: 'ref_state_count' };
      const vBind = { 'data-count': expr };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('data-count');
      expect(result['data-count']).toBe(0);
    });

    it('should bind using core-engine props reference', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: 'ref_props_title' };
      const vBind = { title: expr };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('title');
      expect(result.title).toBe('Test Title');
    });
  });

  describe('applyVHtml', () => {
    it('should return HTML string', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: '"<span>test</span>"' };
      const result = applyVHtml(expr, mockContext);
      expect(result).toBe('<span>test</span>');
    });

    it('should convert expression result to string', () => {
      const ctx = {
        ...mockContext,
        state: { count: { value: 42 } },
      };
      const expr: ExpressionValue = { _type: 'expression', expression: 'ref_state_count' };
      const result = applyVHtml(expr, ctx);
      expect(typeof result).toBe('string');
      expect(result).toBe('42');
    });

    it('should return empty string for null/undefined', () => {
      const ctx = {
        ...mockContext,
        state: { value: { value: null } },
      };
      const expr: ExpressionValue = { _type: 'expression', expression: '"test"' };
      const result = applyVHtml(expr, ctx);
      expect(typeof result).toBe('string');
    });
  });

  describe('applyVText', () => {
    it('should return text string', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: '"Hello"' };
      const result = applyVText(expr, mockContext);
      expect(result).toBe('Hello');
    });

    it('should convert number to string', () => {
      const expr: ExpressionValue = { _type: 'expression', expression: '123' };
      const result = applyVText(expr, mockContext);
      expect(result).toBe('123');
    });

    it('should return empty string for null/undefined', () => {
      const ctx = {
        ...mockContext,
        state: { value: { value: undefined } },
      };
      const expr: ExpressionValue = { _type: 'expression', expression: '"test"' };
      const result = applyVText(expr, ctx);
      expect(typeof result).toBe('string');
    });

    it('should evaluate core-engine state reference', () => {
      const ctx = { ...mockContext, state: { message: { value: 'Hello World' } } };
      const expr: ExpressionValue = { _type: 'expression', expression: 'ref_state_message' };
      const result = applyVText(expr, ctx);
      expect(result).toBe('Hello World');
    });
  });
});
