## ADDED Requirements

### Requirement: plugin-antd registers icon components
The plugin-antd SHALL register icon components from @ant-design/icons-vue as global components.

#### Scenario: icons available after plugin installation
- **WHEN** plugin-antd is installed with `{ includeIcons: true }`
- **THEN** all icons SHALL be available via `getGlobalComponents()` with correct PascalCase names

### Requirement: plugin-antd scope extended with API methods
The plugin-antd SHALL extend CoreScope with `_antd` containing message, notification, and modal API methods.

#### Scenario: _antd scope available in context
- **WHEN** plugin-antd is installed
- **THEN** the CoreScope SHALL include `_antd` object with message, notification, and modal properties