---
name: json-app-development
description: "Develop Vue applications using pure JSON Schema. Covers DSL value types ($ref, $expr, $fn, $scope), component schema structure, VNode definitions, directive system, state management, and validation. Use when writing, reviewing, or validating vue-json schemas for @json-engine/core-engine and @json-engine/vue-json."
license: MIT
compatibility: Vue 3, @json-engine/core-engine, @json-engine/vue-json
metadata:
  author: json-engine
  version: "1.0"
---

# JSON App Development Skill

Guide for developing Vue applications using pure JSON Schema with json-engine. The engine parses JSON at runtime and dynamically creates Vue components.

## When to Apply

### Must Use

- Writing or editing vue-json component schemas
- Creating JSON definitions for Vue components
- Validating JSON schema structure against core-engine spec
- Adding state, computed, methods, or lifecycle hooks via JSON
- Working with VNode render trees in JSON format

### Recommended

- Reviewing existing JSON schemas for correctness
- Debugging schema parsing issues
- Learning the DSL value type system

### Skip

- Writing standard `.vue` SFC files
- Backend or API development
- Non-Vue framework work

---

## Architecture

| Package | Role |
|---------|------|
| `@json-engine/core-engine` | Core parser — DSL value resolution, reference parsing, cache, debug tracing |
| `@json-engine/vue-json` | Vue runtime — component creation, directive system, state factories, render engine |

---

## DSL Value Types

All dynamic values use one of four structured formats.

### 1. `$ref` — Reference Values

Reference state, props, or computed.

```json
{ "$ref": "state.count" }
{ "$ref": "props.userId" }
{ "$ref": "computed.fullName" }
{ "$ref": "state.formData.username" }
```

**Rules:**
- Must contain a dot `.` separating prefix from variable
- Valid prefixes: `state`, `props`, `computed`
- Format: `prefix.variable` or `prefix.variable.nested.path`
- Without a dot, the value is silently returned unchanged (invalid)

### 2. `$expr` — Expression Values

JavaScript expressions evaluated at runtime via `new Function()`.

```json
{ "$expr": "$state.count > 0" }
{ "$expr": "$state.user?.name || 'Anonymous'" }
{ "$expr": "$props.title" }
```

**Auto-transformations in expressions:**

| Write | Becomes |
|-------|---------|
| `$state.xxx` | `state.xxx` |
| `$props.xxx` | `props.xxx` |
| `$computed.xxx` | `computed.xxx` |
| `$_core.xxx` | `coreScope._xxx` |

**Available context:** `props`, `state`, `computed`, `methods`, `emit`, `slots`, `attrs`, `provide`, `coreScope`

**Note:** `state` is a Proxy that auto-unwraps `.value`. Write `$state.count`, not `$state.count.value`.

### 3. `$fn` — Function Values

Inline JavaScript function bodies.

**Shorthand (no params):**
```json
{ "$fn": "state.count++" }
```

**With params (object format):**
```json
{
  "$fn": {
    "params": ["event", "data"],
    "body": "console.log(event, data)"
  }
}
```

**With params (inline triple-brace JSON):**
```json
{ "$fn": "console.log(args[0])", "params": "{{{ {\"event\": null} }}}" }
```

**Auto-transformations in function body:**

| Write | Becomes |
|-------|---------|
| `$event` | `args[0]` |
| `$state.xxx` | `state.xxx` |
| `$props.xxx` | `props.xxx` |
| `$computed.xxx` | `computed.xxx` |

**Available context:** `props`, `state`, `computed`, `methods`, `emit`, `slots`, `attrs`, `provide`, `args`, `coreScope`

**Validation rules:**
- `body` must be a string
- `params` must be an object (or `{{{...}}}` JSON string)

### 4. `$scope` — Service Injection

Access core services.

```json
{ "$scope": "core.api" }
{ "$scope": "core.storage" }
```

**Available scope names:** `core`, `goal`

**CoreScope services (via `$_core`):**

