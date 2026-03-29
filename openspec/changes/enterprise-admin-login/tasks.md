## 1. Project Setup

- [x] 1.1 Create enterprise-admin directory structure under src/packages/
- [x] 1.2 Create package.json with dependencies (vue, ant-design-vue, vite-plugin-mock)
- [x] 1.3 Create vite.config.ts with Vue plugin and Mock plugin configuration
- [x] 1.4 Create tsconfig.json extending workspace configuration
- [x] 1.5 Create src/main.ts entry file
- [x] 1.6 Create src/App.vue root component
- [x] 1.7 Update workspace package.json workspaces to include enterprise-admin

## 2. Mock API Implementation

- [x] 2.1 Install vite-plugin-mock and mockjs dependencies
- [x] 2.2 Create src/mock/index.ts Mock entry configuration
- [x] 2.3 Implement POST /api/auth/login Mock (success/failure scenarios)
- [x] 2.4 Implement POST /api/auth/logout Mock
- [x] 2.5 Implement GET /api/auth/captcha Mock (generate random captcha)
- [x] 2.6 Implement POST /api/auth/refresh Mock (token renewal)
- [x] 2.7 Implement GET /api/user/info Mock (user profile)
- [x] 2.8 Implement GET /api/user/permissions Mock (permission codes)
- [x] 2.9 Implement GET /api/user/menus Mock (menu tree)
- [x] 2.10 Configure vite-plugin-mock in vite.config.ts

## 3. WebSocket Server Implementation

- [x] 3.1 Create server/ directory for WebSocket service
- [x] 3.2 Create server/package.json (ws, typescript dependencies)
- [x] 3.3 Create server/tsconfig.json
- [x] 3.4 Create server/src/index.ts WebSocket server entry
- [x] 3.5 Implement token authentication on WebSocket connection
- [x] 3.6 Implement auth:login and auth:logout message handlers
- [x] 3.7 Implement auth:kick duplicate session handling
- [x] 3.8 Implement auth:session-expired notification
- [x] 3.9 Implement notification:push and notification:ack handlers
- [x] 3.10 Implement heartbeat mechanism (30s interval, 3 retry limit)
- [x] 3.11 Add start script to server/package.json

## 4. WebSocket Client Integration

- [x] 4.1 Create src/websocket/client.ts WebSocket client wrapper
- [x] 4.2 Implement connection with token authentication
- [x] 4.3 Implement auto-reconnect with exponential backoff
- [x] 4.4 Implement message routing to handlers
- [x] 4.5 Implement heartbeat response mechanism
- [x] 4.6 Create src/websocket/handlers.ts for message handlers
- [x] 4.7 Integrate WebSocket client with vue-json network config

## 5. Enterprise App Configuration Schema

- [x] 5.1 Create src/schemas/app.json application-level schema
- [x] 5.2 Define router configuration with login and dashboard routes
- [x] 5.3 Define ui configuration for Ant Design Vue component registration
- [x] 5.4 Define network configuration with axios baseURL
- [x] 5.5 Define websocket configuration (URL, reconnect, heartbeat)
- [x] 5.6 Define storage configuration with token prefix
- [x] 5.7 Define auth configuration with permission provider

## 6. Login Page Schema Implementation

- [x] 6.1 Create src/schemas/pages/login.json
- [x] 6.2 Define props section (title, logo)
- [x] 6.3 Define state section (formData reactive, loading ref, captcha, errors)
- [x] 6.4 Define computed section (isValid, submitDisabled)
- [x] 6.5 Define methods section (handleLogin, validateForm, handleCaptcha)
- [x] 6.6 Define lifecycle section (onMounted: fetch captcha)
- [x] 6.7 Define render section with Ant Design Form structure
- [x] 6.8 Implement form items for username, password, captcha, rememberMe
- [x] 6.9 Implement login button with loading state
- [x] 6.10 Define styles section with Ant Design design values (1440px canvas, 8px grid, #1677ff brand color)

## 7. Vue-Json Integration

- [x] 7.1 Register Ant Design Vue components in vue-json ui config
- [x] 7.2 Create component registration utility for Ant Design Vue
- [x] 7.3 Test a-form, a-input, a-button, a-checkbox rendering
- [x] 7.4 Integrate login.json with vue-json runtime
- [x] 7.5 Configure router with login route pointing to login.json
- [x] 7.6 Add auth guard to protected routes

## 8. Error Pages

- [x] 8.1 Create src/schemas/pages/404.json error page
- [x] 8.2 Add 404 route to router configuration

## 9. Testing

- [x] 9.1 Write unit tests for login.json schema parsing
- [x] 9.2 Write unit tests for Mock API responses
- [x] 9.3 Write unit tests for WebSocket message handling
- [x] 9.4 Write integration test for login flow (submit → API → redirect)
- [x] 9.5 Write integration test for WebSocket connection on login success
- [x] 9.6 Run npm run lint and npm run typecheck

## 10. Final Verification

- [x] 10.1 Run npm run build:packages to verify all packages build
- [x] 10.2 Start WebSocket server (cd server && npm run start)
- [x] 10.3 Start enterprise-admin dev server (npm run dev)
- [x] 10.4 Verify login page renders correctly with Ant Design styles
- [x] 10.5 Test login with admin/admin123 credentials
- [x] 10.6 Verify WebSocket connection established on login
- [x] 10.7 Test duplicate login kick mechanism