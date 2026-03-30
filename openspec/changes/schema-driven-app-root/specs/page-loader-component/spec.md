## ADDED Requirements

### Requirement: PageLoader component as dynamic page container
The system SHALL provide a built-in `PageLoader` component that renders a dynamically loaded schema.

#### Scenario: Render loaded page schema
- **WHEN** `<PageLoader schemaPath="/schemas/pages/dashboard.json" />` is rendered
- **THEN** PageLoader fetches the schema, creates component, and renders it

#### Scenario: Pass extra components to loaded schema
- **WHEN** `<PageLoader schemaPath="..." :extraComponents="customComponents" />` is used
- **THEN** loaded schema can use the provided extra components

### Requirement: PageLoader loading state
The system SHALL display loading state while fetching schema.

#### Scenario: Show loading spinner
- **WHEN** PageLoader is fetching schema
- **THEN** it renders a configurable loading slot or default spinner

#### Scenario: Hide loading after component ready
- **WHEN** schema fetch completes and component is created
- **THEN** loading state is hidden and page component is rendered

### Requirement: PageLoader error handling
The system SHALL handle schema load errors gracefully.

#### Scenario: Display error on failed load
- **WHEN** schema fetch fails or validation errors
- **THEN** PageLoader renders error slot or default error message

#### Scenario: Retry loading on error
- **WHEN** `retry()` method is called on PageLoader ref
- **THEN** PageLoader re-fetches the schema

### Requirement: PageLoader props interface
The system SHALL define PageLoader props as follows:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| schemaPath | string | required | Path to JSON schema |
| cache | boolean | true | Enable schema caching |
| extraComponents | object | {} | Components passed to loaded schema |
| loadingSlot | VNode | null | Custom loading UI |
| errorSlot | VNode | null | Custom error UI |

#### Scenario: Use custom loading slot
- **WHEN** `<PageLoader><template #loading>Custom Spinner</template></PageLoader>`
- **THEN** custom loading UI is displayed during fetch

#### Scenario: Use custom error slot
- **WHEN** `<PageLoader><template #error="{ error }">...</template></PageLoader>`
- **THEN** custom error UI is displayed on failure