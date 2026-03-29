# multi-platform-config

各平台独立配置、菜单过滤。

## ADDED Requirements

### Requirement: Platform types

系统必须定义支持的平台类型。

#### Scenario: Define platforms
- **WHEN** 定义平台
- **THEN** 包含 `'pc-browser'`, `'pc-client'`, `'pda'`, `'pad'`

### Requirement: Platform-specific menus

系统必须支持按平台配置菜单。

#### Scenario: Filter menus by platform
- **WHEN** 用户登录 pc-browser 平台
- **THEN** 系统只显示该平台的菜单

#### Scenario: Different menus per platform
- **WHEN** 配置菜单 `"platform": "pda"`
- **AND** 用户使用 pc-browser
- **THEN** 该菜单不显示

### Requirement: Platform-specific pages

系统必须支持按平台配置页面。

#### Scenario: Page belongs to platform
- **WHEN** 配置页面 `"platform": "pad"`
- **AND** 用户访问 pc-browser
- **THEN** 该页面不可访问

### Requirement: Platform features

系统必须根据平台启用/禁用功能。

#### Scenario: Enable scan on PDA
- **WHEN** 用户使用 pda
- **THEN** 系统启用扫码功能

#### Scenario: Disable print on PDA
- **WHEN** 用户使用 pda
- **THEN** 打印功能不可用

### Requirement: Entry point per platform

系统必须支持各平台独立入口。

#### Scenario: Different entry for platform
- **WHEN** 配置 `"pc-browser".entryPath: "/dashboard"`
- **AND** 配置 `"pda".entryPath: "/scan/inbound"`
- **THEN** 各平台跳转到对应入口