| Service | Methods |
|---------|---------|
| `$_core._auth` | `has()`, `hasAny()`, `hasRole()`, `canAccessPage()` |
| `$_core._i18n` | `t()`, `locale`, `setLocale()` |
| `$_core._storage` | `get()`, `set()`, `remove()`, `has()` |
| `$_core._api` | `get()`, `post()`, `put()`, `delete()` |
| `$_core._ws` | `send()`, `subscribe()`, `connect()` |
| `$_core._loader` | `load()`, `clearCache()`, `preload()` |
| `$_core._router` | `push()`, `replace()`, `go()`, `back()` |
| `$_core._pinia` | Pinia store map |

---

## Component Schema Structure

```json
{
  "name": "MyComponent",
  "props": { ... },
  "emits": { ... },
  "state": { ... },
  "computed": { ... },
  "methods": { ... },
  "watch": { ... },
  "provide": { "items": [...] },
  "inject": { "items": [...] },
  "lifecycle": { ... },
  "components": { ... },
  "render": { ... },
  "styles": { "css": "...", "scoped": true }
}
```

**Required:** `name` (non-empty string), `render` (object)

### State

```json
"state": {
  "count": { "type": "ref", "initial": 0 },
  "formData": { "type": "reactive", "initial": { "name": "", "age": 0 } },
  "user": { "type": "shallowRef", "initial": null },
  "config": { "type": "shallowReactive", "initial": { "theme": "dark" } },
  "nameRef": { "type": "toRef", "source": "props", "key": "name" },
  "allRefs": { "type": "toRefs", "source": "props" },
  "readOnlyConfig": { "type": "readonly", "source": "state.formData" }
}
```

| type | Description | initial requirement |
|------|-------------|---------------------|
| `ref` | `ref(initial)` | any value |
| `reactive` | `reactive(initial)` | must be object, defaults to `{}` |
| `shallowRef` | `shallowRef(initial)` | any value |
| `shallowReactive` | `shallowReactive(initial)` | must be object |
| `toRef` | `toRef(source, key)` | requires `source` + `key` |
| `toRefs` | `toRefs(source)` | requires `source` |
| `readonly` | `readonly(source)` | requires `source` |

### Computed

```json
"computed": {
  "isValid": {
    "get": { "$fn": "return state.count > 0" }
  },
  "fullName": {
    "get": { "$fn": "return state.firstName + ' ' + state.lastName" },
    "set": { "$fn": "var parts = args[0].split(' '); state.firstName = parts[0]" }
  }
}
```

- `get` required, `set` optional
- Values must be `$fn` format

### Methods

```json
"methods": {
  "increment": { "$fn": "state.count++" },
  "loadData": {
    "$fn": "$_core._api.get('/api/data').then(function(res) { state.items = res.data })"
  }
}
```

### Watch

```json
"watch": {
  "watchCount": {
    "source": { "$expr": "$state.count" },
    "handler": { "$fn": "console.log('changed:', args[0])" },
    "immediate": true,
    "deep": false,
    "flush": "post",
    "type": "watch"
  }
}
```

- `type`: `"watch"` | `"effect"` (default `"watch"`)
- `flush`: `"pre"` | `"post"` | `"sync"`

### Lifecycle

```json
"lifecycle": {
  "onMounted": { "$fn": "methods.loadData()" },
  "onUnmounted": { "$fn": "console.log('cleanup')" }
}
```

Each hook accepts a single `$fn` or `$fn[]` array.

Valid hooks: `onMounted`, `onUnmounted`, `onUpdated`, `onBeforeMount`, `onBeforeUnmount`, `onBeforeUpdate`, `onErrorCaptured`, `onActivated`, `onDeactivated`.

### Props

```json
"props": {
  "title": {
    "type": "String",
    "required": false,
    "default": "Default Title",
    "validator": { "$fn": "return typeof args[0] === 'string'" }
  }
}
```

**type values:** `"String"` | `"Number"` | `"Boolean"` | `"Array"` | `"Object"` | `"Function"` | `"Symbol"` | `"BigInt"`

### Components

```json
"components": {
  "MyButton": { "type": "local", "source": "./components/MyButton.vue" },
  "AsyncChart": {
    "type": "async",
    "source": "./components/Chart.vue",
    "loadingComponent": "LoadingSpinner",
    "errorComponent": "ErrorFallback",
    "delay": 200,
    "timeout": 3000
  }
}
```

