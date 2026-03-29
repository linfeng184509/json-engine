## ADDED Requirements

### Requirement: Function body references are transformed at runtime

The runtime SHALL transform `ref_state_xxx` and `ref_props_xxx` references in function body strings to proper JavaScript expressions before execution.

#### Scenario: Transform simple state reference
- **WHEN** function body contains `ref_state_count++`
- **AND** state definition has `count: { type: 'ref' }`
- **THEN** transformed body SHALL contain `state.count.value++`

#### Scenario: Transform state reference with path
- **WHEN** function body contains `ref_state_formData.name = 'John'`
- **AND** state definition has `formData: { type: 'reactive' }`
- **THEN** transformed body SHALL contain `state.formData.name = 'John'`

#### Scenario: Transform props reference
- **WHEN** function body contains `ref_props_title`
- **THEN** transformed body SHALL contain `props.title`

### Requirement: Transformation respects ref vs reactive distinction

The runtime SHALL use state type information to determine whether `.value` accessor is needed.

#### Scenario: Ref type requires .value accessor
- **WHEN** state variable is defined as `{ type: 'ref' }`
- **AND** function body contains `ref_state_count`
- **THEN** transformation SHALL produce `state.count.value`

#### Scenario: Reactive type does not require .value accessor
- **WHEN** state variable is defined as `{ type: 'reactive' }`
- **AND** function body contains `ref_state_formData`
- **THEN** transformation SHALL produce `state.formData`

#### Scenario: ShallowRef type requires .value accessor
- **WHEN** state variable is defined as `{ type: 'shallowRef' }`
- **AND** function body contains `ref_state_items`
- **THEN** transformation SHALL produce `state.items.value`

### Requirement: State type information is available in render context

The RenderContext SHALL include a `stateTypes` field mapping state variable names to their type.

#### Scenario: StateTypes populated from state definition
- **WHEN** schema defines state as `{ count: { type: 'ref' }, errors: { type: 'reactive' } }`
- **THEN** context.stateTypes SHALL be `{ count: 'ref', errors: 'reactive' }`

### Requirement: Expression references in function body use standard format

Function body SHALL use `computed.xxx.value` for computed property access, not `ref_computed_xxx`.

#### Scenario: Access computed value in function body
- **WHEN** function body needs computed value
- **THEN** it SHALL use `computed.doubleCount.value` format

#### Scenario: Invalid ref_computed format is not transformed
- **WHEN** function body contains `ref_computed_xxx`
- **THEN** it SHALL NOT be transformed and may cause runtime error