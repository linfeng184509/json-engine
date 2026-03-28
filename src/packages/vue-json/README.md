# @json-engine/vue-json

A runtime framework that transforms JSON Schema into Vue 3 components.

## Installation

```bash
npm install @json-engine/vue-json vue
```

## Quick Start

```javascript
import { createApp } from 'vue';
import { useVueJson, createComponent } from '@json-engine/vue-json';

const schema = {
  name: 'MyComponent',
  state: {
    message: { type: 'ref', initial: 'Hello World' }
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: '{{ref_state_message}}'
    }
  }
};

const app = createApp({
  setup() {
    const { component } = useVueJson();
    component.value = createComponent(schema);
    return { component };
  },
  template: '<component :is="component" />'
});

app.mount('#app');
```

## Expression Format

vue-json uses the **core-engine** expression format for referencing state, props, and computed values:

| Type | Format | Example |
|------|--------|---------|
| State | `{{ref_state_<name>}}` | `{{ref_state_count}}` |
| Props | `{{ref_props_<name>}}` | `{{ref_props_title}}` |
| Computed | `{{ref_computed_<name>}}` | `{{ref_computed_doubled}}` |
| Mixed | `{{ref_state_x}} + 1` | `{{ref_state_count}} * 2` |

## Using Composables

### useVueJson

The main composable for parsing and creating components from JSON schemas.

```javascript
import { useVueJson } from '@json-engine/vue-json';

const MyComponent = {
  setup() {
    const { component, schema, parse, error, isLoading } = useVueJson();

    // Parse a schema
    parse({
      name: 'Counter',
      state: {
        count: { type: 'ref', initial: 0 }
      },
      render: {
        type: 'template',
        content: {
          type: 'button',
          children: 'Count: {{ref_state_count}}'
        }
      }
    });

    return { component, schema, error, isLoading };
  },
  template: '<component v-if="component" :is="component" />'
};
```

### useJsonComponent

Direct component creation without reactive parsing.

```javascript
import { useJsonComponent } from '@json-engine/vue-json';

const MyComponent = {
  setup() {
    const { create, clearCache } = useJsonComponent({ cache: true });

    const counter = create({
      name: 'Counter',
      state: { count: { type: 'ref', initial: 0 } },
      render: {
        type: 'template',
        content: { type: 'div', children: '{{ref_state_count}}' }
      }
    });

    return { counter, clearCache };
  },
  template: '<component :is="counter" />'
};
```

## JSON Schema Structure

### Basic Schema

```javascript
{
  name: 'ComponentName',
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: 'Hello World'
    }
  }
}
```

### With Props

```javascript
{
  name: 'Greeting',
  props: {
    name: { type: 'String', required: true },
    age: { type: 'Number', default: 0 }
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: 'Hello {{ref_props_name}}!'
    }
  }
}
```

### With State (Reactive Data)

```javascript
{
  name: 'Counter',
  state: {
    count: { type: 'ref', initial: 0 },
    user: { type: 'reactive', initial: { name: 'John' } }
  },
  computed: {
    doubled: { get: 'ref_state_count * 2' }
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: [
        { type: 'p', children: 'Count: {{ref_state_count}}' },
        { type: 'p', children: 'Doubled: {{ref_computed_doubled}}' }
      ]
    }
  }
}
```

### With Methods

```javascript
{
  name: 'Counter',
  state: {
    count: { type: 'ref', initial: 0 }
  },
  methods: {
    increment: 'ref_state_count.value++',
    decrement: 'ref_state_count.value--',
    reset: 'ref_state_count.value = 0'
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: [
        { type: 'button', directives: { vOn: { click: 'methods.decrement()' } }, children: '-' },
        { type: 'span', children: '{{ref_state_count}}' },
        { type: 'button', directives: { vOn: { click: 'methods.increment()' } }, children: '+' }
      ]
    }
  }
}
```

### With Lifecycle Hooks

```javascript
{
  name: 'DataFetcher',
  state: {
    data: { type: 'ref', initial: null }
  },
  lifecycle: {
    onMounted: 'console.log("Component mounted!")',
    onUnmounted: 'console.log("Component unmounted!")'
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: 'Check console for lifecycle logs'
    }
  }
}
```

