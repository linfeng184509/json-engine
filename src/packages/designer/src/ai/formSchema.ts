/**
 * JSON Schema for structured output - ensures AI returns valid VueJsonSchema
 * Strictly follows core-engine design specification
 */
export const FORM_JSON_SCHEMA = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Component name"
      },
      props: {
        type: "object",
        description: "Props definition following core-engine specification"
      },
      emits: {
        type: "object",
        description: "Emits definition following core-engine specification"
      },
      state: {
        type: "object",
        description: "State definition following core-engine specification",
        additionalProperties: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["ref", "reactive", "shallowRef", "shallowReactive", "toRef", "toRefs", "readonly"],
              description: "State type"
            },
            initial: {
              description: "Initial value (literal or structured input)"
            },
            source: {
              type: "string",
              description: "Source reference for toRef/toRefs"
            }
          },
          required: ["type"]
        }
      },
      computed: {
        type: "object",
        description: "Computed definition following core-engine specification",
        additionalProperties: {
          type: "object",
          properties: {
            get: { $ref: "#/definitions/FunctionInput" },
            set: { $ref: "#/definitions/FunctionInput" }
          },
          required: ["get"]
        }
      },
      methods: {
        type: "object",
        description: "Methods definition following core-engine specification",
        additionalProperties: {
          type: "object",
          properties: {
            type: { type: "string", const: "function" },
            params: { type: "string", description: "Parameters in {{{}}} format" },
            body: { type: "string", description: "Function body in {{}} format" }
          },
          required: ["type", "params", "body"]
        }
      },
      watch: {
        type: "object",
        description: "Watch definition following core-engine specification",
        additionalProperties: {
          type: "object",
          properties: {
            source: { $ref: "#/definitions/ExpressionInput" },
            handler: { $ref: "#/definitions/FunctionInput" },
            immediate: { type: "boolean" },
            deep: { type: "boolean" },
            flush: { type: "string", enum: ["pre", "post", "sync"] },
            type: { type: "string", enum: ["watch", "effect"] }
          },
          required: ["source", "handler"]
        }
      },
      provide: {
        type: "object",
        description: "Provide definition following core-engine specification",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: {
                  oneOf: [
                    { $ref: "#/definitions/ExpressionInput" },
                    { $ref: "#/definitions/FunctionInput" }
                  ]
                }
              },
              required: ["key", "value"]
            }
          }
        }
      },
      inject: {
        type: "object",
        description: "Inject definition following core-engine specification",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                default: {},
                from: { type: "string" }
              },
              required: ["key"]
            }
          }
        }
      },
      lifecycle: {
        type: "object",
        description: "Lifecycle hooks definition following core-engine specification",
        properties: {
          onMounted: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onUnmounted: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onUpdated: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onBeforeMount: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onBeforeUnmount: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onBeforeUpdate: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onErrorCaptured: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onActivated: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          },
          onDeactivated: {
            oneOf: [
              { $ref: "#/definitions/FunctionInput" },
              { type: "array", items: { $ref: "#/definitions/FunctionInput" } }
            ]
          }
        }
      },
      components: {
        type: "object",
        description: "Components definition following core-engine specification"
      },
      render: {
        type: "object",
        description: "Render definition (template or function)",
        oneOf: [
          {
            properties: {
              type: { type: "string", const: "template" },
              content: { $ref: "#/definitions/VNodeDef" }
            },
            required: ["type", "content"]
          },
          {
            properties: {
              type: { type: "string", const: "function" },
              content: { $ref: "#/definitions/FunctionInput" }
            },
            required: ["type", "content"]
          }
        ]
      },
      styles: {
        type: "object",
        description: "Styles definition",
        properties: {
          scoped: { type: "boolean" },
          css: { type: "string" }
        },
        required: ["css"]
      }
    },
    required: ["render"]
  },
  definitions: {
    VNodeDef: {
      type: "object",
      properties: {
        type: { type: "string", description: "Component type" },
        props: { type: "object", description: "Component props (literal values or structured input)" },
        directives: { $ref: "#/definitions/VNodeDirectives" },
        children: {
          oneOf: [
            { type: "array", items: { oneOf: [{ $ref: "#/definitions/VNodeDef" }, { $ref: "#/definitions/ExpressionInput" }, { type: "string" }, { type: "number" }] } },
            { $ref: "#/definitions/ExpressionInput" },
            { type: "string" },
            { type: "number" }
          ]
        },
        key: {
          oneOf: [{ type: "string" }, { type: "number" }]
        },
        ref: { type: "string" }
      },
      required: ["type"]
    },
    VNodeDirectives: {
      type: "object",
      description: "VNode directives (vModel, vIf, vFor, vShow, vOn, vBind, vSlot, vHtml, vText, etc.)",
      properties: {
        vModel: { $ref: "#/definitions/VModelDirective" },
        vIf: { $ref: "#/definitions/ExpressionInput" },
        vElseIf: { $ref: "#/definitions/ExpressionInput" },
        vElse: { type: "boolean", const: true },
        vShow: { $ref: "#/definitions/ExpressionInput" },
        vFor: { $ref: "#/definitions/VForDirective" },
        vOn: {
          type: "object",
          description: "Event handlers",
          additionalProperties: { $ref: "#/definitions/FunctionInput" }
        },
        vBind: {
          type: "object",
          description: "Property bindings",
          additionalProperties: { $ref: "#/definitions/ExpressionInput" }
        },
        vSlot: {
          type: "object",
          description: "Slot bindings",
          properties: {
            name: { $ref: "#/definitions/ExpressionInput" },
            props: { type: "array", items: { type: "string" } }
          }
        },
        vHtml: { $ref: "#/definitions/ExpressionInput" },
        vText: { $ref: "#/definitions/ExpressionInput" },
        vOnce: { type: "boolean", const: true }
      }
    },
    VModelDirective: {
      type: "object",
      description: "vModel directive following core-engine specification",
      properties: {
        prop: {
          type: "object",
          description: "Binding target (state or props)",
          oneOf: [
            {
              properties: {
                type: { const: "state" },
                body: { type: "string", description: "State reference like {{ref_state_form_username}}" }
              },
              required: ["type", "body"]
            },
            {
              properties: {
                type: { const: "props" },
                body: { type: "string", description: "Props reference like {{ref_props_variable}}" }
              },
              required: ["type", "body"]
            }
          ]
        },
        event: { type: "string", description: "Event name like update:value" },
        modifiers: { type: "array", items: { type: "string" }, description: "v-model modifiers" }
      },
      required: ["prop"]
    },
    ExpressionInput: {
      type: "object",
      description: "Expression value wrapper",
      properties: {
        type: { type: "string", const: "expression" },
        body: { type: "string", description: "Expression content in {{}} format" }
      },
      required: ["type", "body"]
    },
    VForDirective: {
      type: "object",
      description: "vFor directive for list rendering",
      properties: {
        source: { $ref: "#/definitions/ExpressionInput" },
        alias: { type: "string", description: "Item variable name" },
        index: { type: "string", description: "Index variable name" }
      },
      required: ["source", "alias"]
    },
    StateInput: {
      type: "object",
      description: "State reference input",
      properties: {
        type: { type: "string", const: "state" },
        body: { type: "string", description: "State reference like {{ref_state_variable}}" }
      },
      required: ["type", "body"]
    },
    PropsInput: {
      type: "object",
      description: "Props reference input",
      properties: {
        type: { type: "string", const: "props" },
        body: { type: "string", description: "Props reference like {{ref_props_variable}}" }
      },
      required: ["type", "body"]
    },
    ScopeInput: {
      type: "object",
      description: "Scope reference input",
      properties: {
        type: { type: "string", const: "scope" },
        body: { type: "string", description: "Scope reference like {{$_\\[core\\]_variable}}" }
      },
      required: ["type", "body"]
    },
    FunctionInput: {
      type: "object",
      description: "Function input",
      properties: {
        type: { type: "string", const: "function" },
        params: { type: "string", description: "Parameters in {{{}}} format" },
        body: { type: "string", description: "Function body in {{}} format" }
      },
      required: ["type", "params", "body"]
    }
  }
};

