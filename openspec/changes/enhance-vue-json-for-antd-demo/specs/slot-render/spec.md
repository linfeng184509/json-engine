## ADDED Requirements

### Requirement: Named slot rendering
The render-factory SHALL support named slot rendering via vSlot directive.

#### Scenario: default slot rendering
- **WHEN** schema defines `{ "type": "ACard", "children": [{ "type": "p", "children": ["content"] }], "directives": { "vSlot": { "name": "default" } } }`
- **THEN** the children SHALL be rendered as default slot content of ACard

#### Scenario: named slot rendering
- **WHEN** schema defines `{ "type": "ATabs", "children": [{ "type": "ATabPane", "directives": { "vSlot": { "name": "tab1" } } }] }`
- **THEN** the child SHALL be rendered in the named slot "tab1"

### Requirement: Slot props passing
The vSlot directive SHALL support slot props passing to child elements.

#### Scenario: slot with single prop
- **WHEN** schema defines `{ "type": "ATable", "children": [{ "directives": { "vSlot": { "name": "bodyCell", "props": ["column", "record"] } }, "children": [...] }] }`
- **THEN** the child template SHALL receive `column` and `record` props from the slot

#### Scenario: slot props used in children
- **WHEN** slot provides `{ column, record }` props
- **AND** child uses `{ "type": "expression", "body": "{{column.key}}" }`
- **THEN** the expression SHALL resolve using the slot-provided column prop

### Requirement: applyVSlot integration in render-factory
The render-factory SHALL call applyVSlot when vSlot directive is present.

#### Scenario: vSlot directive triggers slot rendering
- **WHEN** VNodeDefinition includes `{ "directives": { "vSlot": { ... } } }`
- **THEN** render-factory SHALL call applyVSlot and render children as slot function

### Requirement: Slot context extension
Slot children SHALL receive extended context with slot props.

#### Scenario: slot props injected into state
- **WHEN** slot defines `{ "props": ["column", "record"] }`
- **THEN** the slot children SHALL have access to `ref_state_column` and `ref_state_record` in their context