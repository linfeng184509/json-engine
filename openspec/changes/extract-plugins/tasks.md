## 1. 核心包改造

- [ ] 1.1 创建 `src/packages/vue-json/src/types/plugin.ts` - 插件类型定义
- [ ] 1.2 创建 `src/packages/vue-json/src/plugin/types.ts` - 内部类型
- [ ] 1.3 创建 `src/packages/vue-json/src/plugin/version-validator.ts` - 版本验证器
- [ ] 1.4 创建 `src/packages/vue-json/src/plugin/config-validator.ts` - 配置验证器
- [ ] 1.5 创建 `src/packages/vue-json/src/plugin/plugin-registry.ts` - 插件注册表
- [ ] 1.6 创建 `src/packages/vue-json/src/plugin/index.ts` - 导出
- [ ] 1.7 修改 `src/packages/vue-json/src/types/app.ts` - 添加 plugins/config 字段
- [ ] 1.8 修改 `src/packages/vue-json/src/runtime/app-factory.ts` - 集成插件安装
- [ ] 1.9 修改 `src/packages/vue-json/src/composables/use-core-scope.ts` - 移除迁移的 Scope
- [ ] 1.10 修改 `src/packages/vue-json/src/runtime/value-resolver.ts` - 移除迁移的 resolver
- [ ] 1.11 修改 `src/packages/vue-json/src/index.ts` - 导出插件 API
- [ ] 1.12 编写核心包单元测试

## 2. plugin-axios 实现

- [ ] 2.1 创建 `src/packages/plugins/plugin-axios/` 目录结构
- [ ] 2.2 创建 `package.json` - 包配置
- [ ] 2.3 创建 `src/types.ts` - 类型定义
- [ ] 2.4 创建 `src/config-schema.ts` - 配置验证
- [ ] 2.5 创建 `src/runtime/axios-factory.ts` - 迁移自 network-factory.ts
- [ ] 2.6 创建 `src/scope/api-scope.ts` - `_api` Scope
- [ ] 2.7 创建 `src/parser/api-parser.ts` - api-call 解析器
- [ ] 2.8 创建 `src/resolver/api-resolver.ts` - 运行时解析
- [ ] 2.9 创建 `src/plugin.ts` - 插件定义
- [ ] 2.10 创建 `src/index.ts` - 导出
- [ ] 2.11 编写单元测试
- [ ] 2.12 创建 README.md

## 3. plugin-antd 实现

- [ ] 3.1 创建 `src/packages/plugins/plugin-antd/` 目录结构
- [ ] 3.2 创建 `package.json`
- [ ] 3.3 创建 `src/types.ts`
- [ ] 3.4 创建 `src/config-schema.ts`
- [ ] 3.5 创建 `src/runtime/ui-factory.ts` - 迁移自 ui-factory.ts
- [ ] 3.6 创建 `src/runtime/theme-provider.ts`
- [ ] 3.7 创建 `src/components/index.ts` - 组件导出
- [ ] 3.8 创建 `src/plugin.ts`
- [ ] 3.9 创建 `src/index.ts`
- [ ] 3.10 编写单元测试
- [ ] 3.11 创建 README.md

## 4. plugin-router 实现

- [ ] 4.1 创建 `src/packages/plugins/plugin-router/` 目录结构
- [ ] 4.2 创建 `package.json`
- [ ] 4.3 创建 `src/types.ts` - 迁移自 types/router.ts
- [ ] 4.4 创建 `src/config-schema.ts`
- [ ] 4.5 创建 `src/runtime/router-factory.ts` - 迁移
- [ ] 4.6 创建 `src/scope/router-scope.ts` - `_router` Scope
- [ ] 4.7 创建 `src/parser/route-parser.ts`
- [ ] 4.8 创建 `src/plugin.ts`
- [ ] 4.9 创建 `src/index.ts`
- [ ] 4.10 编写单元测试
- [ ] 4.11 创建 README.md

## 5. plugin-echarts 实现

