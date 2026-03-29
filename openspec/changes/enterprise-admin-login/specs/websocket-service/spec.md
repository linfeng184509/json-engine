## ADDED Requirements

### Requirement: WebSocket Server Initialization

The WebSocket server SHALL initialize on configurable port and accept connections with token authentication.

#### Scenario: Server starts on port 8080

- **WHEN** WebSocket server is started
- **THEN** the server SHALL listen on port 8080 (or configurable port)

#### Scenario: Connection with valid token

- **WHEN** client connects with valid auth token in query parameter or header
- **THEN** the server SHALL accept connection and register client in session pool

#### Scenario: Connection without token

- **WHEN** client connects without auth token
- **THEN** the server SHALL reject connection with error message

### Requirement: Authentication Message Handling

The WebSocket server SHALL handle auth:login and auth:logout message types.

#### Scenario: Auth login message

- **WHEN** client sends { type: "auth:login", payload: { token: "xxx" } }
- **THEN** the server SHALL validate token and register session
- **AND** SHALL respond with { type: "auth:login:success", payload: { userId: 1 } }

#### Scenario: Auth logout message

- **WHEN** client sends { type: "auth:logout" }
- **THEN** the server SHALL remove session from pool and close connection

### Requirement: Multi-Session Kick Mechanism

The WebSocket server SHALL detect duplicate sessions and send kick notification to previous session.

#### Scenario: Same user connects from second device

- **WHEN** user with userId=1 already has active WebSocket session
- **AND** new connection from same userId=1 is established
- **THEN** the server SHALL send { type: "auth:kick", payload: { reason: "duplicate_login" } } to previous session
- **AND** SHALL close previous connection

#### Scenario: Kicked client receives notification

- **WHEN** client receives auth:kick message
- **THEN** the client SHALL display "You have been logged out due to login from another device" message

### Requirement: Session Expiry Notification

The WebSocket server SHALL notify client when session expires.

#### Scenario: Session expires

- **WHEN** user session token expires (simulated by server timer)
- **THEN** the server SHALL send { type: "auth:session-expired", payload: { reason: "token_expired" } }
- **AND** SHALL close connection

### Requirement: Notification Push

The WebSocket server SHALL support real-time notification push to connected clients.

#### Scenario: Push notification to specific user

- **WHEN** notification service sends message to userId=1
- **THEN** the server SHALL push { type: "notification:push", payload: { id: "uuid", title: "Alert", content: "...", level: "info" } } to user's WebSocket connection

#### Scenario: Broadcast notification to all users

- **WHEN** notification service sends broadcast message
- **THEN** the server SHALL push notification to all connected clients

### Requirement: Message Acknowledgment

The WebSocket server SHALL support message acknowledgment mechanism.

#### Scenario: Client acknowledges notification

- **WHEN** client receives notification and sends { type: "notification:ack", payload: { id: "uuid" } }
- **THEN** the server SHALL mark notification as delivered

### Requirement: Heartbeat Mechanism

The WebSocket server SHALL implement heartbeat to detect stale connections.

#### Scenario: Server heartbeat interval

- **WHEN** server heartbeat timer fires (every 30 seconds)
- **THEN** the server SHALL send { type: "heartbeat", payload: { timestamp: xxx } } to all clients

#### Scenario: Client heartbeat response

- **WHEN** client receives heartbeat and responds with { type: "heartbeat:ack" }
- **THEN** the server SHALL mark connection as alive

#### Scenario: Missing heartbeat responses

- **WHEN** client fails to respond to 3 consecutive heartbeats
- **THEN** the server SHALL close connection and remove from session pool

### Requirement: WebSocket Client Integration

The vue-json runtime SHALL integrate WebSocket client for connection management.

#### Scenario: Client connects on login success

- **WHEN** login succeeds and token is obtained
- **THEN** WebSocket client SHALL connect to configured WS URL with token

#### Scenario: Client reconnects after disconnect

- **WHEN** WebSocket connection is lost and autoReconnect is enabled
- **THEN** client SHALL attempt reconnect with exponential backoff (5s, 10s, 20s max)

#### Scenario: Client disconnects on logout

- **WHEN** user logs out
- **THEN** WebSocket client SHALL send auth:logout and close connection

### Requirement: WebSocket Message Routing

The vue-json runtime SHALL route WebSocket messages to appropriate handlers.

#### Scenario: Auth kick handler

- **WHEN** auth:kick message is received
- **THEN** the system SHALL call configured onKick callback to handle logout

#### Scenario: Notification push handler

- **WHEN** notification:push message is received
- **THEN** the system SHALL call configured onNotification callback to display notification