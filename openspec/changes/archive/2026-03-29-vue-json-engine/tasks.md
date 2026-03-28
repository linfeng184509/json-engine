# vue-json-engine Implementation Tasks

## 1. Setup & Infrastructure

- [x] 1.1 Update vue-json package.json with correct dependencies and exports
- [x] 1.2 Create types/index.ts with VueJsonSchema and related type definitions
- [x] 1.3 Create types/schema.ts with PropsDefinition, StateDefinition, etc.
- [x] 1.4 Create types/runtime.ts with RenderContext, ParserContext types
- [x] 1.5 Create utils/error.ts with custom error classes (SchemaParseError, ValidationError, etc.)
- [x] 1.6 Create utils/expression.ts with evaluateExpression function
- [x] 1.7 Update vite.config.ts for library build with correct entry points

## 2. JSON Schema Parser

- [x] 2.1 Create parser/index.ts with main parseSchema function
- [x] 2.2 Implement schema structure validation in parser/schema-parser.ts
- [x] 2.3 Create parser/props-parser.ts with parseProps function
- [x] 2.4 Create parser/emits-parser.ts with parseEmits function
- [x] 2.5 Create parser/state-parser.ts with parseState function
- [x] 2.6 Create parser/computed-parser.ts with parseComputed function
- [x] 2.7 Create parser/methods-parser.ts with parseMethods function
- [x] 2.8 Create parser/watch-parser.ts with parseWatch function
- [x] 2.9 Create parser/provide-inject-parser.ts with parseProvide and parseInject
- [x] 2.10 Create parser/lifecycle-parser.ts with parseLifecycle function
- [x] 2.11 Create parser/components-parser.ts with parseComponents function
- [x] 2.12 Create parser/render-parser.ts with parseRender function
- [x] 2.13 Integrate core-engine parseJson for preprocessing

## 3. Reactive System

- [x] 3.1 Create runtime/state-factory.ts with createState function
- [x] 3.2 Implement ref state creation
- [x] 3.3 Implement reactive state creation
- [x] 3.4 Implement shallowRef and shallowReactive creation
- [x] 3.5 Create runtime/computed-factory.ts with createComputed function
- [x] 3.6 Implement computed getter-only support
- [x] 3.7 Implement computed getter/setter support
- [x] 3.8 Create runtime/watch-factory.ts with setupWatchers function
- [x] 3.9 Implement watch with source and handler
- [x] 3.10 Implement watch options (immediate, deep, flush)
- [x] 3.11 Implement watchEffect support
- [x] 3.12 Create runtime/provide-inject.ts with setupProvide and setupInject
- [x] 3.13 Implement provide/inject in setup context
- [x] 3.14 Implement toRef, toRefs, readonly transformations

## 4. Render Engine

- [x] 4.1 Create runtime/render-factory.ts with renderVNode function
- [x] 4.2 Implement basic element rendering (h function wrapper)
- [x] 4.3 Implement props rendering with static values
- [x] 4.4 Implement children rendering (string, array, nested VNode)
- [x] 4.5 Implement expression evaluation in render context
- [x] 4.6 Implement dynamic props binding (:prop)
- [x] 4.7 Implement event binding (@event)
- [x] 4.8 Implement component rendering
- [x] 4.9 Implement slots handling
- [x] 4.10 Implement render function mode (direct function body)

## 5. Directive Runtime

- [x] 5.1 Create runtime/directive-runtime.ts
- [x] 5.2 Implement v-if / v-else-if / v-else directives
- [x] 5.3 Implement v-show directive
- [x] 5.4 Implement v-for directive with alias and index
- [x] 5.5 Implement v-model directive with modifiers
- [x] 5.6 Implement v-bind directive
- [x] 5.7 Implement v-on directive with modifiers
- [x] 5.8 Implement v-slot directive (named and scoped)
- [x] 5.9 Implement v-html directive
- [x] 5.10 Implement v-text directive
- [x] 5.11 Implement v-once directive

## 6. Lifecycle Hooks

- [x] 6.1 Create runtime/lifecycle-factory.ts with setupLifecycle function
- [x] 6.2 Implement onMounted hook registration
- [x] 6.3 Implement onUnmounted hook registration
- [x] 6.4 Implement onUpdated hook registration
- [x] 6.5 Implement onBeforeMount hook registration
- [x] 6.6 Implement onBeforeUnmount hook registration
- [x] 6.7 Implement onBeforeUpdate hook registration
- [x] 6.8 Implement onErrorCaptured hook registration
- [x] 6.9 Implement onActivated hook registration
- [x] 6.10 Implement onDeactivated hook registration

## 7. Component Factory

- [x] 7.1 Create runtime/component-factory.ts with createComponent function
- [x] 7.2 Implement defineComponent wrapper with props and emits
- [x] 7.3 Implement setup function with state, computed, methods integration
- [x] 7.4 Implement local component registration
- [x] 7.5 Implement async component loading with defineAsyncComponent
- [x] 7.6 Implement loadingComponent and errorComponent for async components
- [x] 7.7 Implement component caching mechanism
- [x] 7.8 Implement clearComponentCache function

## 8. Style Injector

- [x] 8.1 Create runtime/style-injector.ts
- [x] 8.2 Implement injectStyles function with style element creation
- [x] 8.3 Implement scoped CSS transformation
- [x] 8.4 Implement unique component ID generation
- [x] 8.5 Implement style deduplication
- [x] 8.6 Implement style removal on component destroy

## 9. Type Generator

- [x] 9.1 Create utils/type-generator.ts
- [x] 9.2 Implement generatePropsType function
- [x] 9.3 Implement generateStateType function
- [x] 9.4 Implement generateComputedType function
- [x] 9.5 Implement generateMethodsType function
- [x] 9.6 Implement generateTypes function for complete component type
- [x] 9.7 Implement writeTypeDefinition for .d.ts file output

## 10. Composables API

- [x] 10.1 Update composables/index.ts with new exports
- [x] 10.2 Implement useVueJson composable (parse, component, error, isLoading)
- [x] 10.3 Implement useJsonComponent composable (create, register, cache)
- [x] 10.4 Implement useJsonRenderer composable (render, update, destroy)
- [x] 10.5 Update src/index.ts with all exports

## 11. Testing

- [x] 11.1 Create __tests__/parser/schema-parser.test.ts
- [x] 11.2 Create __tests__/parser/props-parser.test.ts
- [x] 11.3 Create __tests__/parser/state-parser.test.ts
- [x] 11.4 Create __tests__/runtime/state-factory.test.ts
- [x] 11.5 Create __tests__/runtime/computed-factory.test.ts
- [x] 11.6 Create __tests__/runtime/render-factory.test.ts
- [x] 11.7 Create __tests__/runtime/directive-runtime.test.ts
- [x] 11.8 Create __tests__/runtime/lifecycle-factory.test.ts
- [x] 11.9 Create __tests__/runtime/component-factory.test.ts
- [x] 11.10 Create __tests__/runtime/style-injector.test.ts
- [x] 11.11 Create __tests__/composables/use-vue-json.test.ts
- [x] 11.12 Create __tests__/integration/component-creation.test.ts

## 12. Documentation & Examples

- [x] 12.1 Create examples/counter.json example schema
- [x] 12.2 Create examples/todo-list.json example schema
- [x] 12.3 Create examples/form.json example schema
- [x] 12.4 Update package README.md with usage examples