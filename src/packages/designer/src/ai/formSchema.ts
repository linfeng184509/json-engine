/**
 * JSON Schema for structured output - ensures AI returns valid JsonVueComponentDef
 */
export const FORM_JSON_SCHEMA = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Form component name"
      },
      render: {
        type: "object",
        description: "Component tree root node",
        properties: {
          type: { type: "string", description: "Component type like AForm" },
          props: { type: "object", description: "Component props" },
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
        description: "Component state data",
        properties: {
          formData: { type: "object", description: "Form field values" }
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
        props: { type: "object", description: "Component props including v-model bindings" },
        children: {
          type: "array",
          items: { $ref: "#/definitions/VNodeDef" }
        }
      },
      required: ["type"]
    }
  }
};

/**
 * System prompt for AI form generation
 */
export const FORM_SYSTEM_PROMPT = `You are a form designer assistant. Generate form configurations in JsonVueComponentDef format.

Available components:
- AForm: Form container with layout props
- AFormItem: Form field wrapper with label/name props
- AInput: Text input with placeholder/v-model:value
- AInputPassword: Password input
- ATextArea: Multi-line text input with rows
- AInputNumber: Number input with min/max/step
- ASelect: Dropdown with options array
- ARadioGroup: Radio buttons with options
- ACheckboxGroup: Checkboxes with options
- ASwitch: Toggle switch with v-model:checked
- ADatePicker: Date picker
- ATimePicker: Time picker
- AUpload: File upload
- ARate: Star rating
- ASlider: Range slider
- ACascader: Cascading select
- ATransfer: Transfer list

Rules:
1. Use $state.formData.xxx for v-model bindings
2. Always wrap form fields in AFormItem with label and name
3. AForm must be the root node with locked:true
4. Use placeholder prop for input hints
5. Add validation rules in AFormItem when appropriate
6. State.formData should contain default values for all bound fields`;

