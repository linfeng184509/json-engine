# sop-permission

SOP流程权限控制，支持按步骤检查。

## ADDED Requirements

### Requirement: SOPStepPermission type

系统必须定义 SOPStepPermission 类型。

#### Scenario: SOP step permission structure
- **WHEN** 定义 SOP 步骤权限
- **THEN** 包含 `canExecute`, `canView`, `availableFields` 属性

### Requirement: canExecuteSOP

系统必须提供 `canExecuteSOP(sop: string, step?: number): boolean` 方法。

#### Scenario: Check SOP step execution
- **WHEN** 调用 `checker.canExecuteSOP('inbound-process', 1)`
- **AND** 用户有权执行此步骤
- **THEN** 返回 `true`

### Requirement: canViewSOP

系统必须提供 `canViewSOP(sop: string, step?: number): boolean` 方法。

#### Scenario: Check SOP step view
- **WHEN** 调用 `checker.canViewSOP('inbound-process', 2)`
- **AND** 用户有权查看此步骤
- **THEN** 返回 `true`

### Requirement: getSOPFields

系统必须提供 `getSOPFields(sop: string, step: number): string[]` 方法。

#### Scenario: Get available fields for step
- **WHEN** 调用 `checker.getSOPFields('inbound-process', 1)`
- **AND** 此步骤只能访问部分字段
- **THEN** 返回可用字段列表 `['orderNo', 'sku', 'qty', 'location']`

### Requirement: SOP directive

系统必须在组件中支持 SOP 权限指令。

#### Scenario: SOP permission directive
- **WHEN** 使用 `directives: { sopPermission: { sop: 'inbound-process', step: 1 } }`
- **AND** 用户无权限
- **THEN** 组件不渲染
