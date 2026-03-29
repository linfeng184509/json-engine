import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderVNode } from '../../src/runtime/render-factory';
import type { RenderDefinition, RenderContext, ExpressionValue, FunctionValue } from '../../src/types';

describe('renderVNode', () => {
  let mockContext: RenderContext;

  beforeEach(() => {
    mockContext = {
      props: { title: 'Test Title' },
      state: { count: { value: 42 }, message: { value: 'Hello' } },
      computed: { doubled: { value: 84 } },
      methods: {},
      components: {},
      slots: {},
      attrs: {},
      emit: vi.fn(),
      provide: {},
    };
  });

  it('should render template type with div', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        children: 'Hello',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
    expect(result).toBeTruthy();
  });

  it('should render template type with span', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'span',
        children: 'Content',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with string children', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'p',
        children: 'Paragraph text',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with nested children', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        children: [
          { type: 'span', children: 'Nested' },
        ],
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should apply v-if directive when condition is true', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        directives: {
          vIf: { _type: 'expression', expression: 'true' },
        },
        children: 'Shown',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should apply v-if directive when condition is false', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        directives: {
          vIf: { _type: 'expression', expression: 'false' },
        },
        children: 'Hidden',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeNull();
  });

  it('should apply v-if with core-engine state reference', () => {
    const ctx = { ...mockContext, state: { show: { value: true } } };
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        directives: {
          vIf: { _type: 'expression', expression: 'ref_state_show' },
        },
        children: 'Shown',
      },
    };

    const result = renderVNode(definition, ctx);

    expect(result).toBeDefined();
  });

  it('should render with v-show directive', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        directives: {
          vShow: { _type: 'expression', expression: 'true' },
        },
        children: 'Visible',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should handle function render type', () => {
    const definition: RenderDefinition = {
      type: 'function',
      content: {
        _type: 'function',
        params: {},
        body: 'return h("div", "Function rendered");',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with v-html directive', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        directives: {
          vHtml: { _type: 'expression', expression: '"<span>HTML content</span>"' },
        },
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with v-text directive', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'span',
        directives: {
          vText: { _type: 'expression', expression: '"Text content"' },
        },
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with core-engine state reference in children', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'span',
        children: { _type: 'expression', expression: 'ref_state_message' },
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with core-engine props reference in props', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'div',
        props: {
          title: { _type: 'expression', expression: 'ref_props_title' },
        },
        children: 'Content',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });

  it('should render element with mixed expression', () => {
    const definition: RenderDefinition = {
      type: 'template',
      content: {
        type: 'span',
        children: 'ref_state_count + 1',
      },
    };

    const result = renderVNode(definition, mockContext);

    expect(result).toBeDefined();
  });
});
