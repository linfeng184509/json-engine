## Context

**vue-json 架构（参考 enterprise-admin）：**
- `VueJsonSchema` 是标准 Schema 格式：`{ name, state, methods, render, ... }`
- `createComponent(schema)` 创建 Vue 组件
- `parseSchema(input)` 解析 Schema
- `loadAndInstallPlugins()` 加载插件

**core-engine 表达式语法规范：**
```
{{'hello'}}              → { _type: 'string', value: 'hello' }
{{$_[core]_api}}         → { _type: 'scope', scope: 'core', variable: 'api' }
{{ref_state_count}}      → { _type: 'reference', prefix: 'state', variable: 'count' }
{{{params}}}{{body}}      → { _type: 'function', params: {...}, body: '...' }
{{a + b}}                → { _type: 'expression', expression: 'a + b' }
```

**当前 designer 问题：**
- schemaGenerator 输出非标准格式
- FormPreview 手动构建 VNode
- 表达式语法错误

## Goals / Non-Goals

**Goals：**
- designer 使用正确的 `@json-engine/*` 包
- schemaGenerator 输出标准 `VueJsonSchema` 格式
- FormPreview 使用 `createComponent()` 渲染
- 所有表达式符合 core-engine 规范

**Non-Goals：**
- 不修改 vue-json 本身
- 不修改 enterprise-admin
- 不改变 designer 的用户界面

## Decisions

### Decision 1: 修复 package.json 依赖

**选择：** 使用正确的包名

```diff
dependencies {
-   "@json-vue/core": "workspace:*",
-   "@json-vue/plugin-antd": "workspace:*",
-   "@json-vue/runtime": "workspace:*",
-   "@json-vue/schema": "workspace:*",
+   "@json-engine/vue-json": "*",
+   "@json-engine/core-engine": "*",
+   "@json-engine/plugin-antd": "*",
+   "@json-engine/plugin-axios": "*",
+   "@json-engine/plugin-storage": "*",
}
```

### Decision 2: schemaGenerator 输出 VueJsonSchema 格式

**选择：** DesignNode → VueJsonSchema 完整转换

```typescript
// 输出格式
interface VueJsonSchema {
  name: string;
  props?: PropsDefinition;
  state?: StateDefinition;
  computed?: ComputedDefinition;
  methods?: MethodsDefinition;
  lifecycle?: LifecycleDefinition;
  render: RenderDefinition;
  styles?: StylesDefinition;
}

// VNodeDefinition 使用
interface VNodeDefinition {
  type: string;
  props?: Record<string, PropertyValue>;
  children?: VNodeChildren;
  directives?: VNodeDirectives;
  key?: string | number;
  ref?: string;
}
```

### Decision 3: 事件转换为 methods

**选择：** DesignNode.events → VueJsonSchema.methods

```typescript
// DesignNode 格式
{ type: 'AButton', events: { onClick: 'handleSubmit()' } }

// 转换后 VueJsonSchema 格式
{
  methods: {
    handleSubmit: {
      type: 'function',
      params: '{{{}}}',
      body: '{{$_[core]_api.post("/api/submit", ref_state_formData)}}'
    }
  },
  render: {
    type: 'template',
    content: {
      type: 'AButton',
      directives: {
        vOn: {
          click: { type: 'function', params: '{{{}}}', body: '{{methods.handleSubmit()}}' }
        }
      }
    }
  }
}
```

### Decision 4: FormPreview 使用 createComponent

**选择：** 集成 vue-json 插件系统

```typescript
import { createComponent, loadAndInstallPlugins, getPluginRegistry } from '@json-engine/vue-json'
import { antdPlugin } from '@json-engine/plugin-antd'
import type { VueJsonSchema } from '@json-engine/vue-json'

// 初始化插件（参考 enterprise-admin）
async function initPlugins() {
  const registry = getPluginRegistry()
  registry.register(antdPlugin)
  
  const pluginLoaders = {
    '@json-engine/plugin-antd': () => Promise.resolve(antdPlugin)
  }
  
  await loadAndInstallPlugins(
    [{ name: '@json-engine/plugin-antd', version: '0.0.1' }],
    { antd: { theme: { primaryColor: '#1890ff' } } },
    pluginLoaders
  )
}

// 创建预览组件
const schema: VueJsonSchema = generateVueJsonSchema(props.tree)
const previewComponent = computed(() => createComponent(schema))
```

### Decision 5: v-model 转换

**选择：** DesignNode v-model → VNodeDefinition directives.vModel

```typescript
// DesignNode 格式
{ type: 'AInput', props: { 'v-model:value': 'formData.username' } }

// VueJsonSchema directives 格式
{
  type: 'AInput',
  directives: {
    vModel: {
      prop: { type: 'state', body: '{{ref_state_formData.username}}' },
      event: 'update:value'
    }
  }
}
```

### Decision 6: AI 工具 validateSchema

**选择：** 使用 vue-json 的 parseSchema 替代

```typescript
// 旧导入（不存在）
import { validateSchema, componentSchema } from "@json-vue/schema"

// 新实现
import { parseSchema } from '@json-engine/vue-json'

function validateDesignSchema(schema: unknown): { valid: boolean; errors: string[] } {
  const result = parseSchema(schema)
  return {
    valid: result.success,
    errors: result.errors?.map(e => e.message) || []
  }
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Schema 格式变更导致现有设计无法导入 | 提供迁移脚本或标记为 BREAKING CHANGE |
| createComponent 渲染与手动 h() 行为差异 | 验证测试确保功能一致 |
| 插件初始化时机 | 在 DesignerShell 初始化时完成插件加载 |
