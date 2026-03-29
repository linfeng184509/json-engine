## ADDED Requirements

### Requirement: Application Schema Structure

The system SHALL support an enterprise application-level JSON Schema that defines the complete application configuration including router, stores, UI components, network settings, and WebSocket connections.

#### Scenario: Valid app schema with all configuration sections

- **WHEN** an app.json schema is loaded containing name, version, router, stores, ui, network, websocket, and auth sections
- **THEN** the system SHALL parse and initialize all sections without errors

#### Scenario: App schema with minimal required sections

- **WHEN** an app.json schema contains only name and router sections
- **THEN** the system SHALL successfully initialize the application with default values for missing optional sections

### Requirement: Router Configuration

The system SHALL support router configuration in the app schema with routes, history mode, and navigation guards.

#### Scenario: Routes with login page and protected routes

- **WHEN** router config defines routes including login page at '/login' and protected routes with requiresAuth meta
- **THEN** the system SHALL render login page when navigating to '/login' and enforce auth guard on protected routes

#### Scenario: Hash mode history

- **WHEN** router history mode is set to 'hash'
- **THEN** the system SHALL use hash-based routing (e.g., /#/login)

### Requirement: UI Component Registration

The system SHALL support registering external UI component libraries (Ant Design Vue) into the vue-json renderer.

#### Scenario: Register Ant Design Vue components

- **WHEN** ui config specifies Ant Design Vue components to register
- **THEN** the system SHALL make all registered components available in JSON Schema render templates

#### Scenario: Theme customization

- **WHEN** ui theme config specifies primaryColor and borderRadius
- **THEN** the system SHALL apply theme customizations to all Ant Design components

### Requirement: WebSocket Configuration

The system SHALL support WebSocket connection configuration in the app schema with URL, auto-reconnect, and heartbeat settings.

#### Scenario: WebSocket auto-reconnect enabled

- **WHEN** websocket config has autoReconnect=true and reconnectInterval=5000
- **THEN** the system SHALL automatically reconnect to WebSocket server after connection loss with 5-second interval

#### Scenario: WebSocket heartbeat enabled

- **WHEN** websocket config has heartbeatInterval=30000
- **THEN** the system SHALL send heartbeat messages every 30 seconds to maintain connection

### Requirement: Network Configuration

The system SHALL support HTTP client configuration with base URL, timeout, and retry settings.

#### Scenario: Axios configuration with retry

- **WHEN** network axios config specifies baseURL, timeout, and retry settings
- **THEN** the system SHALL configure HTTP client with retry logic for failed requests

### Requirement: Storage Configuration

The system SHALL support localStorage/sessionStorage configuration with prefix and encryption options.

#### Scenario: Storage with prefix

- **WHEN** storage config specifies prefix='enterprise_admin_'
- **THEN** all stored keys SHALL be prefixed with 'enterprise_admin_'

#### Scenario: Token persistence

- **WHEN** auth token is stored via configured storage
- **THEN** the token SHALL persist across page refreshes and be retrievable on app restart