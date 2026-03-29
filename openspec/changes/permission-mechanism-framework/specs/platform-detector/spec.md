# platform-detector

平台检测器，识别设备类型。

## ADDED Requirements

### Requirement: Platform type

系统必须定义支持的平台类型。

#### Scenario: Platform types
- **WHEN** 定义平台类型
- **THEN** 包含 `'pc-browser' | 'pc-client' | 'pda' | 'pad'`

### Requirement: detect method

系统必须提供 `detect(): PlatformInfo` 方法自动检测平台。

#### Scenario: Detect PC browser
- **WHEN** 在浏览器环境运行
- **AND** 用户代理包含 'Mozilla'
- **AND** 屏幕宽度大于 768px
- **AND** 触控点数为 0
- **THEN** 返回平台为 `'pc-browser'`

#### Scenario: Detect PDA
- **WHEN** 在 PDA 设备运行
- **AND** 屏幕宽度小于 480px
- **AND** 触控点大于 0
- **THEN** 返回平台为 `'pda'`

#### Scenario: Detect PAD
- **WHEN** 在平板设备运行
- **AND** 屏幕宽度在 481px - 1024px 之间
- **AND** 触控点大于 0
- **THEN** 返回平台为 `'pad'`

#### Scenario: Detect PC client
- **WHEN** 在 Electron 客户端运行
- **AND** 存在 `window.electron` 对象
- **THEN** 返回平台为 `'pc-client'`

### Requirement: PlatformFeatures

系统必须定义各平台的功能特性。

#### Scenario: PC browser features
- **WHEN** 获取 PC 浏览器平台信息
- **THEN** features 包含 `'fullscreen'`, `'print'`, `'export'`

#### Scenario: PDA features
- **WHEN** 获取 PDA 平台信息
- **AND** features 包含 `'scan'`, `'nfc'`, `'offline'`

### Requirement: getPlatform method

系统必须通过 PermissionProvider 提供 `getPlatform(): string` 方法。

#### Scenario: Get platform via provider
- **WHEN** 调用 `provider.getPlatform()`
- **THEN** 返回当前平台代码
