# lifecycle-hooks

生命周期钩子集成能力，支持 Vue 3 所有生命周期钩子。

## ADDED Requirements

### Requirement: Support onMounted hook

系统必须支持 `onMounted` 生命周期钩子。

#### Scenario: Register onMounted hook
- **WHEN** schema.lifecycle.onMounted 定义为函数体字符串
- **THEN** 系统在组件挂载后执行该函数

#### Scenario: Register multiple onMounted hooks
- **WHEN** schema.lifecycle.onMounted 定义为函数体字符串数组
- **THEN** 系统按顺序注册所有钩子

### Requirement: Support onUnmounted hook

系统必须支持 `onUnmounted` 生命周期钩子。

#### Scenario: Register onUnmounted hook
- **WHEN** schema.lifecycle.onUnmounted 定义为函数体字符串
- **THEN** 系统在组件卸载后执行该函数

### Requirement: Support onUpdated hook

系统必须支持 `onUpdated` 生命周期钩子。

#### Scenario: Register onUpdated hook
- **WHEN** schema.lifecycle.onUpdated 定义为函数体字符串
- **THEN** 系统在组件更新后执行该函数

### Requirement: Support onBeforeMount hook

系统必须支持 `onBeforeMount` 生命周期钩子。

#### Scenario: Register onBeforeMount hook
- **WHEN** schema.lifecycle.onBeforeMount 定义为函数体字符串
- **THEN** 系统在组件挂载前执行该函数

### Requirement: Support onBeforeUnmount hook

系统必须支持 `onBeforeUnmount` 生命周期钩子。

#### Scenario: Register onBeforeUnmount hook
- **WHEN** schema.lifecycle.onBeforeUnmount 定义为函数体字符串
- **THEN** 系统在组件卸载前执行该函数

### Requirement: Support onBeforeUpdate hook

系统必须支持 `onBeforeUpdate` 生命周期钩子。

#### Scenario: Register onBeforeUpdate hook
- **WHEN** schema.lifecycle.onBeforeUpdate 定义为函数体字符串
- **THEN** 系统在组件更新前执行该函数

### Requirement: Support onErrorCaptured hook

系统必须支持 `onErrorCaptured` 生命周期钩子。

#### Scenario: Capture child component error
- **WHEN** 子组件抛出错误且定义了 onErrorCaptured
- **THEN** 系统调用 onErrorCaptured 处理函数，传入错误对象

#### Scenario: Prevent error propagation
- **WHEN** onErrorCaptured 返回 false
- **THEN** 系统阻止错误继续向上传播

### Requirement: Support onActivated hook

系统必须支持 `onActivated` 生命周期钩子（用于 KeepAlive）。

#### Scenario: Register onActivated hook
- **WHEN** 组件在 KeepAlive 内被激活且定义了 onActivated
- **THEN** 系统调用 onActivated 处理函数

### Requirement: Support onDeactivated hook

系统必须支持 `onDeactivated` 生命周期钩子（用于 KeepAlive）。

#### Scenario: Register onDeactivated hook
- **WHEN** 组件在 KeepAlive 内被停用且定义了 onDeactivated
- **THEN** 系统调用 onDeactivated 处理函数

### Requirement: Provide context in lifecycle hooks

系统必须在生命周期钩子中提供完整的上下文访问。

#### Scenario: Access state in hook
- **WHEN** 钩子函数中访问 state
- **THEN** 系统提供正确的响应式状态引用

#### Scenario: Access methods in hook
- **WHEN** 钩子函数中调用 methods
- **THEN** 系统提供正确的方法引用