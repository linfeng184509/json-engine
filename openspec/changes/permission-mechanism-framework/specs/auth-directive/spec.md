# auth-directive

权限指令，在组件中声明式使用权限。

## ADDED Requirements

### Requirement: permission directive

系统必须支持 `permission` 指令。

#### Scenario: Simple permission directive
- **WHEN** 使用 `directives: { permission: 'user.list.delete' }`
- **AND** 用户无此权限
- **THEN** 组件不渲染

#### Scenario: Permission with object config
- **WHEN** 使用 `directives: { permission: { required: 'user.list.view', anyOf: ['user.list.edit'] } }`
- **THEN** 同时满足 required 和 anyOf 时才渲染

### Requirement: fieldPermission directive

系统必须支持 `fieldPermission` 指令。

#### Scenario: Field permission directive
- **WHEN** 使用 `directives: { fieldPermission: { page: 'user-list', field: 'phone' } }`
- **AND** `mode` 默认为 `'read'`
- **AND** 用户无读权限
- **THEN** 组件不渲染或显示为只读

### Requirement: sopPermission directive

系统必须支持 `sopPermission` 指令。

#### Scenario: SOP permission directive
- **WHEN** 使用 `directives: { sopPermission: { sop: 'inbound-process', step: 1 } }`
- **AND** 用户无执行权限
- **THEN** 组件不渲染

### Requirement: platform directive

系统必须支持 `platform` 指令。

#### Scenario: Single platform directive
- **WHEN** 使用 `directives: { platform: 'pda' }`
- **AND** 当前平台不是 pda
- **THEN** 组件不渲染

#### Scenario: Multiple platforms directive
- **WHEN** 使用 `directives: { platform: ['pc-browser', 'pad'] }`
- **AND** 当前平台是 pda
- **THEN** 组件不渲染

#### Scenario: Exclude platform directive
- **WHEN** 使用 `directives: { platform: { exclude: 'pda' } }`
- **AND** 当前平台是 pda
- **THEN** 组件不渲染

### Requirement: Permission directive in render

系统必须在渲染时检查指令。

#### Scenario: Check on render
- **WHEN** 渲染包含 permission 指令的组件
- **THEN** 每次渲染前检查权限
- **AND** 无权限时不渲染组件
