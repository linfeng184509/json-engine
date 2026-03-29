import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createComponent, clearComponentCache } from '../../src/runtime/component-factory';
import { parseSchema } from '../../src/parser';

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
        content: {
          type: 'div',
          children: {
            type: 'expression',
            body: '{{ref_props_title}}',
          },
        },
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
        content: {
          type: 'div',
          children: {
            type: 'expression',
            body: '{{ref_state_count}}',
          },
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with methods', () => {
    const schema = {
      name: 'WithMethods',
      state: {
        count: { type: 'ref', initial: 0 },
      },
      methods: {
        increment: {
          type: 'function',
          params: '{{{}}}',
          body: '{{state.count.value++;}}',
        },
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
        doubled: {
          get: {
            type: 'function',
            params: '{{{}}}',
            body: '{{return state.count.value * 2;}}',
          },
        },
      },
      render: {
        type: 'template',
        content: {
          type: 'div',
          children: {
            type: 'expression',
            body: '{{ref_state_count}}',
          },
        },
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
              directives: {
                vIf: {
                  type: 'expression',
                  body: '{{ref_state_show}}',
                },
              },
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
          directives: {
            vShow: {
              type: 'expression',
              body: '{{ref_state_visible}}',
            },
          },
          children: 'Content',
        },
      },
    };

    const component = createComponent(schema, { injectStyles: false });

    expect(component).toBeDefined();
  });

  it('should create component with v-model', () => {
    const schema = {
      name: 'VModelComponent',
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
              directives: {
                vModel: {
                  prop: {
                    type: 'state',
                    body: '{{ref_state_inputValue}}',
                  },
                },
              },
            },
          ],
        },
      },
    };

    // vModel prop 会被 processSchemaWithMarkers 处理为 { _type: 'state', variable: 'inputValue' }
    const result = parseSchema(schema);
    if (!result.success) {
      console.log('vModel Errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it('should handle component with function render', () => {
    const schema = {
      name: 'FunctionRenderComponent',
      state: {
        message: { type: 'ref', initial: 'Hello' },
      },
      render: {
        type: 'function',
        content: {
          type: 'function',
          params: '{{{}}}',
          body: '{{return h("div", state.message.value);}}',
        },
      },
    };

    // Note: params: '{{{}}}' 是正确的 core-engine 格式
    // 但 parseJson 的 ValueFunctionParser 要求 params 非空
    // 这里测试 parseSchema 是否正确处理
    const result = parseSchema(schema);
    if (!result.success) {
      console.log('Errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.success).toBe(true);
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