### Styles

```json
"styles": {
  "scoped": true,
  "css": ".my-component { color: red; }"
}
```

---

## VNode Definition

```json
{
  "type": "div",
  "props": {
    "class": "container",
    "style": "color: red"
  },
  "children": [
    "Hello",
    { "type": "span", "children": ["World"] }
  ],
  "directives": { ... },
  "key": "unique-key",
  "ref": "myRef"
}
```

- `type` (required): HTML tag name or registered component name
- `props`: static or dynamic properties
- `children`: text, numbers, VNodes, or expressions
- `directives`: Vue directives
- `key`: Vue key for list rendering
- `ref`: template ref name

**Special:** `type: "template"` renders children directly without a wrapper element.

---

## Directive System

### vIf / vElseIf / vElse

```json
{ "type": "div", "directives": { "vIf": { "$expr": "$state.step === 1" } }, "children": ["Step 1"] },
{ "type": "div", "directives": { "vElseIf": { "$expr": "$state.step === 2" } }, "children": ["Step 2"] },
{ "type": "div", "directives": { "vElse": true }, "children": ["Other"] }
```

- `vIf` / `vElseIf` values must be `$expr`
- `vElse` value must be boolean `true`
- Must appear consecutively in children array; non-conditional siblings reset the chain

### vFor

```json
{
  "type": "div",
  "directives": {
    "vFor": {
      "source": { "$expr": "$state.items" },
      "alias": "item",
      "index": "idx"
    }
  },
  "children": [{ "type": "span", "children": [{ "$expr": "$state.item.name" }] }]
}
```

- `source` must be `$expr`, evaluates to array or object
- `alias` is the per-item variable name (injected into render context state)
- `index` optional, index variable name

### vModel

```json
{
  "type": "AInput",
  "directives": {
    "vModel": {
      "prop": { "$ref": "state.formData.username" },
      "arg": "value",
      "event": "update:value"
    }
  }
}
```

Or multiple bindings:
```json
"vModel": [
  { "prop": { "$ref": "state.value" }, "arg": "modelValue" },
  { "prop": { "$ref": "state.checked" }, "arg": "checked" }
]
```

- `prop` must be `$ref` format (StateRef or PropsRef)
- `arg` defaults to `"modelValue"`
- `event` defaults to `"update:${arg}"`

### vOn

```json
{
  "type": "button",
  "directives": {
    "vOn": {
      "click": { "$fn": "methods.handleClick()" },
      "submit.prevent": { "$fn": "methods.handleSubmit()" }
    }
  }
}
```

- Keys: event names, optional `.prevent` / `.stop` modifiers
- Values: `$fn` format
- Generates `onClick`, `onSubmit` etc.

### vBind

```json
{
  "directives": {
    "vBind": {
      "class": { "$expr": "$state.isActive ? 'active' : ''" },
      "disabled": { "$expr": "$state.loading" }
    }
  }
}
```

- Keys: attribute/prop names
- Values: `$expr`

### vShow

```json
{ "directives": { "vShow": { "$expr": "$state.isVisible" } } }
```

Sets `style.display = 'none'` when falsy; element still renders.

### vHtml / vText

```json
{ "directives": { "vHtml": { "$expr": "$state.htmlContent" } } }
{ "directives": { "vText": { "$expr": "$state.text" } } }
```

Override `children` completely.

### vSlot

```json
{
  "type": "template",
  "directives": {
    "vSlot": {
      "name": "headerCell",
      "props": ["column"]
    }
  },
  "children": [...]
}
```

- `name`: slot name (default `"default"`)
- `props`: array of slot prop variable names to expose

### vOnce

```json
{ "directives": { "vOnce": true } }
```

Boolean `true`.

---

## Render Definition

```json
"render": {
  "type": "template",
  "content": { "type": "div", "children": ["Hello"] }
}
```

Or function-based:
```json
"render": {
  "type": "function",
  "content": { "$fn": "return h('div', null, 'Hello')" }
}
```

