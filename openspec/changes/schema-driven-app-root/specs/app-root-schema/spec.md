## ADDED Requirements

### Requirement: App root schema structure
The system SHALL support an `app-root.json` schema with the following structure:

```json
{
  "name": "AppRoot",
  "state": {
    "isInitializing": { "type": "ref", "initial": true },
    "isLoading": { "type": "ref", "initial": false },
    "error": { "type": "ref", "initial": null },
    "appConfig": { "type": "reactive", "initial": null },
    "currentRoute": { "type": "ref", "initial": "/" },
    "pageSchemaPath": { "type": "ref", "initial": null }
  },
  "methods": {
    "initializeApp": "...",
    "loadPage": "...",
    "handleHashChange": "..."
  },
  "lifecycle": {
    "onMounted": "...",
    "onUnmounted": "..."
  },
  "render": { "type": "template", "content": { ... } }
}
```

#### Scenario: Parse app root schema
- **WHEN** `createComponent(appRootSchema)` is called
- **THEN** system creates a Vue component with all defined state, methods, lifecycle, and render

### Requirement: App initialization in schema lifecycle
The system SHALL allow app initialization logic in the `onMounted` lifecycle hook.

#### Scenario: Initialize app on mount
- **WHEN** AppRoot component mounts
- **THEN** `initializeApp` method is called to load app config and setup providers

#### Scenario: Handle initialization error
- **WHEN** initialization fails
- **THEN** `error` state is set and error UI is rendered

### Requirement: Route handling in schema
The system SHALL support hash-based route handling via schema methods.

#### Scenario: Handle hash change
- **WHEN** browser hash changes
- **THEN** `handleHashChange` method updates `currentRoute` and calls `loadPage`

#### Scenario: Navigate to new page
- **WHEN** `loadPage(route)` is called
- **THEN** `pageSchemaPath` is updated and PageLoader renders new page

### Requirement: Auth checking in schema methods
The system SHALL allow auth checking using CoreScope `_auth` API in schema methods.

#### Scenario: Check page access permission
- **WHEN** `scope._auth.canAccessPage('/dashboard')` is called in schema
- **THEN** returns true if user has permission, false otherwise

#### Scenario: Redirect to login on auth failure
- **WHEN** route requires auth and user lacks permission
- **THEN** schema redirects to `/login` via `window.location.hash`

### Requirement: App root render structure
The system SHALL render app root with conditional states:

#### Scenario: Render initialization state
- **WHEN** `isInitializing` is true
- **THEN** render loading/configuring UI

#### Scenario: Render page loading state
- **WHEN** `isLoading` is true and `isInitializing` is false
- **THEN** render page loading spinner

#### Scenario: Render error state
- **WHEN** `error` is not null
- **THEN** render error message with retry button

#### Scenario: Render page content
- **WHEN** `pageSchemaPath` is set and no error
- **THEN** render `<PageLoader :schemaPath="pageSchemaPath" />`