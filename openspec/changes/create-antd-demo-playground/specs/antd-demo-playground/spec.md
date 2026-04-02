## ADDED Requirements

### Requirement: Project structure follows monorepo conventions
The antd-demo-playground project SHALL follow the same structure as enterprise-admin package.

#### Scenario: package.json configuration
- **WHEN** creating package.json
- **THEN** it SHALL include dependencies on @json-engine/vue-json, @json-engine/plugin-antd, @json-engine/plugin-router
- **AND** it SHALL include devDependencies on vite, typescript, @vitejs/plugin-vue

#### Scenario: vite.config.ts aliases
- **WHEN** creating vite.config.ts
- **THEN** it SHALL configure aliases for all @json-engine/* packages pointing to src/packages/*

### Requirement: Plugin configuration enables icons
The app.json SHALL configure plugin-antd with includeIcons: true.

#### Scenario: Icons registered globally
- **WHEN** app.json configures `{ "antd": { "includeIcons": true } }`
- **THEN** all @ant-design/icons-vue icons SHALL be available in JSON Schema

### Requirement: Navigation layout with sidebar
The app SHALL provide a sidebar navigation for component categories.

#### Scenario: Sidebar shows component categories
- **WHEN** user visits the app
- **THEN** sidebar SHALL show categories: 通用, 布局, 导航, 数据录入, 数据展示, 反馈, 其他
- **AND** each category SHALL list its components as clickable items

#### Scenario: Clicking component shows demo list
- **WHEN** user clicks a component in sidebar
- **THEN** content area SHALL show list of available demos for that component
- **AND** clicking a demo SHALL render the demo

### Requirement: Demo JSON Schema structure
Each demo SHALL be a valid VueJsonSchema with render definition.

#### Scenario: Basic component demo
- **WHEN** demo JSON defines `{ "name": "ButtonBasicDemo", "render": { "type": "template", "content": { "type": "AButton", ... } } }`
- **THEN** the schema SHALL be loadable and renderable by vue-json

#### Scenario: Demo with v-model arg
- **WHEN** demo uses `{ "directives": { "vModel": { "prop": "...", "arg": "open" } } }`
- **THEN** the demo SHALL correctly bind v-model:open

#### Scenario: Demo with slot props
- **WHEN** demo uses `{ "directives": { "vSlot": { "name": "bodyCell", "props": ["column", "record"] } } }`
- **THEN** the demo SHALL correctly render slot with props

### Requirement: Demo source code viewer
The app SHALL provide ability to view the JSON Schema source.

#### Scenario: Toggle source view
- **WHEN** user clicks "View Source" button
- **THEN** app SHALL display the JSON Schema in formatted code block
- **AND** user SHALL be able to copy the JSON
