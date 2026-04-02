## ADDED Requirements

### Requirement: Ant Design icons registered as global components
All icons from `@ant-design/icons-vue` SHALL be registered as global components accessible in JSON Schema.

#### Scenario: basic icon component usage
- **WHEN** schema defines `{ "type": "SearchOutlined", "props": { "spin": true } }`
- **THEN** the system SHALL render the SearchOutlined icon component with spinning animation

#### Scenario: icon with custom props
- **WHEN** schema defines `{ "type": "SmileOutlined", "props": { "rotate": 180 } }`
- **THEN** the system SHALL render the SmileOutlined icon rotated 180 degrees

#### Scenario: filled icon component usage
- **WHEN** schema defines `{ "type": "SettingFilled" }`
- **THEN** the system SHALL render the SettingFilled icon component correctly

#### Scenario: outlined icon component usage
- **WHEN** schema defines `{ "type": "HomeOutlined" }`
- **THEN** the system SHALL render the HomeOutlined icon component correctly

### Requirement: Icon registration configurable
The plugin-antd SHALL support optional icon registration via configuration.

#### Scenario: icons registered when includeIcons is true
- **WHEN** plugin-antd config includes `{ "includeIcons": true }`
- **THEN** all icons from @ant-design/icons-vue SHALL be registered as global components

#### Scenario: icons not registered by default
- **WHEN** plugin-antd config does not specify includeIcons or sets it to false
- **THEN** icon components SHALL NOT be registered (reducing bundle size)

### Requirement: Icon component naming convention
Icon components SHALL use PascalCase naming matching @ant-design/icons-vue exports.

#### Scenario: icon naming follows antd convention
- **WHEN** accessing icon components in schema
- **THEN** icon names SHALL match exactly: SearchOutlined, HomeOutlined, SettingFilled, SmileOutlined, LoadingOutlined, etc.