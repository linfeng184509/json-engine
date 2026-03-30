## 1. Type Definitions

- [ ] 1.1 Create `src/packages/vue-json/src/types/echarts.ts` with EChartsOptionValue interface
- [ ] 1.2 Define EChartsComponentProps interface
- [ ] 1.3 Add types to main index.ts export

## 2. ECharts Component Implementation

- [ ] 2.1 Create `src/packages/vue-json/src/components/EChartsComponent.ts` with Vue component
- [ ] 2.2 Implement onMounted lifecycle - initialize echarts instance
- [ ] 2.3 Implement onUnmounted lifecycle - dispose chart and cleanup ResizeObserver
- [ ] 2.4 Implement watch on option prop - call chart.setOption() with debounce
- [ ] 2.5 Implement ResizeObserver for autoResize functionality
- [ ] 2.6 Add loading state support
- [ ] 2.7 Add theme support
- [ ] 2.8 Export component from components/index.ts

## 3. ECharts Runtime Factory

- [ ] 3.1 Create `src/packages/vue-json/src/runtime/echarts-factory.ts`
- [ ] 3.2 Implement echarts initialization logic
- [ ] 3.3 Implement resize handler with ResizeObserver
- [ ] 3.4 Implement cleanup/dispose logic
- [ ] 3.5 Add error handling for missing echarts package
- [ ] 3.6 Export factory functions

## 4. Value Parser Implementation

- [ ] 4.1 Create `src/packages/vue-json/src/parser/echarts-option-parser.ts`
- [ ] 4.2 Implement EChartsOptionParser class implementing ValueParser interface
- [ ] 4.3 Add parser to parseJson config in `src/packages/vue-json/src/config/vue-parser-config.ts`
- [ ] 4.4 Write unit tests for parser

## 5. Component Registration

- [ ] 5.1 Auto-register ECharts component in ui-factory.ts or component-factory.ts
- [ ] 5.2 Ensure component is available globally via registerComponents API
- [ ] 5.3 Add echarts package check - warn if not installed
- [ ] 5.4 Export registration API from index.ts

## 6. Documentation & Examples

- [ ] 6.1 Add usage examples to README.md
- [ ] 6.2 Create example JSON schema with ECharts component
- [ ] 6.3 Document echarts-option value type
- [ ] 6.4 Document autoResize and theme props

## 7. Testing

- [ ] 7.1 Create `src/packages/vue-json/src/components/EChartsComponent.test.ts`
- [ ] 7.2 Test component initialization
- [ ] 7.3 Test reactive updates
- [ ] 7.4 Test autoResize functionality
- [ ] 7.5 Test cleanup on unmount
- [ ] 7.6 Run existing test suite - ensure no regressions
- [ ] 7.7 Run lint: `npm run lint`
- [ ] 7.8 Run typecheck: `npm run typecheck`

## 8. Integration

- [ ] 8.1 Update main index.ts to export all ECharts-related APIs
- [ ] 8.2 Add peer dependency declaration in package.json
- [ ] 8.3 Test in enterprise-admin example app
- [ ] 8.4 Verify build: `npm run build`
