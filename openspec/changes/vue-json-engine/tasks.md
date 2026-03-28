# vue-json-engine Implementation Tasks

## 1. Setup & Infrastructure

- [ ] 1.1 Update vue-json package.json with correct dependencies and exports
- [ ] 1.2 Create types/index.ts with VueJsonSchema and related type definitions
- [ ] 1.3 Create types/schema.ts with PropsDefinition, StateDefinition, etc.
- [ ] 1.4 Create types/runtime.ts with RenderContext, ParserContext types
- [ ] 1.5 Create utils/error.ts with custom error classes (SchemaParseError, ValidationError, etc.)
- [ ] 1.6 Create utils/expression.ts with evaluateExpression function
- [ ] 1.7 Update vite.config.ts for library build with correct entry points

## 2. JSON Schema Parser

- [ ] 2.1 Create parser/index.ts with main parseSchema function
- [ ] 2.2 Implement schema structure validation in parser/schema-parser.ts
- [ ] 2.3 Create parser/props-parser.ts with parseProps function
- [ ] 2.4 Create parser/emits-parser.ts with parseEmits function
- [ ] 2.5 Create parser/state-parser.ts with parseState function
- [ ] 2.6 Create parser/computed-parser.ts with parseComputed function
- [ ] 2.7 Create parser/methods-parser.ts with parseMethods function
- [ ] 2.8 Create parser/watch-parser.ts with parseWatch function
- [ ] 2.9 Create parser/provide-inject-parser.ts with parseProvide and parseInject
- [ ] 2.10 Create parser/lifecycle-parser.ts with parseLifecycle function
- [ ] 2.11 Create parser/components-parser.ts with parseComponents function
- [ ] 2.12 Create parser/render-parser.ts with parseRender function
- [ ] 2.13 Integrate core-engine parseJson for preprocessing

## 3. Reactive System

- [ ] 3.1 Create runtime/state-factory.ts with createState function
- [ ] 3.2 Implement ref state creation
- [ ] 3.3 Implement reactive state creation
- [ ] 3.4 Implement shallowRef and shallowReactive creation
- [ ] 3.5 Create runtime/computed-factory.ts with createComputed function
- [ ] 3.6 Implement computed getter-only support
- [ ] 3.7 Implement computed getter/setter support
- [ ] 3.8 Create runtime/watch-factory.ts with setupWatchers function
- [ ] 3.9 Implement watch with source and handler
- [ ] 3.10 Implement watch options (immediate, deep, flush)
- [ ] 3.11 Implement watchEffect support
- [ ] 3.12 Create runtime/provide-inject.ts with setupProvide and setupInject
- [ ] 3.13 Implement provide/inject in setup context
- [ ] 3.14 Implement toRef, toRefs, readonly transformations

## 4. Render Engine

- [ ] 4.1 Create runtime/render-factory.ts with renderVNode function
- [ ] 4.2 Implement basic element rendering (h function wrapper)
- [ ] 4.3 Implement props rendering with static values
- [ ] 4.4 Implement children rendering (string, array, nested VNode)
- [ ] 4.5 Implement expression evaluation in render context
- [ ] 4.6 Implement dynamic props binding (:prop)
- [ ] 4.7 Implement event binding (@event)
- [ ] 4.8 Implement component rendering
- [ ] 4.9 Implement slots handling
- [ ] 4.10 Implement render function mode (direct function body)

## 5. Directive Runtime

- [ ] 5.1 Create runtime/directive-runtime.ts
- [ ] 5.2 Implement v-if / v-else-if / v-else directives
- [ ] 5.3 Implement v-show directive
- [ ] 5.4 Implement v-for directive with alias and index
- [ ] 5.5 Implement v-model directive with modifiers
- [ ] 5.6 Implement v-bind directive
- [ ] 5.7 Implement v-on directive with modifiers
- [ ] 5.8 Implement v-slot directive (named and scoped)
- [ ] 5.9 Implement v-html directive
- [ ] 5.10 Implement v-text directive
- [ ] 5.11 Implement v-once directive

## 6. Lifecycle Hooks

- [ ] 6.1 Create runtime/lifecycle-factory.ts with setupLifecycle function
- [ ] 6.2 Implement onMounted hook registration
- [ ] 6.3 Implement onUnmounted hook registration
- [ ] 6.4 Implement onUpdated hook registration
- [ ] 6.5 Implement onBeforeMount hook registration
- [ ] 6.6 Implement onBeforeUnmount hook registration
- [ ] 6.7 Implement onBeforeUpdate hook registration
- [ ] 6.8 Implement onErrorCaptured hook registration
- [ ] 6.9 Implement onActivated hook registration
- [ ] 6.10 Implement onDeactivated hook registration

## 7. Component Factory

- [ ] 7.1 Create runtime/component-factory.ts with createComponent function
- [ ] 7.2 Implement defineComponent wrapper with props and emits
- [ ] 7.3 Implement setup function with state, computed, methods integration
- [ ] 7.4 Implement local component registration
- [ ] 7.5 Implement async component loading with defineAsyncComponent
- [ ] 7.6 Implement loadingComponent and errorComponent for async components
- [ ] 7.7 Implement component caching mechanism
- [ ] 7.8 Implement clearComponentCache function

## 8. Style Injector

- [ ] 8.1 Create runtime/style-injector.ts
- [ ] 8.2 Implement injectStyles function with style element creation
- [ ] 8.3 Implement scoped CSS transformation
- [ ] 8.4 Implement unique component ID generation
- [ ] 8.5 Implement style deduplication
- [ ] 8.6 Implement style removal on component destroy

## 9. Type Generator

- [ ] 9.1 Create utils/type-generator.ts
- [ ] 9.2 Implement generatePropsType function
- [ ] 9.3 Implement generateStateType function
- [ ] 9.4 Implement generateComputedType function
- [ ] 9.5 Implement generateMethodsType function
- [ ] 9.6 Implement generateTypes function for complete component type
- [ ] 9.7 Implement writeTypeDefinition for .d.ts file output

## 10. Composables API

- [ ] 10.1 Update composables/index.ts with new exports
- [ ] 10.2 Implement useVueJson composable (parse, component, error, isLoading)
- [ ] 10.3 Implement useJsonComponent composable (create, register, cache)
- [ ] 10.4 Implement useJsonRenderer composable (render, update, destroy)
- [ ] 10.5 Update src/index.ts with all exports

## 11. Testing

- [ ] 11.1 Create __tests__/parser/schema-parser.test.ts
- [ ] 11.2 Create __tests__/parser/props-parser.test.ts
- [ ] 11.3 Create __tests__/parser/state-parser.test.ts
- [ ] 11.4 Create __tests__/runtime/state-factory.test.ts
- [ ] 11.5 Create __tests__/runtime/computed-factory.test.ts
- [ ] 11.6 Create __tests__/runtime/render-factory.test.ts
- [ ] 11.7 Create __tests__/runtime/directive-runtime.test.ts
- [ ] 11.8 Create __tests__/runtime/lifecycle-factory.test.ts
- [ ] 11.9 Create __tests__/runtime/component-factory.test.ts
- [ ] 11.10 Create __tests__/runtime/style-injector.test.ts
- [ ] 11.11 Create __tests__/composables/use-vue-json.test.ts
- [ ] 11.12 Create __tests__/integration/component-creation.test.ts

## 12. Documentation & Examples

- [ ] 12.1 Create examples/counter.json example schema
- [ ] 12.2 Create examples/todo-list.json example schema
- [ ] 12.3 Create examples/form.json example schema
- [ ] 12.4 Update package README.md with usage examples