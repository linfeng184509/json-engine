## ADDED Requirements

### Requirement: Slot props isRef check
The system SHALL check if a slot prop value is already a Ref before wrapping it with `ref()`.

#### Scenario: Plain value wrapped correctly
- **WHEN** slot receives a plain value (e.g., number, string, object)
- **THEN** the value SHALL be wrapped with `ref(value)`

#### Scenario: Ref value passed through without double-wrapping
- **WHEN** slot receives a value that is already a Ref
- **THEN** the Ref SHALL be used directly without additional wrapping

#### Scenario: Example usage with v-slot
- **WHEN** schema defines `vSlot: { name: 'bodyCell', props: ['column', 'record'] }`
- **AND** parent component passes `column` and `record` as slot props
- **THEN** the resulting slot state SHALL contain the correct values
