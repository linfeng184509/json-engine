# Plugin System - 插件系统规则

本文档定义插件架构、注册规则、Scope 扩展使用和自定义插件开发规范。

---

## VueJsonPlugin 接口

```typescript
interface VueJsonPlugin {
  name: string;                              // 必需：插件包名
  version: string;                           // 必需：语义化版本
  description?: string;                      // 可选：描述
  configSchema?: object;                     // 可选：JSON Schema 配置验证
  valueTypes?: ValueTypeDefinition[];        // 可选：自定义值解析器
  components?: PluginComponentDefinition[];  // 可选：Vue 组件
  scopeExtensions?: ScopeExtension[];        // 可选：CoreScope 扩展
  runtimeExports?: RuntimeExport[];          // 可选：运行时导出函数
  onInstall?: (context: PluginInstallContext) => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
}
```

---

## 插件注册规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **P01** | 使用插件功能前必须注册插件 |
| **P02** | 插件注册通过 `getPluginRegistry().register()` |
| **P03** | 插件名必须唯一，重复注册会覆盖 |
| **P04** | 插件安装顺序影响 Scope 扩展顺序 |

### 注册示例

```typescript
import { getPluginRegistry } from '@json-engine/vue-json';
import { 
  axiosPlugin, 
  routerPlugin, 
  storagePlugin,
  authPlugin,
  antdPlugin 
} from '@json-engine/plugins';

const registry = getPluginRegistry();

// 注册插件
registry.register(axiosPlugin);
registry.register(routerPlugin);
registry.register(storagePlugin);
registry.register(authPlugin);
registry.register(antdPlugin);

// 从 Schema 安装（批量安装）
await registry.installFromSchema(
  [
    { name: '@json-engine/plugin-axios', config: { baseURL: '/api' } },
    { name: '@json-engine/plugin-router', config: { mode: 'history' } },
    { name: '@json-engine/plugin-antd' }
  ],
  {}
);
```

---

## 可用插件列表

### 官方插件

| 插件名 | Scope Key | 功能描述 |
|--------|-----------|----------|
| `@json-engine/plugin-auth` | `_auth` | 用户认证、权限管理 |
| `@json-engine/plugin-router` | `_router` | 路由导航 |
| `@json-engine/plugin-storage` | `_storage` | 本地存储（TTL/加密） |
| `@json-engine/plugin-axios` | `_api` | HTTP 请求 |
| `@json-engine/plugin-websocket` | `_ws` | WebSocket 通信 |
| `@json-engine/plugin-i18n` | `_i18n` | 国际化 |
| `@json-engine/plugin-pinia` | `_pinia` | 状态管理 |
| `@json-engine/plugin-echarts` | `ECharts` 组件 | 图表可视化 |
| `@json-engine/plugin-antd` | 70+ 组件 | Ant Design Vue UI |

---

## Scope 扩展详细说明

### plugin-auth - CoreScopeAuth

```typescript
interface CoreScopeAuth {
  user: User | null;                    // 当前用户信息
  isAuthenticated(): boolean;           // 是否已登录
  hasPermission(permission: string): boolean;  // 权限检查
  hasRole(role: string): boolean;       // 角色检查
  login(credentials: Credentials): Promise<User>;  // 登录
  logout(): void;                       // 登出
}
```

**JSON 使用示例**:

```json
{
  "computed": {
    "isLoggedIn": {
      "getter": "{{$_core_auth.isAuthenticated()}}"
    },
    "userName": {
      "getter": "{{$_core_auth.user?.name}}"
    }
  },
  "methods": {
    "handleLogin": {
      "_type": "function",
      "params": { "username": "", "password": "" },
      "body": "coreScope._auth.login({ username, password }).then(user => { state.currentUser.value = user })"
    },
    "handleLogout": {
      "_type": "function",
      "params": {},
      "body": "coreScope._auth.logout()"
    },
    "checkAdmin": {
      "_type": "function",
      "params": {},
      "body": "return coreScope._auth.hasRole('admin')"
    }
  }
}
```

