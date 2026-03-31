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
      render: {
        type: "object",
        description: "Component tree root node (VNodeDefinition)",
        properties: {
          type: { type: "string", description: "Component type like AForm" },
          props: { type: "object", description: "Component props (literal values only)" },
          directives: { $ref: "#/definitions/VNodeDirectives" },
          children: {
            type: "array",
            description: "Child components",
            items: { $ref: "#/definitions/VNodeDef" }
          }
        },
        required: ["type"]
      },
      state: {
        type: "object",
        description: "State definition following core-engine specification",
        additionalProperties: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["ref", "reactive", "shallowRef", "shallowReactive"],
              description: "State type"
            },
            initial: {
              description: "Initial value (literal or structured input)"
            }
          },
          required: ["type", "initial"]
        }
      },
      methods: {
        type: "object",
        description: "Methods definition following core-engine specification",
        additionalProperties: {
          type: "object",
          properties: {
            type: { type: "string", const: "function", description: "Must be 'function'" },
            params: { type: "string", description: "Parameters in {{{}}} format" },
            body: { type: "string", description: "Function body in {{}} format" }
          },
          required: ["type", "params", "body"]
        }
      }
    },
    required: ["render"]
  },
  definitions: {
    VNodeDef: {
      type: "object",
      properties: {
        type: { type: "string", description: "Component type" },
        props: { type: "object", description: "Component props (literal values)" },
        directives: { $ref: "#/definitions/VNodeDirectives" },
        children: {
          type: "array",
          items: { $ref: "#/definitions/VNodeDef" }
        }
      },
      required: ["type"]
    },
    VNodeDirectives: {
      type: "object",
      description: "VNode directives (vModel, vIf, vFor, etc.)",
      properties: {
        vModel: { $ref: "#/definitions/VModelDirective" },
        vIf: { $ref: "#/definitions/ExpressionValue" },
        vFor: { $ref: "#/definitions/VForDirective" }
      }
    },
    VModelDirective: {
      type: "object",
      description: "vModel directive following core-engine specification",
      properties: {
        prop: {
          type: "object",
          properties: {
            type: { type: "string", const: "state" },
            body: { type: "string", description: "State reference like {{ref_state_form_username}}" }
          },
          required: ["type", "body"]
        },
        event: { type: "string", description: "Event name like update:value" }
      },
      required: ["prop", "event"]
    },
    ExpressionValue: {
      type: "object",
      description: "Expression value wrapper",
      properties: {
        type: { type: "string", const: "expression" },
        body: { type: "string", description: "Expression content" }
      },
      required: ["type", "body"]
    },
    VForDirective: {
      type: "object",
      description: "vFor directive",
      properties: {
        source: { $ref: "#/definitions/ExpressionValue" },
        item: { type: "string", description: "Item variable name" },
        index: { type: "string", description: "Index variable name" }
      }
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

## State Definition Format
State must be defined with types:
{
  "state": {
    "form": { "type": "reactive", "initial": { "username": "", "email": "" } },
    "loading": { "type": "ref", "initial": false }
  }
}

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
1. Define state with proper types (ref/reactive) and initial values
2. Use directives.vModel for all v-model bindings
3. Use {{ref_state_xxx}} in body for state references
4. Always wrap form fields in AFormItem with label prop
5. Use props for literal values (placeholder, disabled, etc.)`;
