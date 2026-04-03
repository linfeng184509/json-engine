# JSON Engine

A JSON-driven UI framework for Vue 3. Define entire Vue applications — components, state, routing, API calls, charts, auth, i18n — as JSON schemas and render them dynamically at runtime.

## Overview

JSON Engine enables **low-code / no-code UI development** where applications are defined, stored, and served as JSON, then dynamically rendered in the browser. No code compilation needed.

```
JSON Schema → Parser → Vue Components → Rendered UI
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Applications                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  Enterprise Admin    │  │  Ant Design Playground   │ │
│  │  (all 9 plugins)     │  │  (antd + router)         │ │
│  └──────────┬───────────┘  └────────────┬─────────────┘ │
└─────────────┼───────────────────────────┼───────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Plugin Layer                           │
│  antd │ axios │ router │ echarts │ websocket │ storage  │
│  pinia │ auth │ i18n                                    │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   @vue-json         │  Vue rendering engine
              │  (state, computed,  │  VNode rendering, directives
              │   watchers, parser) │  plugin registry, schema loader
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  @core-engine       │  Pure parsing engine
              │  (DSL parser,       │  $ref, $expr, $fn, $scope
              │   regex, cache)     │  JSON normalization, validation
              └─────────────────────┘
```

## Packages

### Core Libraries

| Package | Description |
|---------|-------------|
| `@json-engine/core-engine` | Core parsing engine — interprets DSL embedded in JSON values |
| `@json-engine/vue-json` | Vue 3 rendering engine — parses JSON schemas into live Vue components |
| `@json-engine/types` | Shared TypeScript type definitions for plugins |

### Plugins

| Package | Purpose |
|---------|---------|
| `@json-engine/plugin-antd` | Ant Design Vue component registry |
| `@json-engine/plugin-axios` | HTTP API calls via Axios |
| `@json-engine/plugin-router` | Vue Router integration for navigation |
| `@json-engine/plugin-echarts` | ECharts data visualization |
| `@json-engine/plugin-websocket` | WebSocket real-time communication |
| `@json-engine/plugin-storage` | Browser localStorage/sessionStorage |
| `@json-engine/plugin-pinia` | Pinia state management |
| `@json-engine/plugin-auth` | Authentication and authorization |
| `@json-engine/plugin-i18n` | Internationalization |

### Applications

| Package | Description |
|---------|-------------|
| `@json-engine/antd-demo-playground` | Demo playground with 100+ Ant Design component demos |
| `@json-engine/enterprise-admin` | Full enterprise admin dashboard with all plugins integrated |

### Server

| Package | Description |
|---------|-------------|
| `@json-enterprise/websocket-server` | Standalone WebSocket server for real-time communication |

## DSL Syntax

JSON Engine uses a domain-specific language embedded in JSON values:

| Syntax | Purpose | Example |
|--------|---------|---------|
| `$ref` | Variable reference | `{ "$ref": "state.count" }` |
| `$expr` | JavaScript expression | `{ "$expr": "$state.count > 0" }` |
| `$fn` | Function body | `{ "$fn": "console.log(args[0])" }` |
| `$scope` | Scope variable access | `{ "$scope": "coreScope._antd.message" }` |

### Schema Structure

```json
{
  "name": "MyComponent",
  "props": { "title": { "type": "string", "default": "Hello" } },
  "state": { "count": { "type": "ref", "initial": 0 } },
  "computed": { "doubled": { "expression": "$state.count * 2" } },
  "methods": { "increment": { "$fn": "$state.count++" } },
  "watch": { "count": { "handler": { "$fn": "console.log(args[0])" } } },
  "render": {
    "type": "template",
    "content": {
      "type": "AButton",
      "directives": { "vOn": { "click": { "$fn": "methods.increment()" } } },
      "children": ["Count: ", { "$ref": "state.count" }]
    }
  }
}
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Development

```bash
# Start Ant Design demo playground (port 3003)
npm run dev --workspace=@json-engine/antd-demo-playground

# Start Enterprise Admin dashboard (port 3002)
npm run dev --workspace=@json-engine/enterprise-admin
```

### Build

```bash
# Build all packages
npm run build:packages

# Build specific package
npm run build --workspace=@json-engine/vue-json
```

### Test

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Type Check

```bash
npm run typecheck
```

## Project Structure

```
json-engine/
├── src/packages/
│   ├── core-engine/          # Core parsing engine
│   ├── vue-json/             # Vue 3 rendering engine
│   ├── types/                # Shared type definitions
│   ├── plugins/
│   │   ├── plugin-antd/      # Ant Design Vue components
│   │   ├── plugin-axios/     # HTTP API calls
│   │   ├── plugin-router/    # Vue Router integration
│   │   ├── plugin-echarts/   # ECharts visualization
│   │   ├── plugin-websocket/ # WebSocket communication
│   │   ├── plugin-storage/   # Browser storage
│   │   ├── plugin-pinia/     # Pinia state management
│   │   ├── plugin-auth/      # Authentication
│   │   └── plugin-i18n/      # Internationalization
│   ├── antd-demo-playground/ # Demo application (~100+ schemas)
│   └── enterprise-admin/     # Admin dashboard application
├── server/
│   └── websocket-server/     # WebSocket server
├── openspec/                 # OpenSpec change tracking
└── package.json
```

## Key Features

- **Dynamic Rendering**: JSON schemas parsed and rendered as Vue components at runtime
- **Full Component Lifecycle**: props, state, computed, methods, watch, lifecycle hooks, provide/inject
- **Plugin Architecture**: Extensible plugin system for adding capabilities
- **Type Safety**: Full TypeScript support with generated type definitions
- **Schema Loading**: Fetch schemas from URLs with caching
- **100+ Demo Schemas**: Comprehensive Ant Design component demos as JSON
- **Enterprise Ready**: Admin dashboard with login, charts, role management

## License

MIT
