import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createComponent, clearComponentCache } from '../../src/runtime/component-factory';

describe('component-creation integration', () => {
  beforeEach(() => {
    clearComponentCache();
  });

  afterEach(() => {
    clearComponentCache();
  });

  it('should create component from valid schema', () => {
    const schema = {
      name: 'TestComponent',
      render: {
        type: 'template',
        content: {
          type: 'div',
          children: 'Hello',
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });

  it('should create component from JSON string', () => {
    const schemaStr = JSON.stringify({
      name: 'JsonComponent',
      render: {
        type: 'template',
        content: {
          type: 'span',
          children: 'From JSON',
        },
      },
    });

    const component = createComponent(schemaStr, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with props', () => {
    const schema = {
      name: 'WithProps',
      props: {
        title: { type: 'String', required: true },
      },
      render: {
        type: 'template',
        content: { type: 'div', children: '{{title}}' },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with state', () => {
    const schema = {
      name: 'WithState',
      state: {
        count: { type: 'ref', initial: 0 },
      },
      render: {
        type: 'template',
        content: { type: 'div', children: '{{count}}' },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with methods', () => {
    const schema = {
      name: 'WithMethods',
      methods: {
        increment: 'count++',
      },
      render: {
        type: 'template',
        content: { type: 'button', children: 'Click' },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with computed', () => {
    const schema = {
      name: 'WithComputed',
      state: {
        count: { type: 'ref', initial: 5 },
      },
      computed: {
        doubled: { get: 'count * 2' },
      },
      render: {
        type: 'template',
        content: { type: 'div', children: '{{doubled}}' },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should handle component with v-if directive', () => {
    const schema = {
      name: 'VIfComponent',
      state: {
        show: { type: 'ref', initial: true },
      },
      render: {
        type: 'template',
        content: {
          type: 'div',
          children: [
            {
              type: 'p',
              directives: { vIf: 'show' },
              children: 'Shown',
            },
          ],
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with v-show directive', () => {
    const schema = {
      name: 'VShowComponent',
      state: {
        visible: { type: 'ref', initial: true },
      },
      render: {
        type: 'template',
        content: {
          type: 'div',
          directives: { vShow: 'visible' },
          children: 'Content',
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with props', () => {
    const schema = {
      name: 'PropsComponent',
      state: {
        inputValue: { type: 'ref', initial: '' },
      },
      render: {
        type: 'template',
        content: {
          type: 'div',
          children: [
            {
              type: 'input',
              props: {
                value: 'state.inputValue.value',
              },
            },
          ],
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should handle component with function render', () => {
    const schema = {
      name: 'FunctionRenderComponent',
      state: {
        message: { type: 'ref', initial: 'Hello' },
      },
      render: {
        type: 'function',
        content: 'return h("div", message)',
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should handle nested components', () => {
    const schema = {
      name: 'ParentComponent',
      components: {
        ChildComponent: {
          type: 'local',
          source: 'ChildComponent',
        },
      },
      render: {
        type: 'template',
        content: {
          type: 'div',
          children: [
            { type: 'h1', children: 'Parent' },
            { type: 'ChildComponent', children: 'Child content' },
          ],
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });
});
