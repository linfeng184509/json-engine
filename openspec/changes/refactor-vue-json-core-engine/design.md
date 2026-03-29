## Context

**core-engine 提供的能力：**
- `parseJson(json, config)` - 递归解析 JSON，自动识别并转换结构化值
- `ValueExpressionParser` - 解析 `{ type: 'expression', body: '...' }`
- `ValueFunctionParser` - 解析 `{ type: 'function', params: '', body: '...' }`
- `ValueStateParser` - 解析 `{ type: 'state', variable: '' }`
- `ValuePropsParser` - 解析 `{ type: 'props', variable: '' }`
- `ValueScopeParser` - 解析 `{ type: 'scope', scope: 'core'|'goal', variable: '' }`
- `registerKeyParser` - 注册自定义 key 转换

**当前 vue-json 问题：**
- Schema 使用扁平字符串，无法利用 core-engine 的类型验证
- 解析逻辑分散在运行时，而非预处理阶段
- 表达式/函数/引用格式不统一

## Goals / Non-Goals

**Goals：**
- vue-json Schema 完全使用 core-engine 结构化类型
- `parseSchema` 入口调用 `parseJson` 预处理
- 运行时直接使用解析后的结构化数据
- 所有表达式/函数/引用都有类型验证

**Non-Goals：**
- 不保留任何旧格式兼容
- 不修改 core-engine 本身

## Decisions

### Decision 1: parseJson 作为 Schema 解析入口

**选择：** `parseSchema` 首先调用 `parseJson` 预处理整个 Schema

```typescript
export function parseSchema(input: unknown): ParseResult<ParsedSchema> {
  // 1. JSON 字符串先解析
  let json = typeof input === 'string' ? JSON.parse(input) : input;
  
  // 2. 使用 parseJson 预处理，自动转换所有结构化值
  const parsed = parseJson(json, { keyParsers: vueJsonKeyParsers });
  
  // 3. 验证 Schema 结构
  validateSchemaStructure(parsed);
  
  // 4. 返回解析结果（parsed 中所有值已被转换）
  return { success: true, data: buildParsedSchema(parsed) };
}
```

**理由：**
- parseJson 递归遍历整个 JSON，自动处理嵌套结构
- 所有 `{ type: 'expression' }` 等结构化值被验证和解析
- 运行时无需再做类型检测

### Decision 2: 结构化值类型定义

**选择：** 定义与 core-engine 兼容的类型

```typescript
// 基础类型（与 core-engine 一致）
interface ExpressionValue {
  type: 'expression';
  body: string;
}

interface FunctionValue {
  type: 'function';
  params: string;
  body: string;
}

interface StateRef {
  type: 'state';
  variable: string;
}

interface PropsRef {
  type: 'props';
  variable: string;
}

// 复合类型
type PropertyValue = LiteralValue | ExpressionValue | StateRef | PropsRef;
```

**理由：**
- 类型与 core-engine 解析结果一致
- TypeScript 类型安全
- 运行时直接使用，无需转换

### Decision 3: VNode 定义重构

**选择：** VNode 的 props、children、directives 使用结构化值

```typescript
interface VNodeDefinition {
  type: string;
  props?: Record<string, PropertyValue>;
  children?: VNodeChildren;
  directives?: VNodeDirectives;
}

interface VNodeDirectives {
  vIf?: ExpressionValue;
  vShow?: ExpressionValue;
  vFor?: {
    source: ExpressionValue;
    alias: string;
    index?: string;
  };
  vModel?: {
    prop: StateRef | PropsRef;  // 必须是引用
    event?: string;
  };
  vOn?: Record<string, FunctionValue>;
  vBind?: Record<string, ExpressionValue>;
  vHtml?: ExpressionValue;
  vText?: ExpressionValue;
}
```

**理由：**
- 类型约束明确，vModel.prop 必须是引用
- vOn handler 必须是 FunctionValue
- 运行时无需猜测值类型

### Decision 4: 运行时简化

**选择：** 运行时直接使用解析后的结构

```typescript
// 旧: 需要检测类型
function resolveValue(value: unknown, context: RenderContext) {
  if (typeof value === 'string') {
    if (value.startsWith('{{')) { ... }
    else if (value.startsWith('ref_state_')) { ... }
  }
  // ... 大量分支
}

// 新: 直接使用结构化值
function resolveValue(value: PropertyValue, context: RenderContext) {
  switch (value.type) {
    case 'expression':
      return evaluateExpression(value.body, context);
    case 'state':
      return context.state[value.variable]?.value;
    case 'props':
      return context.props[value.variable];
    default:
      return value;  // 字面量
  }
}
```

**理由：**
- 消除运行时类型检测开销
- 代码更清晰，分支更少
- 类型安全，编译时捕获错误

### Decision 5: KeyParser 用于组件名转换

**选择：** 注册默认 KeyParser 处理组件名 kebab-case → PascalCase

```typescript
registerKeyParser('component-name', (key) => {
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
});
```

**理由：**
- 利用 core-engine 的 KeyParser 机制
- 自动转换 JSON 中的组件名

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 完全不兼容现有 Schema | 这是设计目标，提供迁移文档 |
| 大量代码重写 | 分阶段实施，每阶段有完整测试 |
| 学习曲线增加 | 提供详细文档和示例 |
| parseJson 解析失败 | 错误信息包含路径，易于定位 |