- `type`: `"template"` | `"function"`

---

## Common Patterns

### Form with Validation

```json
{
  "name": "LoginForm",
  "state": {
    "formData": { "type": "reactive", "initial": { "username": "", "password": "" } },
    "loading": { "type": "ref", "initial": false }
  },
  "computed": {
    "isValid": {
      "get": { "$fn": "return state.formData.username && state.formData.password" }
    }
  },
  "methods": {
    "submit": {
      "$fn": "state.loading = true; $_core._api.post('/login', state.formData).then(function(res) { state.loading = false })"
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "AForm",
      "children": [
        {
          "type": "AFormItem",
          "children": [
            {
              "type": "AInput",
              "directives": {
                "vModel": { "prop": { "$ref": "state.formData.username" } }
              }
            }
          ]
        },
        {
          "type": "AButton",
          "props": { "disabled": { "$expr": "!$state.isValid || $state.loading" } },
          "directives": {
            "vOn": { "click": { "$fn": "methods.submit()" } }
          },
          "children": [{ "$expr": "$state.loading ? 'Loading...' : 'Login'" }]
        }
      ]
    }
  }
}
```

### Conditional Rendering Chain

```json
"children": [
  { "type": "ASpin", "directives": { "vIf": { "$expr": "$state.loading" } } },
  { "type": "div", "directives": { "vIf": { "$expr": "!$state.loading && $state.items.length" } }, "children": [...] },
  { "type": "AEmpty", "directives": { "vElse": true } }
]
```

### vFor + vSlot

```json
{
  "type": "ATable",
  "props": { "dataSource": { "$ref": "state.items" } },
  "children": [
    {
      "type": "template",
      "directives": { "vSlot": { "name": "renderItem", "props": ["item"] } },
      "children": [
        { "type": "span", "children": [{ "$expr": "$state.item.name" }] }
      ]
    }
  ]
}
```

---

## Validation Rules

When writing JSON schemas, enforce these rules:

1. **Top-level**: `name` non-empty string, `render` required
2. **render.type**: only `"template"` or `"function"`
3. **VNode.type**: non-empty string
4. **vIf/vElseIf**: values must be `$expr`
5. **vFor**: `source` is `$expr`, `alias` is string
6. **vModel.prop**: must be `$ref` format
7. **vOn handlers**: must be `$fn`
8. **vBind values**: must be `$expr`
9. **vHtml/vText**: must be `$expr`
10. **$fn.body**: must be string
11. **$fn.params**: must be object
12. **$ref**: must contain dot separating prefix and variable
13. **$ref prefix**: only `state`, `props`, `computed`
14. **state reactive/shallowReactive**: initial must be object
15. **state toRef/toRefs**: must have `source` field
16. **computed**: must have `get` as `$fn`
17. **watch**: must have `source` (`$expr`) and `handler` (`$fn`)

---

## Common Mistakes

| Mistake | Cause | Fix |
|---------|-------|-----|
| `{ "$ref": "state" }` | Missing dot separator | `{ "$ref": "state.count" }` |
| `$state.count.value` | State is auto-unwrapped | `$state.count` |
| vElse before vIf | Conditional chain broken | Ensure vIf/vElseIf/vElse are consecutive |
| vHtml + children together | vHtml overrides children | Use one or the other |
| `$fn` with `$event` but no event | `$event` maps to `args[0]` | Use `args[0]` or access directly |

---

## Validation Tool

After writing or modifying a JSON schema, always validate it using the `validate-schema` tool:

```
validate-schema file_path="path/to/schema.json"
```

The tool checks all validation rules listed above and reports errors with exact paths. Run validation before considering a schema complete.

---

## Guardrails

- Always validate schemas with the `validate-schema` tool after writing
- Use `$ref`, `$expr`, `$fn`, `$scope` formats exclusively — no other dynamic value formats exist
- State is auto-unwrapped via Proxy; never use `.value` in expressions or functions
- Keep conditional chains (vIf/vElseIf/vElse) consecutive in children arrays
- Test schemas with real data to verify expression evaluation
- Component names in VNode `type` must match registered component names exactly
