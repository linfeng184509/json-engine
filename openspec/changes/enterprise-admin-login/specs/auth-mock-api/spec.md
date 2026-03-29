## ADDED Requirements

### Requirement: Login API Mock

The system SHALL mock POST /api/auth/login endpoint returning success or failure based on credentials.

#### Scenario: Successful login with valid credentials

- **WHEN** POST /api/auth/login is called with username="admin" and password="admin123"
- **THEN** the mock SHALL return { success: true, token: "mock_token_xxx", expiresIn: 7200 }

#### Scenario: Failed login with invalid credentials

- **WHEN** POST /api/auth/login is called with username="admin" and password="wrong"
- **THEN** the mock SHALL return { success: false, error: "Invalid credentials" }

#### Scenario: Failed login with empty fields

- **WHEN** POST /api/auth/login is called with empty username or password
- **THEN** the mock SHALL return { success: false, error: "Username and password required" }

### Requirement: Logout API Mock

The system SHALL mock POST /api/auth/logout endpoint clearing session.

#### Scenario: Successful logout

- **WHEN** POST /api/auth/logout is called with valid token in header
- **THEN** the mock SHALL return { success: true }

#### Scenario: Logout without token

- **WHEN** POST /api/auth/logout is called without token
- **THEN** the mock SHALL return { success: false, error: "No active session" }

### Requirement: User Info API Mock

The system SHALL mock GET /api/user/info endpoint returning current user profile.

#### Scenario: Get user info with valid token

- **WHEN** GET /api/user/info is called with valid token
- **THEN** the mock SHALL return { id: 1, username: "admin", nickname: "Administrator", email: "admin@enterprise.com", avatar: "/assets/avatar.png" }

#### Scenario: Get user info without token

- **WHEN** GET /api/user/info is called without token
- **THEN** the mock SHALL return 401 Unauthorized

### Requirement: Permissions API Mock

The system SHALL mock GET /api/user/permissions endpoint returning user permission codes.

#### Scenario: Get admin permissions

- **WHEN** GET /api/user/permissions is called for admin user
- **THEN** the mock SHALL return ["system:manage", "user:view", "user:edit", "role:view", "dashboard:view"]

#### Scenario: Get regular user permissions

- **WHEN** GET /api/user/permissions is called for regular user
- **THEN** the mock SHALL return ["dashboard:view", "profile:edit"]

### Requirement: Menus API Mock

The system SHALL mock GET /api/user/menus endpoint returning user accessible menu tree.

#### Scenario: Get admin menus

- **WHEN** GET /api/user/menus is called for admin user
- **THEN** the mock SHALL return menu tree with Dashboard, System Management, User Management, Role Management nodes

#### Scenario: Get regular user menus

- **WHEN** GET /api/user/menus is called for regular user
- **THEN** the mock SHALL return menu tree with Dashboard and Profile nodes only

### Requirement: Captcha API Mock

The system SHALL mock GET /api/auth/captcha endpoint returning captcha image and code.

#### Scenario: Generate captcha

- **WHEN** GET /api/auth/captcha is called
- **THEN** the mock SHALL return { captchaId: "uuid_xxx", captchaImage: "base64_image_data" }

#### Scenario: Validate captcha

- **WHEN** login request includes captchaId and captchaCode
- **THEN** the mock SHALL validate captcha code against stored value

### Requirement: Token Refresh API Mock

The system SHALL mock POST /api/auth/refresh endpoint for token renewal.

#### Scenario: Refresh valid token

- **WHEN** POST /api/auth/refresh is called with valid token
- **THEN** the mock SHALL return { success: true, token: "new_mock_token_xxx", expiresIn: 7200 }

#### Scenario: Refresh expired token

- **WHEN** POST /api/auth/refresh is called with expired token
- **THEN** the mock SHALL return { success: false, error: "Token expired" }

### Requirement: Mock Data Persistence

The mock system SHALL support mock token persistence in localStorage for session continuity.

#### Scenario: Token stored after login

- **WHEN** login succeeds
- **THEN** mock token SHALL be stored in localStorage with key "enterprise_admin_token"

#### Scenario: Token retrieved on app start

- **WHEN** application starts and localStorage contains token
- **THEN** the system SHALL restore user session from stored token