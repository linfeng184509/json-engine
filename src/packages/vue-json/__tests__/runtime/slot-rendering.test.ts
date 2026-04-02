/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { h, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { renderVNode } from '../../src/runtime/render-factory';
import type { RenderDefinition, RenderContext } from '../../src/types';

describe('slot rendering', () => {
  const SlotTestComponent = defineComponent({
    name: 'SlotTestComponent',
    props: {
      title: { type: String, default: '' },
    },
    setup(props, { slots }) {
      return () => h('div', { class: 'slot-test' }, [
        h('div', { class: 'header' }, slots.header ? slots.header({ title: props.title || 'Default Title' }) : 'No Header'),
        h('div', { class: 'content' }, slots.default ? slots.default() : 'No Content'),
        h('div', { class: 'footer' }, slots.footer ? slots.footer({ count: 3 }) : 'No Footer'),
      ]);
    },
  });

  const mockContext: RenderContext = {
    props: {},
    state: {},
    computed: {},
    methods: {},
    components: { SlotTestComponent },
    slots: {},
    attrs: {},
    emit: () => {},
    provide: {},
  };

  describe('default slot', () => {
    it('should render children as default slot', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            { type: 'span', children: ['Hello World'] },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      expect(result).toBeDefined();
      
      const wrapper = mount({ render: () => result });
      expect(wrapper.html()).toContain('Hello World');
      expect(wrapper.find('.content').text()).toContain('Hello World');
    });

    it('should render multiple children in default slot', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            { type: 'span', children: ['First'] },
            { type: 'span', children: ['Second'] },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      expect(wrapper.html()).toContain('First');
      expect(wrapper.html()).toContain('Second');
    });
  });

  describe('named slots', () => {
    it('should render header slot with vSlot directive', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            {
              type: 'span',
              directives: { vSlot: { name: { _type: 'expression', expression: '"header"' } } },
              children: ['Header Content'],
            },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      expect(wrapper.html()).toContain('Header Content');
      expect(wrapper.find('.header').text()).toContain('Header Content');
    });

    it('should render multiple named slots', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            {
              type: 'h1',
              directives: { vSlot: { name: { _type: 'expression', expression: '"header"' } } },
              children: ['My Header'],
            },
            {
              type: 'p',
              directives: { vSlot: { name: { _type: 'expression', expression: '"default"' } } },
              children: ['My Content'],
            },
            {
              type: 'small',
              directives: { vSlot: { name: { _type: 'expression', expression: '"footer"' } } },
              children: ['My Footer'],
            },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      expect(wrapper.find('.header').text()).toContain('My Header');
      expect(wrapper.find('.content').text()).toContain('My Content');
      expect(wrapper.find('.footer').text()).toContain('My Footer');
    });

    it('should render footer slot correctly', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            {
              type: 'span',
              directives: { vSlot: { name: { _type: 'expression', expression: '"footer"' } } },
              children: ['Footer Text'],
            },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      expect(wrapper.find('.footer').text()).toContain('Footer Text');
    });
  });

  describe('slot props', () => {
    it('should pass slot props to children and evaluate expressions', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            {
              type: 'span',
              directives: { 
                vSlot: { 
                  name: { _type: 'expression', expression: '"footer"' },
                  props: ['count'],
                } 
              },
              children: [
                { type: 'expression', _type: 'expression', expression: 'ref_state_count' },
              ],
            },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      const html = wrapper.html();
      expect(html).toContain('3');
      expect(wrapper.find('.footer').text()).toContain('3');
    });

    it('should render slot props value with prefix text', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            {
              type: 'span',
              directives: { 
                vSlot: { 
                  name: { _type: 'expression', expression: '"footer"' },
                  props: ['count'],
                } 
              },
              children: [
                'Total: ',
                { type: 'expression', _type: 'expression', expression: 'ref_state_count' },
                ' items',
              ],
            },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      const footerText = wrapper.find('.footer').text();
      expect(footerText).toContain('Total:');
      expect(footerText).toContain('3');
      expect(footerText).toContain('items');
    });

    it('should pass header title from slot props and use in expression', () => {
      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'SlotTestComponent',
          children: [
            {
              type: 'h1',
              directives: { 
                vSlot: { 
                  name: { _type: 'expression', expression: '"header"' },
                  props: ['title'],
                } 
              },
              children: [
                'Title: ',
                { type: 'expression', _type: 'expression', expression: 'ref_state_title' },
              ],
            },
          ],
        },
      };

      const result = renderVNode(schema, mockContext);
      const wrapper = mount({ render: () => result });
      const headerText = wrapper.find('.header').text();
      expect(headerText).toContain('Title:');
      expect(headerText).toContain('Default Title');
    });

    it('should handle multiple slot props', () => {
      const MultiSlotPropsComponent = defineComponent({
        name: 'MultiSlotPropsComponent',
        setup(_, { slots }) {
          return () => h('div', [
            slots.default ? slots.default({ name: 'John', age: 25, active: true }) : 'No Slot',
          ]);
        },
      });

      const contextWithMulti: RenderContext = {
        ...mockContext,
        components: { MultiSlotPropsComponent },
      };

      const schema: RenderDefinition = {
        type: 'template',
        content: {
          type: 'MultiSlotPropsComponent',
          children: [
            {
              type: 'div',
              directives: { 
                vSlot: { 
                  name: { _type: 'expression', expression: '"default"' },
                  props: ['name', 'age', 'active'],
                } 
              },
              children: [
                { type: 'span', children: [{ type: 'expression', _type: 'expression', expression: 'ref_state_name' }] },
                ' is ',
                { type: 'span', children: [{ type: 'expression', _type: 'expression', expression: 'ref_state_age' }] },
                ' years old',
              ],
            },
          ],
        },
      };

      const result = renderVNode(schema, contextWithMulti);
      const wrapper = mount({ render: () => result });
      const html = wrapper.html();
      expect(html).toContain('John');
      expect(html).toContain('25');
      expect(html).toContain('years old');
    });
  });
});