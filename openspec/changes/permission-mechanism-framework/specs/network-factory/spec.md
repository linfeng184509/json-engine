# network-factory

axios 配置、WebSocket 连接管理。

## ADDED Requirements

### Requirement: AxiosConfig structure

系统必须定义 axios 配置类型。

#### Scenario: Basic axios config
- **WHEN** 配置网络设置
- **THEN** 包含 `axios.baseURL`, `axios.timeout`, `axios.headers` 字段

### Requirement: Request interceptor

系统必须支持请求拦截器配置。

#### Scenario: Add auth token
- **WHEN** 配置 `interceptors.request` 函数
- **THEN** 系统在请求前自动添加 token

### Requirement: Response interceptor

系统必须支持响应拦截器配置。

#### Scenario: Handle 401
- **WHEN** 配置 `interceptors.response.onRejected` 函数
- **AND** 收到 401 响应
- **THEN** 系统自动跳转到登录页

### Requirement: WebSocketConfig structure

系统必须定义 WebSocket 配置类型。

#### Scenario: Basic WS config
- **WHEN** 配置 WebSocket
- **THEN** 包含 `url`, `autoConnect`, `reconnect`, `heartbeat` 字段

### Requirement: Auto reconnect

系统必须支持自动重连。

#### Scenario: Reconnect on disconnect
- **WHEN** WebSocket 连接断开
- **AND** `reconnect.enabled: true`
- **THEN** 系统自动尝试重连

### Requirement: Heartbeat

系统必须支持心跳机制。

#### Scenario: Send heartbeat
- **WHEN** `heartbeat.enabled: true`
- **AND** 连接建立后
- **THEN** 系统定时发送心跳消息

### Requirement: Message bindings

系统必须支持消息到 state 的自动绑定。

#### Scenario: Bind message to state
- **WHEN** 配置 `bindings[0].type: "notification"`
- **AND** 收到 `notification` 类型消息
- **THEN** 系统自动更新对应 state
