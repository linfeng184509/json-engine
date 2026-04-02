## ADDED Requirements

### Requirement: vModel directive definition extended
The VNodeDirectives.vModel type SHALL be extended to support `arg` and `event` optional fields while maintaining backward compatibility.

#### Scenario: existing vModel without arg still works
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": { "type": "state", "body": "{{ref_state_value}}" } } } }`
- **THEN** the system SHALL use default `modelValue` prop and `update:modelValue` event (no breaking change)

#### Scenario: vModel with arg field accepted
- **WHEN** schema defines `{ "directives": { "vModel": { "prop": "...", "arg": "open" } } }`
- **THEN** the type system SHALL accept the arg field without validation error