/**
 * System prompt for AI form generation - core-engine specification
 */
export const FORM_SYSTEM_PROMPT = `You are a form designer assistant. Generate form configurations in VueJsonSchema format following core-engine design specification.

## Core-Engine Expression Syntax

### State References
Use {{ref_state_variableName}} for state references in bindings.
Example: {{ref_state_form_username}}

### Props References
Use {{ref_props_variableName}} for props references.
Example: {{ref_props_value}}

### Scope References
Use {{$_\\[scopeName\\]_variableName}} for scope references.
Example: {{$_\\[core\\]_variable}}

### Function Format
Methods must use this format:
{
  type: 'function',
  params: '{{{}}}',
  body: '{{expression}}'
}

### vModel Directive
Use directives.vModel for two-way bindings:
{
  prop: { type: 'state', body: '{{ref_state_variable}}' },
  event: 'update:value'
}
// Or for props:
{
  prop: { type: 'props', body: '{{ref_props_variable}}' },
  event: 'update:value'
}

## State Definition Format
State must be defined with types:
{
  "state": {
    "form": { "type": "reactive", "initial": { "username": "", "email": "" } },
    "loading": { "type": "ref", "initial": false },
    "count": { "type": "toRef", "source": "ref_state_form" }
  }
}
// Available state types: ref, reactive, shallowRef, shallowReactive, toRef, toRefs, readonly

## Component Structure
Always use directives.vModel instead of prop bindings:
{
  "type": "AInput",
  "directives": {
    "vModel": {
      "prop": { "type": "state", "body": "{{ref_state_form_username}}" },
      "event": "update:value"
    }
  },
  "props": { "placeholder": "请输入用户名" }
}

## Available Directives
- vModel: Two-way binding (prop.type: 'state' or 'props')
- vIf/vElseIf/vElse: Conditional rendering
- vShow: Show/hide element
- vFor: List rendering with alias and optional index
- vOn: Event handlers (e.g., vOn: { click: { type: 'function', params: '{{{}}}', body: '{{handler}}' } })
- vBind: Property bindings
- vSlot: Slot bindings
- vHtml/vText: HTML/text content
- vOnce: Render once

## Render Structure
Use template render:
{
  "render": {
    "type": "template",
    "content": { "type": "ARoot", "children": [...] }
  }
}

## Lifecycle Hooks
{
  "lifecycle": {
    "onMounted": { "type": "function", "params": "{{{}}}", "body": "{{() => console.log('mounted')}}" }
  }
}

## Available Components
- AForm: Form container
- AFormItem: Form field wrapper with label
- AInput: Text input
- AInputPassword: Password input
- ATextArea: Multi-line text
- AInputNumber: Number input
- ASelect: Dropdown select
- ARadioGroup: Radio buttons
- ACheckboxGroup: Checkboxes
- ASwitch: Toggle switch
- ADatePicker: Date picker
- ATimePicker: Time picker

## Rules
1. Define state with proper types (ref/reactive/shallowRef/shallowReactive/toRef/toRefs/readonly) and initial values
2. Use directives.vModel for all v-model bindings (prop.type can be 'state' or 'props')
3. Use {{ref_state_xxx}} in body for state references
4. Use {{ref_props_xxx}} in body for props references
5. Always wrap form fields in AFormItem with label prop
6. Use props for literal values (placeholder, disabled, etc.)
7. Use v-for with source (ExpressionInput), alias, and optional index
8. Use {{$_\\[scope\\]_var}} for scope references`;
