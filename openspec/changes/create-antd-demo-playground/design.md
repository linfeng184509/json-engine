## Context

**Current State**:
- vue-json 已扩展支持 v-model 带参数、Icon 注册、插槽渲染、高级 API scope
- enterprise-admin 项目展示了完整的应用结构
- ant-design-vue-main 包含 76 个组件，约 500+ demo 文件

**Constraints**:
- 必须使用 vue-json 的 JSON Schema 格式
- 必须使用 plugin-antd 的 includeIcons 配置
- 项目结构必须与 enterprise-admin 保持一致

**Stakeholders**:
- vue-json 使用者（参考 demo 学习）
- antd-demo-playground 维护者

## Goals / Non-Goals

**Goals**:
- 创建完整可运行的 antd demo 演示项目
- 转换所有 76 个组件的主要 demo
- 提供侧边栏导航 + demo 展示布局
- 支持 JSON 源码查看功能

**Non-Goals**:
- 不支持 demo 在线编辑
- 不支持 demo 导出功能
- 不转换使用 h() 函数渲染的复杂 demo

## Decisions

### Decision 1: Demo 文件组织结构

**Chosen**: 按组件分类目录组织

```
public/schemas/demos/
├── general/          # 通用
│   ├── button/
│   │   ├── basic.json
│   │   └── icon.json
│   └── icon/
├── layout/           # 布局
├── navigation/       # 导航
├── data-entry/       # 数据录入
├── data-display/     # 数据展示
└── feedback/         # 反馈
```

**Alternatives Considered**:
- A: 扁平结构 demos/button-basic.json → Rejected: 难以管理 500+ 文件
- B: 单文件多 demo → Rejected: 不利于按需加载

**Rationale**: 分类目录结构清晰，易于维护和扩展，与 antd 官方文档分类一致。

### Decision 2: 路由配置方式

**Chosen**: 动态路由 + app.json 配置

```json
{
  "router": {
    "routes": [
      { "path": "/demos/button/basic", "component": "/schemas/demos/general/button/basic.json" }
    ]
  }
}
```

**Alternatives Considered**:
- A: 自动扫描 schemas 目录生成路由 → Rejected: 增加构建复杂度
- B: 手动配置每个路由 → Chosen: 明确可控

**Rationale**: 手动配置路由清晰可控，支持 meta 信息配置。

### Decision 3: Vue demo 转 JSON 策略

**Chosen**: 手动转换核心 demo，建立转换模式

**转换规则**:
1. `<a-button>` → `{ "type": "AButton" }`
2. `v-model:open="visible"` → `{ "directives": { "vModel": { "prop": "...", "arg": "open" } } }`
3. `<template #bodyCell="{ column, record }">` → `{ "directives": { "vSlot": { "name": "bodyCell", "props": ["column", "record"] } } }`
4. `<script setup>` 中的 `ref()` → `"state": { "xxx": { "type": "ref", "initial": ... } }`
5. Icon 导入 → 直接使用组件名（如 `SearchOutlined`）

**Alternatives Considered**:
- A: 自动化脚本转换 → Rejected: 转换规则复杂，需要人工校验

**Rationale**: 手动转换保证质量，建立模式后可考虑半自动化。

### Decision 4: 组件分类

**Chosen**: 按 antd 官方文档分类

| 分类 | 目录 | 组件 |
|------|------|------|
| 通用 | general | Button, Icon, Typography |
| 布局 | layout | Grid, Layout, Space, Divider |
| 导航 | navigation | Menu, Dropdown, Breadcrumb, Steps, Pagination |
| 数据录入 | data-entry | Form, Input, Select, Checkbox, Radio, Switch, DatePicker, Upload |
| 数据展示 | data-display | Table, List, Modal, Tabs, Tree, Descriptions, Card |
| 反馈 | feedback | Alert, Message, Notification, Progress, Spin, Skeleton |
| 其他 | other | ConfigProvider, LocaleProvider, Watermark |

**Rationale**: 与 antd 官方文档一致，用户熟悉度高。

## Risks / Trade-offs

### Risk 1: Demo 数量巨大
**Risk**: 500+ demo 文件创建耗时
**Mitigation**: 分阶段实施，优先高频组件，建立转换模式后加速

### Risk 2: 复杂 demo 无法转换
**Risk**: 使用 h()、useModal() 等 API 的 demo 无法直接转换
**Mitigation**: 简化或跳过此类 demo，标注说明

### Risk 3: 图标组件数量多
**Risk**: 790+ 图标注册增加 bundle 大小
**Mitigation**: 仅开发环境启用 includeIcons，生产环境按需配置

## Implementation Phases

1. **Phase 1**: 项目骨架（package.json, vite.config.ts, main.ts, setup-app.ts, app.json, app-root.json）
2. **Phase 2**: 通用组件 demo（Button, Icon, Typography）
3. **Phase 3**: 布局组件 demo（Grid, Layout, Space, Divider）
4. **Phase 4**: 导航组件 demo（Menu, Dropdown, Breadcrumb, Steps）
5. **Phase 5**: 数据录入组件 demo（Form, Input, Select 等）
6. **Phase 6**: 数据展示组件 demo（Table, Modal, Tabs 等）
7. **Phase 7**: 反馈组件 demo（Alert, Message 等）
8. **Phase 8**: 其他组件 demo

## Open Questions

1. 是否需要 demo 分类标签（如：基础、进阶、高级）？ → **Deferred**: 先完成基础转换
2. 是否需要搜索功能？ → **Deferred**: 后续优化