- [ ] 5.1 创建 `src/packages/plugins/plugin-echarts/` 目录结构
- [ ] 5.2 创建 `package.json`
- [ ] 5.3 创建 `src/types.ts` - 迁移自 types/echarts.ts
- [ ] 5.4 创建 `src/config-schema.ts`
- [ ] 5.5 创建 `src/components/EChartsComponent.ts` - 迁移
- [ ] 5.6 创建 `src/runtime/echarts-factory.ts` - 迁移
- [ ] 5.7 创建 `src/parser/echarts-option-parser.ts` - 迁移
- [ ] 5.8 创建 `src/resolver/echarts-resolver.ts`
- [ ] 5.9 创建 `src/plugin.ts`
- [ ] 5.10 创建 `src/index.ts`
- [ ] 5.11 编写单元测试
- [ ] 5.12 创建 README.md

## 6. plugin-websocket 实现

- [ ] 6.1 创建 `src/packages/plugins/plugin-websocket/` 目录结构
- [ ] 6.2 创建 `package.json`
- [ ] 6.3 创建 `src/types.ts`
- [ ] 6.4 创建 `src/config-schema.ts`
- [ ] 6.5 创建 `src/runtime/ws-factory.ts` - 提取自 network-factory.ts
- [ ] 6.6 创建 `src/scope/ws-scope.ts` - `_ws` Scope
- [ ] 6.7 创建 `src/parser/ws-parser.ts`
- [ ] 6.8 创建 `src/plugin.ts`
- [ ] 6.9 创建 `src/index.ts`
- [ ] 6.10 编写单元测试
- [ ] 6.11 创建 README.md

## 7. plugin-storage 实现

- [ ] 7.1 创建 `src/packages/plugins/plugin-storage/` 目录结构
- [ ] 7.2 创建 `package.json`
- [ ] 7.3 创建 `src/types.ts`
- [ ] 7.4 创建 `src/config-schema.ts`
- [ ] 7.5 创建 `src/runtime/storage-factory.ts` - 迁移
- [ ] 7.6 创建 `src/scope/storage-scope.ts` - `_storage` Scope
- [ ] 7.7 创建 `src/parser/storage-parser.ts`
- [ ] 7.8 创建 `src/plugin.ts`
- [ ] 7.9 创建 `src/index.ts`
- [ ] 7.10 编写单元测试
- [ ] 7.11 创建 README.md

## 8. plugin-pinia 实现

- [ ] 8.1 创建 `src/packages/plugins/plugin-pinia/` 目录结构
- [ ] 8.2 创建 `package.json`
- [ ] 8.3 创建 `src/types.ts` - 迁移自 types/store.ts
- [ ] 8.4 创建 `src/config-schema.ts`
- [ ] 8.5 创建 `src/runtime/store-factory.ts` - 迁移
- [ ] 8.6 创建 `src/parser/store-parser.ts`
- [ ] 8.7 创建 `src/plugin.ts`
- [ ] 8.8 创建 `src/index.ts`
- [ ] 8.9 编写单元测试
- [ ] 8.10 创建 README.md

## 9. plugin-auth 实现

- [ ] 9.1 创建 `src/packages/plugins/plugin-auth/` 目录结构
- [ ] 9.2 创建 `package.json`
- [ ] 9.3 创建 `src/types.ts` - 迁移自 types/auth.ts
- [ ] 9.4 创建 `src/config-schema.ts`
- [ ] 9.5 创建 `src/runtime/permission-provider.ts` - 迁移
- [ ] 9.6 创建 `src/runtime/permission-checker.ts` - 迁移
- [ ] 9.7 创建 `src/runtime/field-permission.ts` - 迁移
- [ ] 9.8 创建 `src/runtime/sop-permission.ts` - 迁移
- [ ] 9.9 创建 `src/runtime/auth-directive.ts` - 迁移
- [ ] 9.10 创建 `src/scope/auth-scope.ts` - `_auth` Scope
- [ ] 9.11 创建 `src/plugin.ts`
- [ ] 9.12 创建 `src/index.ts`
- [ ] 9.13 编写单元测试
- [ ] 9.14 创建 README.md

