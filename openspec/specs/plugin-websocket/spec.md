# plugin-websocket

WebSocket 插件，提供 `_ws` Scope。

## ADDED Requirements

### Requirement: Register websocket plugin

系统必须支持注册 websocket 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-websocket" }`
- **THEN** 系统加载并初始化 websocket 插件

### Requirement: Provide _ws scope

插件必须提供 `_ws` Scope 扩展。

#### Scenario: Send message
- **WHEN** 调用 `$_[core]_ws.send("channel", data)`
- **THEN** 通过 WebSocket 发送数据

#### Scenario: Subscribe channel
- **WHEN** 调用 `$_[core]_ws.subscribe("channel", handler)`
- **THEN** 订阅指定频道

#### Scenario: Unsubscribe channel
- **WHEN** 调用 `$_[core]_ws.unsubscribe("channel", handler)`
- **THEN** 取消订阅

### Requirement: Support websocket config

插件必须支持 WebSocket 配置。

#### Scenario: Configure URL
- **WHEN** 配置 `{ websocket: { url: "ws://localhost:8080" } }`
- **THEN** 连接到指定 WebSocket 服务器

#### Scenario: Configure auto reconnect
- **WHEN** 配置 `{ websocket: { autoReconnect: true, reconnectInterval: 3000 } }`
- **THEN** 断开后自动重连

#### Scenario: Configure heartbeat
- **WHEN** 配置 `{ websocket: { heartbeatInterval: 30000 } }`
- **THEN** 定期发送心跳包

### Requirement: Handle connection lifecycle

插件必须处理连接生命周期。

#### Scenario: Auto connect on init
- **WHEN** 插件初始化
- **THEN** 自动建立 WebSocket 连接

#### Scenario: Close on unmount
- **WHEN** 应用卸载
- **THEN** 关闭所有 WebSocket 连接