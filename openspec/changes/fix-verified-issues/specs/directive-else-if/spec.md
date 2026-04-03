## ADDED Requirements

### Requirement: v-else-if SHALL be evaluated as conditional chain
The `v-else-if` directive SHALL be evaluated as part of a conditional chain with preceding `v-if` or `v-else-if` directives. Only the first truthy condition in the chain SHALL be rendered.

#### Scenario: v-else-if renders when preceding v-if is false
- **WHEN** a node has `v-if` evaluating to false and a following node has `v-else-if` evaluating to true
- **THEN** the `v-else-if` node is rendered and the `v-if` node is not

#### Scenario: v-else-if does not render when preceding v-if is true
- **WHEN** a node has `v-if` evaluating to true and a following node has `v-else-if`
- **THEN** the `v-if` node is rendered and the `v-else-if` node is not

#### Scenario: v-else-if chain stops at first truthy
- **WHEN** multiple consecutive `v-else-if` directives exist
- **THEN** only the first one that evaluates to truthy is rendered

### Requirement: v-else SHALL render as fallback
The `v-else` directive SHALL render its node when no preceding `v-if` or `v-else-if` in the chain evaluated to truthy.

#### Scenario: v-else renders when all preceding conditions are false
- **WHEN** a node has `v-else` and all preceding `v-if`/`v-else-if` in the chain evaluated to false
- **THEN** the `v-else` node is rendered

#### Scenario: v-else does not render when a preceding condition is true
- **WHEN** a node has `v-else` and a preceding `v-if` or `v-else-if` evaluated to true
- **THEN** the `v-else` node is not rendered
