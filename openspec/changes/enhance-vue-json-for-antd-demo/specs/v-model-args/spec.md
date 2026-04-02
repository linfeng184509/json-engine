## ADDED Requirements

### Requirement: v-model supports argument parameter
The v-model directive SHALL support argument parameter to bind custom props and events (e.g., `v-model:open`, `v-model:checked`, `v-model:value`).

#### Scenario: v-model with open argument
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": { "type": "state", "body": "{{ref_state_open}}" }, "arg": "open" } } }`
- **THEN** the rendered component SHALL bind `open` prop and listen to `update:open` event

#### Scenario: v-model with checked argument
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": { "type": "state", "body": "{{ref_state_checked}}" }, "arg": "checked" } } }`
- **THEN** the rendered component SHALL bind `checked` prop and listen to `update:checked` event

#### Scenario: v-model with value argument
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": { "type": "state", "body": "{{ref_state_formData.name}}" }, "arg": "value" } } }`
- **THEN** the rendered component SHALL bind `value` prop and listen to `update:value` event

#### Scenario: v-model without argument defaults to modelValue
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": { "type": "state", "body": "{{ref_state_text}}" } } } }` without `arg`
- **THEN** the rendered component SHALL bind `modelValue` prop and listen to `update:modelValue` event (backward compatible)

### Requirement: v-model supports custom event name
The v-model directive SHALL support custom event name override via the `event` field.

#### Scenario: custom event name override
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": { "type": "state", "body": "{{ref_state_data}}" }, "arg": "value", "event": "change" } } }`
- **THEN** the rendered component SHALL listen to `change` event instead of `update:value`

### Requirement: v-model type definition extension
The VNodeDirectives type SHALL include `arg` and `event` optional fields in vModel definition.

#### Scenario: type definition includes arg field
- **WHEN** TypeScript compiles schema with `{ "directives": { "vModel": { "prop": "...", "arg": "open" } } }`
- **THEN** the type checker SHALL accept `arg` as a valid string field without error

#### Scenario: type definition includes event field
- **WHEN** TypeScript compiles schema with `{ "directives": { "vModel": { "prop": "...", "event": "change" } } }`
- **THEN** the type checker SHALL accept `event` as a valid string field without error