---

### plugin-router - CoreScopeRouter

```typescript
interface CoreScopeRouter {
  push(path: string): void;             // 导航到路径
  replace(path: string): void;          // 替换当前路由
  back(): void;                         // 返回上一页
  forward(): void;                      // 前进
  go(n: number): void;                  // 跳转 n 步
  getCurrentRoute(): string;            // 获取当前路径
  getMatchedRoute(): MatchedRoute | null;  // 获取匹配路由
}
```

**JSON 使用示例**:

```json
{
  "methods": {
    "navigateToHome": {
      "_type": "function",
      "params": {},
      "body": "coreScope._router.push('/home')"
    },
    "navigateToUser": {
      "_type": "function",
      "params": { "id": "" },
      "body": "coreScope._router.push(`/users/${id}`)"
    },
    "goBack": {
      "_type": "function",
      "params": {},
      "body": "coreScope._router.back()"
    },
    "replaceCurrent": {
      "_type": "function",
      "params": { "path": "" },
      "body": "coreScope._router.replace(path)"
    }
  },
  "computed": {
    "currentPath": {
      "getter": "{{$_core_router.getCurrentRoute()}}"
    }
  }
}
```

**配置选项**:

```json
{
  "name": "@json-engine/plugin-router",
  "config": {
    "mode": "history",           // 'hash' | 'history'
    "base": "/app",              // 基础路径
    "scrollBehavior": "top"      // 滚动行为
  }
}
```

---

### plugin-storage - CoreScopeStorage

```typescript
interface CoreScopeStorage {
  get<T>(key: string): T | null;        // 获取值（自动检查过期）
  set<T>(key: string, value: T, ttl?: number): void;  // 存储值（可选 TTL）
  remove(key: string): void;            // 删除项
  clear(): void;                        // 清除所有前缀项
  has(key: string): boolean;            // 检查存在
}
```

**JSON 使用示例**:

```json
{
  "state": {
    "preferences": { "type": "ref", "initial": null }
  },
  "methods": {
    "loadPreferences": {
      "_type": "function",
      "params": {},
      "body": "state.preferences.value = coreScope._storage.get('user-preferences')"
    },
    "savePreferences": {
      "_type": "function",
      "params": { "prefs": {} },
      "body": "coreScope._storage.set('user-preferences', prefs, 3600000)"  // TTL: 1小时
    },
    "clearPreferences": {
      "_type": "function",
      "params": {},
      "body": "coreScope._storage.remove('user-preferences')"
    }
  },
  "lifecycle": {
    "onMounted": {
      "_type": "function",
      "params": {},
      "body": "methods.loadPreferences()"
    }
  }
}
```

**配置选项**:

```json
{
  "name": "@json-engine/plugin-storage",
  "config": {
    "prefix": "app_",            // 键前缀
    "encrypt": true,             // 是否加密
    "encryptKey": "secret",      // 加密密钥
    "sync": true,                // 同步到 localStorage
    "type": "localStorage"       // 'localStorage' | 'sessionStorage'
  }
}
```

---

### plugin-axios - CoreScopeApi

```typescript
interface CoreScopeApi {
  get(url: string, options?: RequestOptions): Promise<unknown>;
  post(url: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
  put(url: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
  delete(url: string, options?: RequestOptions): Promise<unknown>;
}
```

**JSON 使用示例**:

```json
{
  "state": {
    "users": { "type": "ref", "initial": [] },
    "loading": { "type": "ref", "initial": false },
    "error": { "type": "ref", "initial": null }
  },
  "methods": {
    "loadUsers": {
      "_type": "function",
      "params": {},
      "body": "state.loading.value = true; coreScope._api.get('/users').then(res => { state.users.value = res.data; state.loading.value = false }).catch(err => { state.error.value = err.message; state.loading.value = false })"
    },
    "createUser": {
      "_type": "function",
      "params": { "user": {} },
      "body": "coreScope._api.post('/users', user).then(res => { state.users.value.push(res.data) })"
    },
    "updateUser": {
      "_type": "function",
      "params": { "id": "", "user": {} },
      "body": "coreScope._api.put(`/users/${id}`, user).then(res => { const idx = state.users.value.findIndex(u => u.id === id); state.users.value[idx] = res.data })"
    },
    "deleteUser": {
      "_type": "function",
      "params": { "id": "" },
      "body": "coreScope._api.delete(`/users/${id}`).then(() => { state.users.value = state.users.value.filter(u => u.id !== id) })"
    }
  }
}
```

**配置选项**:

```json
{
  "name": "@json-engine/plugin-axios",
  "config": {
    "baseURL": "/api",           // 基础 URL
    "timeout": 30000,            // 超时时间（ms）
    "headers": {                 // 默认请求头
      "Content-Type": "application/json"
    },
    "withCredentials": true,     // 跨域携带凭证
    "retry": 3                   // 重试次数
  }
}
```

---

### plugin-websocket - CoreScopeWS

```typescript
interface CoreScopeWS {
  send(topic: string, data: unknown): void;   // 发送消息
  subscribe(topic: string, callback: Function): void;  // 订阅主题
  unsubscribe(topic: string): void;           // 取消订阅
  connect(): void;                            // 建立连接
  disconnect(): void;                         // 断开连接
  isConnected(): boolean;                     // 检查连接状态
}
```

**JSON 使用示例**:

```json
{
  "state": {
    "messages": { "type": "ref", "initial": [] },
    "connected": { "type": "ref", "initial": false }
  },
  "methods": {
    "sendMessage": {
      "_type": "function",
      "params": { "message": "" },
      "body": "coreScope._ws.send('chat', { text: message })"
    },
    "handleMessage": {
      "_type": "function",
      "params": { "data": {} },
      "body": "state.messages.value.push(data)"
    },
    "connect": {
      "_type": "function",
      "params": {},
      "body": "coreScope._ws.connect(); coreScope._ws.subscribe('chat', methods.handleMessage)"
    }
  },
  "computed": {
    "isConnected": {
      "getter": "{{$_core_ws.isConnected()}}"
    }
  }
}
```

---

### plugin-i18n - CoreScopeI18n

```typescript
interface CoreScopeI18n {
  t(key: string, params?: Record<string, unknown>): string;  // 翻译
  setLocale(locale: string): void;        // 设置语言
  getLocale(): string;                    // 获取当前语言
}
```

**JSON 使用示例**:

```json
{
  "computed": {
    "welcomeText": {
      "getter": "{{$_core_i18n.t('welcome', { name: ref_state_userName })}}"
    },
    "currentLocale": {
      "getter": "{{$_core_i18n.getLocale()}}"
    }
  },
  "methods": {
    "switchLocale": {
      "_type": "function",
      "params": { "locale": "" },
      "body": "coreScope._i18n.setLocale(locale)"
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "children": { "_type": "expression", "expression": "{{$_core_i18n.t('hello')}}" }
    }
  }
}
```

**配置选项**:

```json
{
  "name": "@json-engine/plugin-i18n",
  "config": {
    "locale": "zh-CN",           // 默认语言
    "fallbackLocale": "en",      // 回退语言
    "messages": {                // 翻译字典
      "zh-CN": { "hello": "你好" },
      "en": { "hello": "Hello" }
    }
  }
}
```

---

### plugin-pinia - CoreScopePinia

```typescript
interface CoreScopePinia {
  $store: Map<string, unknown>;          // Store 注册表
  useStore<T>(name: string): T;          // 获取 Store 实例
  registerStore(definition: StoreDefinition): void;  // 注册 Store
}
```

**JSON 使用示例**:

```json
{
  "methods": {
    "getUserStore": {
      "_type": "function",
      "params": {},
      "body": "return coreScope._pinia.useStore('userStore')"
    },
    "updateUserInStore": {
      "_type": "function",
      "params": { "user": {} },
      "body": "const store = coreScope._pinia.useStore('userStore'); store.setUser(user)"
    }
  }
}
```

---

### plugin-echarts - ECharts 组件

**组件注册**:

```typescript
// plugin-echarts 注册 'ECharts' 组件
```

**JSON 使用示例**:

```json
{
  "state": {
    "chartOption": { 
      "type": "ref", 
      "initial": {
        "title": { "text": "Sales Chart" },
        "xAxis": { "data": ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        "yAxis": {},
        "series": [{ "type": "bar", "data": [120, 200, 150, 80, 70] }]
      }
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "ECharts",
      "props": {
        "option": { "_type": "expression", "expression": "{{ref_state_chartOption}}" },
        "autoResize": true,
        "theme": "light"
      }
    }
  }
}
```

---

### plugin-antd - Ant Design Vue 组件

**组件列表**（70+）:

| 分类 | 组件 |
|------|------|
| **表单** | AForm, AFormItem, AInput, ASelect, ARadio, ACheckbox, ASwitch, ADatePicker, ATimePicker, AUpload, ASlider, ARate, ACascader, ATransfer |
| **展示** | ATable, ATree, AList, ACard, AStatistic, ATag, ABadge, AAvatar, AImage, ACalendar, ADescriptions, AEmpty, AResult |
| **导航** | AButton, ATabs, AMenu, ABreadcrumb, APagination, ASteps, ADropdown, AAnchor |
| **反馈** | AAlert, AModal, ADrawer, AProgress, ASpin, ASkeleton, APopconfirm, APopover, ATooltip, AMessage, ANotification |
| **布局** | ALayout, ARow, ACol, ASpace, ADivider, ASider, AHeader, AContent, AFooter |

**JSON 使用示例**:

```json
{
  "state": {
    "form": { "type": "reactive", "initial": { "name": "", "email": "" } },
    "tableData": { "type": "ref", "initial": [] },
    "loading": { "type": "ref", "initial": false }
  },
  "methods": {
    "submit": {
      "_type": "function",
      "params": {},
      "body": "coreScope._api.post('/users', state.form).then(() => { methods.loadTable() })"
    },
    "loadTable": {
      "_type": "function",
      "params": {},
      "body": "state.loading.value = true; coreScope._api.get('/users').then(res => { state.tableData.value = res.data; state.loading.value = false })"
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "a-space",
      "props": { "direction": "vertical", "size": "large" },
      "children": [
        {
          "type": "a-form",
          "props": { 
            "model": { "_type": "expression", "expression": "{{ref_state_form}}" },
            "layout": "horizontal"
          },
          "children": [
            {
              "type": "a-form-item",
              "props": { "label": "Name" },
              "children": {
                "type": "a-input",
                "directives": {
                  "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "form", "path": "name" } }
                }
              }
            },
            {
              "type": "a-form-item",
              "props": { "label": "Email" },
              "children": {
                "type": "a-input",
                "directives": {
                  "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "form", "path": "email" } }
                }
              }
            },
            {
              "type": "a-button",
              "props": { "type": "primary" },
              "directives": {
                "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.submit()" } }
              },
              "children": "Submit"
            }
          ]
        },
        {
          "type": "a-table",
          "props": {
            "dataSource": { "_type": "expression", "expression": "{{ref_state_tableData}}" },
            "loading": { "_type": "expression", "expression": "{{ref_state_loading}}" },
            "columns": [
              { "title": "Name", "dataIndex": "name" },
              { "title": "Email", "dataIndex": "email" }
            ]
          }
        }
      ]
    }
  }
}
```

---

## 自定义插件开发

### 插件结构