## 10. plugin-i18n 实现

- [ ] 10.1 创建 `src/packages/plugins/plugin-i18n/` 目录结构
- [ ] 10.2 创建 `package.json`
- [ ] 10.3 创建 `src/types.ts`
- [ ] 10.4 创建 `src/config-schema.ts`
- [ ] 10.5 创建 `src/runtime/i18n-factory.ts` - 迁移
- [ ] 10.6 创建 `src/scope/i18n-scope.ts` - `_i18n` Scope
- [ ] 10.7 创建 `src/parser/i18n-parser.ts`
- [ ] 10.8 创建 `src/plugin.ts`
- [ ] 10.9 创建 `src/index.ts`
- [ ] 10.10 编写单元测试
- [ ] 10.11 创建 README.md

## 11. 核心包清理

- [ ] 11.1 删除 `src/packages/vue-json/src/runtime/network-factory.ts`
- [ ] 11.2 删除 `src/packages/vue-json/src/runtime/ui-factory.ts`
- [ ] 11.3 删除 `src/packages/vue-json/src/runtime/router-factory.ts`
- [ ] 11.4 删除 `src/packages/vue-json/src/runtime/echarts-factory.ts`
- [ ] 11.5 删除 `src/packages/vue-json/src/runtime/storage-factory.ts`
- [ ] 11.6 删除 `src/packages/vue-json/src/runtime/store-factory.ts`
- [ ] 11.7 删除 `src/packages/vue-json/src/runtime/permission-provider.ts`
- [ ] 11.8 删除 `src/packages/vue-json/src/runtime/permission-checker.ts`
- [ ] 11.9 删除 `src/packages/vue-json/src/runtime/field-permission.ts`
- [ ] 11.10 删除 `src/packages/vue-json/src/runtime/sop-permission.ts`
- [ ] 11.11 删除 `src/packages/vue-json/src/runtime/auth-directive.ts`
- [ ] 11.12 删除 `src/packages/vue-json/src/runtime/i18n-factory.ts`
- [ ] 11.13 删除 `src/packages/vue-json/src/components/EChartsComponent.ts`
- [ ] 11.14 删除 `src/packages/vue-json/src/parser/echarts-option-parser.ts`
- [ ] 11.15 删除 `src/packages/vue-json/src/types/echarts.ts`
- [ ] 11.16 删除 `src/packages/vue-json/src/types/router.ts`
- [ ] 11.17 删除 `src/packages/vue-json/src/types/store.ts`
- [ ] 11.18 删除 `src/packages/vue-json/src/types/auth.ts`
- [ ] 11.19 更新 `src/packages/vue-json/src/runtime/index.ts`
- [ ] 11.20 更新 `src/packages/vue-json/src/types/index.ts`
- [ ] 11.21 更新 `src/packages/vue-json/src/components/index.ts`

## 12. 配置更新

- [ ] 12.1 更新根 `package.json` workspaces
- [ ] 12.2 更新根 `tsconfig.json` paths
- [ ] 12.3 更新 `vitest.config.ts` 测试配置

## 13. 集成测试

- [ ] 13.1 核心包测试通过
- [ ] 13.2 plugin-axios 测试通过
- [ ] 13.3 plugin-antd 测试通过
- [ ] 13.4 plugin-router 测试通过
- [ ] 13.5 plugin-echarts 测试通过
- [ ] 13.6 plugin-websocket 测试通过
- [ ] 13.7 plugin-storage 测试通过
- [ ] 13.8 plugin-pinia 测试通过
- [ ] 13.9 plugin-auth 测试通过
- [ ] 13.10 plugin-i18n 测试通过
- [ ] 13.11 enterprise-admin 集成测试通过（MCP）
- [ ] 13.12 构建通过：`npm run build`
- [ ] 13.13 类型检查通过：`npm run typecheck`
- [ ] 13.14 Lint 通过：`npm run lint`