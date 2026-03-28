# @json-engine/vue-json

A runtime framework that transforms JSON Schema into Vue 3 components.

## Installation

```bash
npm install @json-engine/vue-json vue
```

## Quick Start

```javascript
import { createApp } from 'vue';
import { useVueJson } from '@json-engine/vue-json';

const schema = {
  name: 'MyComponent',
  state: {
    message: { type: 'ref', initial: 'Hello World' }
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: '{{state.message.value}}'
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
          children: 'Count: {{state.count.value}}'
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
        content: { type: 'div', children: '{{state.count.value}}' }
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
      children: 'Hello {{props.name}}!'
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
    doubled: { get: 'return state.count.value * 2;' }
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: [
        { type: 'p', children: 'Count: {{state.count.value}}' },
        { type: 'p', children: 'Doubled: {{computed.doubled.value}}' }
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
    increment: 'state.count.value++;',
    decrement: 'state.count.value--;',
    reset: 'state.count.value = 0;'
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: [
        { type: 'button', directives: { vOn: { click: 'methods.decrement();' } }, children: '-' },
        { type: 'span', children: '{{state.count.value}}' },
        { type: 'button', directives: { vOn: { click: 'methods.increment();' } }, children: '+' }
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
    onMounted: 'console.log("Component mounted!");',
    onUnmounted: 'console.log("Component unmounted!");'
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

### With Styles

```javascript
{
  name: 'StyledButton',
  render: {
    type: 'template',
    content: {
      type: 'button',
      props: { class: 'primary-btn' },
      children: 'Click Me'
    }
  },
  styles: {
    scoped: true,
    css: `
      .primary-btn {
        background: blue;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .primary-btn:hover {
        background: darkblue;
      }
    `
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
      directives: { vIf: 'state.isVisible.value' },
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
          source: 'state.items.value',
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
      prop: 'state.inputValue'
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
      click: 'methods.handleClick();',
      'mouseenter': 'methods.onHover();'
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
      class: 'state.isActive.value ? "active" : "inactive"',
      'data-id': 'props.itemId'
    }
  }
}
```

### v-show

```javascript
{
  type: 'div',
  directives: { vShow: 'state.isVisible.value' },
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
  directives: { vText: 'state.message.value' }
}
```

## Examples

See the `examples/` directory for complete schema examples:

- [counter.json](examples/counter.json) - Simple counter with state and methods
- [todo-list.json](examples/todo-list.json) - Todo list with v-for and computed
- [form.json](examples/form.json) - Form with validation and v-model

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
