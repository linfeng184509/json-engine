## Context

vue-json 当前是一个单体包，所有功能实现在同一个包中：
- HTTP 客户端（使用原生 fetch）
- UI 组件（Ant Design Vue）
- 路由（自定义 hash router）
- 图表（ECharts）
- WebSocket
- 浏览器存储
- 状态管理（类 Pinia）
- 权限认证
- 国际化

**约束**:
- 必须支持纯 JSON Schema 声明式配置
- 插件版本必须与核心包版本绑定（主次版本匹配）
- CoreScope 仅保留 `_loader`，其他由插件扩展
- 用户需自行安装 peerDependencies

**利益相关者**:
- vue-json 开发者
- 使用 vue-json 的应用开发者
- 企业级应用（如 enterprise-admin）

## Goals / Non-Goals

**Goals:**
- 创建 9 个独立插件包，每个插件独立测试和发布
- 实现插件注册表，支持版本验证和配置验证
- 用户通过 JSON Schema 的 `plugins` 字段声明所需插件
- 用户通过 JSON Schema 的 `config` 字段配置各插件
- 核心包仅保留核心渲染、解析、状态管理功能
- 友好的错误提示：peerDependencies 未安装时给出明确提示

**Non-Goals:**
- 不支持动态加载插件（import()）
- 不支持插件热更新
- 不支持第三方插件（仅官方插件）
- 不支持插件卸载后重新安装

## Decisions

### 1. 插件包目录位置

**Decision**: 放在 `src/packages/plugins/` 目录下

**Rationale**: 
- 与现有包结构一致（`src/packages/vue-json`, `src/packages/core-engine`）
- 便于 workspace 管理
- 插件名称统一为 `@json-engine/plugin-xxx`

**Alternatives considered**:
- 放在单独的仓库：增加维护成本，版本同步困难
- 放在 `src/packages/` 根目录：不利于区分核心包和插件包

### 2. 版本绑定策略

**Decision**: 主版本 + 次版本必须匹配，修订号可不同

**Rationale**:
- 保证 API 兼容性
- 允许独立修复 bug（修订号递增）
- 简化版本管理

**Example**:
- vue-json@0.0.1 可与 plugin-axios@0.0.1 或 plugin-axios@0.0.2 配合
- vue-json@0.1.0 不与 plugin-axios@0.0.x 配合

### 3. Scope 扩展机制

**Decision**: 核心包定义空的 CoreScope 接口，插件通过 ScopeExtension 注册

**Rationale**:
- 解耦核心包和插件
- 支持 TypeScript 类型扩展（模块扩展）

**Implementation**:
```typescript
// 核心包
interface CoreScope {
  _loader: CoreScopeLoader;
  [key: string]: unknown;  // 插件扩展
}

// 插件注册
pluginRegistry.registerScopeExtension({
  key: '_api',
  factory: (config) => createApiScope(config)
});
```

### 4. 配置验证

**Decision**: 使用 JSON Schema Draft-07 验证插件配置

**Rationale**:
- 标准化的验证规则
- 支持复杂的嵌套配置
- 可生成文档

**Implementation**:
每个插件提供 `config-schema.ts`:
```typescript
export const axiosConfigSchema = {
  type: 'object',
  properties: {
    baseURL: { type: 'string' },
    timeout: { type: 'number' },
    headers: { type: 'object' }
  }
};
```

### 5. 迁移策略

**Decision**: 先复制后删除

**Rationale**:
- 保证功能连续性
- 可逐步验证
- 出问题时可回滚

**Steps**:
1. 创建插件包目录结构
2. 复制相关代码到插件包
3. 编写并运行单元测试
4. 验证通过后删除原文件
5. 更新导入导出

## Risks / Trade-offs

**[Risk] 插件版本不兼容** 
→ Mitigation: 版本验证器在安装时检查，不兼容则抛出明确错误

**[Risk] peerDependencies 未安装**
→ Mitigation: 安装时检查，输出友好提示：
```
[@json-engine/plugin-echarts] peerDependency "echarts" not installed.
Please run: npm install echarts
```

**[Risk] 大量文件迁移导致遗漏**
→ Mitigation: 使用 grep 搜索所有引用，逐个更新

**[Risk] 测试覆盖不足**
→ Mitigation: 每个插件必须有独立测试，核心包测试必须在迁移后通过

**[Trade-off] 插件数量多**
→ 用户需要安装多个包，但可按需选择

**[Trade-off] 版本绑定严格**
→ 降低灵活性，但保证兼容性

## Migration Plan

### Phase 1: 核心包改造
1. 创建 `types/plugin.ts`
2. 创建 `plugin/` 目录
3. 修改 `types/app.ts` 添加 plugins/config 字段
4. 修改 `app-factory.ts` 集成插件安装

### Phase 2: 创建插件包
按顺序创建：
1. plugin-system（内置）
2. plugin-axios
3. plugin-antd
4. plugin-router
5. plugin-echarts
6. plugin-websocket
7. plugin-storage
8. plugin-pinia
9. plugin-auth
10. plugin-i18n

### Phase 3: 核心包清理
1. 删除迁移的文件
2. 更新 use-core-scope.ts
3. 更新 value-resolver.ts
4. 更新 index.ts

### Phase 4: 集成测试
1. 核心包测试
2. 各插件测试
3. enterprise-admin 集成测试

### Rollback Strategy
如果出现问题，可通过 git revert 回滚到重构前的 commit。