## Directives

### v-if / v-else

```javascript
{
  type: 'div',
  children: [
    {
      type: 'p',
      directives: { vIf: 'ref_state_isVisible' },
      children: 'This is visible'
    },
    {
      type: 'p',
      directives: { vElse: true },
      children: 'This is hidden'
    }
  ]
}
```

### v-for

```javascript
{
  type: 'ul',
  children: [
    {
      type: 'li',
      directives: {
        vFor: {
          source: 'ref_state_items',
          alias: 'item',
          index: 'i'
        }
      },
      children: '{{i}}. {{item.name}}'
    }
  ]
}
```

### v-model

```javascript
{
  type: 'input',
  directives: {
    vModel: {
      prop: 'ref_state_inputValue'
    }
  },
  props: {
    type: 'text',
    placeholder: 'Enter text...'
  }
}
```

### v-on (Event Handlers)

```javascript
{
  type: 'button',
  directives: {
    vOn: {
      click: 'methods.handleClick()',
      'mouseenter': 'methods.onHover()'
    }
  },
  children: 'Click Me'
}
```

### v-bind

```javascript
{
  type: 'div',
  directives: {
    vBind: {
      class: 'ref_state_isActive ? "active" : "inactive"',
      'data-id': 'ref_props_itemId'
    }
  }
}
```

### v-show

```javascript
{
  type: 'div',
  directives: { vShow: 'ref_state_isVisible' },
  children: 'This can be hidden'
}
```

### v-html

```javascript
{
  type: 'div',
  directives: { vHtml: '"<strong>Bold text</strong>"' }
}
```

### v-text

```javascript
{
  type: 'span',
  directives: { vText: 'ref_state_message' }
}
```

## KeyParser API

Customize key transformations during schema parsing:

```javascript
import {
  registerVueJsonKeyParser,
  unregisterVueJsonKeyParser,
  registerDefaultKeyParsers
} from '@json-engine/vue-json';

// Register default parsers (component-name, state-key)
registerDefaultKeyParsers();

// Register custom parser
registerVueJsonKeyParser('prefix', (key) => `vjs-${key}`);

// Unregister custom parser
unregisterVueJsonKeyParser('prefix');
```

## API Reference

### createComponent(schema, options)

Creates a Vue component from a JSON schema.

```javascript
import { createComponent } from '@json-engine/vue-json';

const component = createComponent(schema, {
  cache: true,        // Enable caching (default: true)
  injectStyles: true, // Inject component styles (default: true)
  debug: false        // Enable debug logging (default: false)
});
```

### parseSchema(input)

Parses a JSON schema and returns validation result.

```javascript
import { parseSchema } from '@json-engine/vue-json';

const result = parseSchema(schema);

if (result.success) {
  console.log('Parsed schema:', result.data);
} else {
  console.error('Parse errors:', result.errors);
}
```

### useVueJson(options)

Main composable for reactive component creation.

```javascript
const { component, schema, parse, error, isLoading } = useVueJson({
  cache: true,        // Enable caching
  onError: (err) => {} // Error callback
});
```

## Migration Guide

If you were using the legacy expression format, update your schemas:

| Legacy Format | Core-Engine Format |
|---------------|-------------------|
| `{{state.count}}` | `{{ref_state_count}}` |
| `{{state.count.value}}` | `{{ref_state_count}}` |
| `{{props.title}}` | `{{ref_props_title}}` |
| `{{computed.doubled.value}}` | `{{ref_computed_doubled}}` |

### Before (Legacy)

```javascript
{
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: '{{state.count.value}}'
    }
  }
}
```

### After (Core-Engine)

```javascript
{
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: '{{ref_state_count}}'
    }
  }
}
```

## Type Definitions

The package exports TypeScript type definitions:

```typescript
import type {
  VueJsonSchema,
  PropsDefinition,
  StateDefinition,
  ComputedDefinition,
  MethodsDefinition,
  RenderDefinition,
  VNodeDefinition
} from '@json-engine/vue-json/types';
```

## License

MIT