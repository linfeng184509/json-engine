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
import type { VNodeDefinition, RenderContext } from '../../src/types';

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
      const result = applyVIf('true', mockContext);
      expect(result).toBe(true);
    });

    it('should return false for falsy condition', () => {
      const result = applyVIf('false', mockContext);
      expect(result).toBe(false);
    });

    it('should return true for string "true"', () => {
      const result = applyVIf('"true"', mockContext);
      expect(result).toBe(true);
    });

    it('should return false for empty string', () => {
      const result = applyVIf('""', mockContext);
      expect(result).toBe(false);
    });

    it('should evaluate core-engine state reference', () => {
      const ctx = { ...mockContext, state: { show: { value: true } } };
      const result = applyVIf('ref_state_show', ctx);
      expect(result).toBe(true);
    });

    it('should throw error for invalid expression', () => {
      expect(() => applyVIf('invalid+++expression', mockContext)).toThrow();
    });
  });

  describe('applyVShow', () => {
    it('should return same vnode when condition is true', () => {
      const vnode = h('div', { style: {} });
      const result = applyVShow(vnode, 'true', mockContext);
      expect(result).toBe(vnode);
    });

    it('should set display none when condition is false', () => {
      const vnode = h('div', { style: {} });
      const result = applyVShow(vnode, 'false', mockContext);
      expect(result.props?.style).toHaveProperty('display', 'none');
    });

    it('should preserve existing style when setting display', () => {
      const vnode = h('div', { style: { color: 'red' } });
      const result = applyVShow(vnode, 'false', mockContext);
      expect(result.props?.style).toHaveProperty('color', 'red');
      expect(result.props?.style).toHaveProperty('display', 'none');
    });

    it('should evaluate core-engine state reference', () => {
      const vnode = h('div', { style: {} });
      const ctx = { ...mockContext, state: { visible: { value: false } } };
      const result = applyVShow(vnode, 'ref_state_visible', ctx);
      expect(result.props?.style).toHaveProperty('display', 'none');
    });
  });

  describe('applyVModel', () => {
    it('should return empty object when vModel is undefined', () => {
      const result = applyVModel(undefined, mockContext);
      expect(result).toEqual({});
    });

    it('should return binding props with modelValue', () => {
      const vModel = { prop: 'ref_state_inputValue' };
      const result = applyVModel(vModel, mockContext);
      expect(result).toHaveProperty('modelValue');
      expect(result).toHaveProperty('onUpdate:modelValue');
    });

    it('should use custom prop name', () => {
      const vModel = { prop: 'ref_state_inputValue', event: 'value' };
      const result = applyVModel(vModel, mockContext);
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('onUpdate:value');
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
      const vOn = { click: 'handleClick()' };
      const result = applyVOn(vOn, mockContext);
      expect(result).toHaveProperty('onClick');
      expect(typeof result.onClick).toBe('function');
    });

    it('should handle event with modifiers', () => {
      const vOn = { 'click.prevent': 'handleClick()' };
      const result = applyVOn(vOn, mockContext);
      expect(result).toHaveProperty('onClick');
    });

    it('should create handler for input event', () => {
      const vOn = { input: 'value = $event.target.value' };
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
      const vBind = { disabled: 'false' };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('disabled');
    });

    it('should bind class property', () => {
      const vBind = { class: '"active"' };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('class');
    });

    it('should bind using core-engine state reference', () => {
      const vBind = { 'data-count': 'ref_state_count' };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('data-count');
      expect(result['data-count']).toBe(0);
    });

    it('should bind using core-engine props reference', () => {
      const vBind = { title: 'ref_props_title' };
      const result = applyVBind(vBind, mockContext);
      expect(result).toHaveProperty('title');
      expect(result.title).toBe('Test Title');
    });
  });

  describe('applyVHtml', () => {
    it('should return HTML string', () => {
      const result = applyVHtml('"<span>test</span>"', mockContext);
      expect(result).toBe('<span>test</span>');
    });

    it('should convert expression result to string', () => {
      const ctx = {
        ...mockContext,
        state: { count: { value: 42 } },
      };
      const result = applyVHtml('ref_state_count', ctx);
      expect(typeof result).toBe('string');
      expect(result).toBe('42');
    });

    it('should return empty string for null/undefined', () => {
      const ctx = {
        ...mockContext,
        state: { value: { value: null } },
      };
      const result = applyVHtml('"test"', ctx);
      expect(typeof result).toBe('string');
    });
  });

  describe('applyVText', () => {
    it('should return text string', () => {
      const result = applyVText('"Hello"', mockContext);
      expect(result).toBe('Hello');
    });

    it('should convert number to string', () => {
      const result = applyVText('123', mockContext);
      expect(result).toBe('123');
    });

    it('should return empty string for null/undefined', () => {
      const ctx = {
        ...mockContext,
        state: { value: { value: undefined } },
      };
      const result = applyVText('"test"', ctx);
      expect(typeof result).toBe('string');
    });

    it('should evaluate core-engine state reference', () => {
      const ctx = { ...mockContext, state: { message: { value: 'Hello World' } } };
      const result = applyVText('ref_state_message', ctx);
      expect(result).toBe('Hello World');
    });
  });
});