```
plugin-custom/
├── src/
│   ├── plugin.ts           # 主插件定义
│   ├── index.ts            # 公共导出
│   ├── types.ts            # TypeScript 类型
│   ├── config-schema.ts    # JSON Schema 配置验证
│   ├── runtime/
│   │   └ custom-factory.ts # 运行时实例工厂
│   └── scope/
│   │   └ custom-scope.ts   # Scope 扩展工厂
│   └── parser/             # 可选：自定义值解析器
│   └── components/         # 可选：Vue 组件
├── package.json
└── tsconfig.json
```

### 示例：创建自定义插件

**1. 类型定义 (types.ts)**:

```typescript
export interface CustomPluginConfig {
  apiKey?: string;
  endpoint?: string;
}

export interface CoreScopeCustom {
  fetchData: (query: string) => Promise<unknown>;
  sendData: (data: unknown) => Promise<unknown>;
}
```

**2. 配置 Schema (config-schema.ts)**:

```typescript
export const customConfigSchema = {
  type: 'object',
  properties: {
    apiKey: { type: 'string', description: 'API Key' },
    endpoint: { type: 'string', description: 'API Endpoint' }
  },
  additionalProperties: false
};
```

**3. 运行时工厂 (runtime/custom-factory.ts)**:

```typescript
import type { CustomPluginConfig, CoreScopeCustom } from '../types';

export function createCustomInstance(config: CustomPluginConfig): CoreScopeCustom {
  const endpoint = config.endpoint ?? '/api/custom';
  const apiKey = config.apiKey ?? '';

  return {
    fetchData: async (query: string) => {
      const response = await fetch(`${endpoint}?q=${query}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    },
    sendData: async (data: unknown) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  };
}
```

**4. Scope 扩展工厂 (scope/custom-scope.ts)**:

```typescript
import type { CustomPluginConfig, CoreScopeCustom } from '../types';
import { createCustomInstance } from '../runtime/custom-factory';

export function createCustomScope(config: CustomPluginConfig): CoreScopeCustom {
  return createCustomInstance(config);
}
```

**5. 主插件定义 (plugin.ts)**:

```typescript
import type { VueJsonPlugin } from '@json-engine/vue-json';
import { customConfigSchema } from './config-schema';
import { createCustomInstance } from './runtime/custom-factory';
import { createCustomScope } from './scope/custom-scope';
import type { CustomPluginConfig } from './types';

export const customPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-custom',
  version: '0.0.1',
  description: 'Custom plugin for vue-json',

  configSchema: customConfigSchema,

  scopeExtensions: [
    {
      key: '_custom',
      factory: (config: unknown) => createCustomScope(config as CustomPluginConfig)
    }
  ],

  runtimeExports: [
    {
      name: 'createCustomInstance',
      factory: createCustomInstance
    }
  ],

  onInstall(context) {
    const config = context.config as CustomPluginConfig;
    console.log(`[plugin-custom] Installed with endpoint: ${config.endpoint}`);
  }
};

export default customPlugin;
```

**6. 公共导出 (index.ts)**:

```typescript
export { customPlugin, default as default } from './plugin';
export type { CustomPluginConfig, CoreScopeCustom } from './types';
export { createCustomInstance } from './runtime/custom-factory';
```

---

## 规则汇总表

| ID | 领域 | 规则 |
|----|------|------|
| P01 | 注册 | 使用前必须注册 |
| P02 | 注册 | 通过 getPluginRegistry().register() |
| P03 | 注册 | 插件名必须唯一 |
| P04 | 注册 | 安装顺序影响扩展顺序 |
| P05 | Scope | 引用前确保插件已安装 |
| P06 | Scope | 使用 `$_core_<scopeKey>` 格式 |
| P07 | Config | configSchema 必须是 JSON Schema Draft-07 |
| P08 | Scope 扩展 | factory 必须返回有效的 Scope 对象 |
| P09 | 组件 | 组件必须在 components 字段声明 |
| P10 | 自定义 | 自定义插件必须遵循 VueJsonPlugin 接口 |