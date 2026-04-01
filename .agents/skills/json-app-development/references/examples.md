# Examples - 正确示例与常见错误对比

本文档提供完整的 JSON Schema 示例和常见错误对比。

---

## 基础组件示例

### 正确示例：Counter 组件

```json
{
  "name": "Counter",
  "state": {
    "count": { "type": "ref", "initial": 0 },
    "message": { "type": "ref", "initial": "" }
  },
  "computed": {
    "doubled": { "getter": "{{ref_state_count * 2}}" },
    "isPositive": { "getter": "{{ref_state_count > 0}}" }
  },
  "methods": {
    "increment": {
      "_type": "function",
      "params": {},
      "body": "state.count.value++"
    },
    "decrement": {
      "_type": "function",
      "params": {},
      "body": "state.count.value--"
    },
    "reset": {
      "_type": "function",
      "params": {},
      "body": "state.count.value = 0; state.message.value = 'Reset'"
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "props": { "class": "counter" },
      "children": [
        {
          "type": "h2",
          "children": { "_type": "expression", "expression": "{{'Count: ' + ref_state_count}}" }
        },
        {
          "type": "p",
          "children": { "_type": "expression", "expression": "{{'Doubled: ' + ref_computed_doubled}}" }
        },
        {
          "type": "div",
          "children": [
            {
              "type": "button",
              "directives": {
                "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.decrement()" } }
              },
              "children": "-"
            },
            {
              "type": "button",
              "directives": {
                "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.increment()" } }
              },
              "children": "+"
            },
            {
              "type": "button",
              "directives": {
                "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.reset()" } }
              },
              "children": "Reset"
            }
          ]
        },
        {
          "type": "p",
          "directives": {
            "vIf": { "_type": "expression", "expression": "{{ref_state_message}}" }
          },
          "children": { "_type": "expression", "expression": "{{ref_state_message}}" }
        }
      ]
    }
  }
}
```

### 错误示例对比

```json
// 错误：缺少 name 和 render
{
  "state": { "count": { "type": "ref", "initial": 0 } }
}
// ❌ 规则 S01, S02 违反

// 错误：ref 的 initial 是对象
{
  "name": "Counter",
  "state": { "count": { "type": "ref", "initial": {} } },
  "render": { "type": "template", "content": { "type": "div" } }
}
// ❌ 规则 S06 违反：ref 应用于原始值

// 错误：直接访问 state
{
  "computed": { "doubled": { "getter": "{{state.count * 2}}" } }
}
// ❌ 规则 R01 违反：应为 {{ref_state_count}}

// 错误：函数体缺少 .value
{
  "methods": {
    "increment": { "_type": "function", "params": {}, "body": "state.count++" }
  }
}
// ❌ 规则 R03 违反：ref 类型需要 .value

// 错误：vIf 值不是 ExpressionValue
{
  "directives": { "vIf": true }
}
// ❌ 规则 D01 违反：应为 ExpressionValue
```

---

## 表单组件示例

### 正确示例：UserForm 组件

```json
{
  "name": "UserForm",
  "props": {
    "initialValues": { "type": "Object", "default": {} },
    "onSubmit": { "type": "Function", "required": false }
  },
  "state": {
    "form": { "type": "reactive", "initial": { "name": "", "email": "", "age": 0 } },
    "errors": { "type": "reactive", "initial": {} },
    "submitting": { "type": "ref", "initial": false }
  },
  "computed": {
    "isValid": {
      "getter": "{{!ref_state_errors.name && !ref_state_errors.email && ref_state_form.name && ref_state_form.email}}"
    },
    "canSubmit": {
      "getter": "{{ref_computed_isValid && !ref_state_submitting}}"
    }
  },
  "methods": {
    "validate": {
      "_type": "function",
      "params": {},
      "body": "state.errors.name = state.form.name ? '' : 'Name required'; state.errors.email = state.form.email && state.form.email.includes('@') ? '' : 'Invalid email'"
    },
    "handleSubmit": {
      "_type": "function",
      "params": {},
      "body": "methods.validate(); if (computed.isValid.value) { state.submitting.value = true; (props.onSubmit || coreScope._api.post)('/users', state.form).then(() => { state.submitting.value = false }).catch(err => { state.submitting.value = false; state.errors.submit = err.message }) }"
    },
    "reset": {
      "_type": "function",
      "params": {},
      "body": "state.form.name = ''; state.form.email = ''; state.form.age = 0; state.errors = {}"
    }
  },
  "emits": ["submit", "cancel"],
  "render": {
    "type": "template",
    "content": {
      "type": "a-form",
      "props": {
        "model": { "_type": "expression", "expression": "{{ref_state_form}}" },
        "layout": "vertical"
      },
      "children": [
        {
          "type": "a-form-item",
          "props": { "label": "Name", "required": true },
          "children": [
            {
              "type": "a-input",
              "directives": {
                "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "form", "path": "name" } }
              },
              "props": { "placeholder": "Enter name" }
            },
            {
              "type": "a-alert",
              "directives": {
                "vIf": { "_type": "expression", "expression": "{{ref_state_errors.name}}" }
              },
              "props": { "type": "error", "message": { "_type": "expression", "expression": "{{ref_state_errors.name}}" } }
            }
          ]
        },
        {
          "type": "a-form-item",
          "props": { "label": "Email", "required": true },
          "children": [
            {
              "type": "a-input",
              "directives": {
                "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "form", "path": "email" } }
              },
              "props": { "type": "email", "placeholder": "Enter email" }
            }
          ]
        },
        {
          "type": "a-form-item",
          "props": { "label": "Age" },
          "children": {
            "type": "a-input-number",
            "directives": {
              "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "form", "path": "age" } }
            },
            "props": { "min": 0, "max": 150 }
          }
        },
        {
          "type": "a-space",
          "children": [
            {
              "type": "a-button",
              "props": { "type": "primary", "loading": { "_type": "expression", "expression": "{{ref_state_submitting}}" }, "disabled": { "_type": "expression", "expression": "{{!ref_computed_canSubmit}}" } },
              "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.handleSubmit()" } } },
              "children": "Submit"
            },
            {
              "type": "a-button",
              "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.reset(); emit('cancel')" } } },
              "children": "Reset"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 列表组件示例

### 正确示例：TodoList 组件

```json
{
  "name": "TodoList",
  "state": {
    "todos": { "type": "ref", "initial": [] },
    "newTodo": { "type": "ref", "initial": "" },
    "filter": { "type": "ref", "initial": "all" }
  },
  "computed": {
    "filteredTodos": {
      "getter": "{{ref_state_todos.filter(todo => ref_state_filter === 'all' || (ref_state_filter === 'active' && !todo.completed) || (ref_state_filter === 'completed' && todo.completed))}}"
    },
    "activeCount": {
      "getter": "{{ref_state_todos.filter(todo => !todo.completed).length}}"
    },
    "completedCount": {
      "getter": "{{ref_state_todos.filter(todo => todo.completed).length}}"
    }
  },
  "methods": {
    "addTodo": {
      "_type": "function",
      "params": {},
      "body": "if (state.newTodo.value.trim()) { state.todos.value.push({ id: Date.now(), text: state.newTodo.value.trim(), completed: false }); state.newTodo.value = '' }"
    },
    "removeTodo": {
      "_type": "function",
      "params": { "id": "" },
      "body": "state.todos.value = state.todos.value.filter(todo => todo.id !== id)"
    },
    "toggleTodo": {
      "_type": "function",
      "params": { "id": "" },
      "body": "const todo = state.todos.value.find(t => t.id === id); if (todo) { todo.completed = !todo.completed }"
    },
    "clearCompleted": {
      "_type": "function",
      "params": {},
      "body": "state.todos.value = state.todos.value.filter(todo => !todo.completed)"
    },
    "setFilter": {
      "_type": "function",
      "params": { "filter": "" },
      "body": "state.filter.value = filter"
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "props": { "class": "todo-list" },
      "children": [
        {
          "type": "div",
          "props": { "class": "todo-input" },
          "children": [
            {
              "type": "a-input",
              "directives": {
                "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "newTodo" } }
              },
              "props": { "placeholder": "Add new todo" }
            },
            {
              "type": "a-button",
              "directives": {
                "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.addTodo()" } }
              },
              "children": "Add"
            }
          ]
        },
        {
          "type": "a-space",
          "props": { "class": "filters" },
          "children": [
            {
              "type": "a-button",
              "props": { "type": { "_type": "expression", "expression": "{{ref_state_filter === 'all' ? 'primary' : 'default'}}" } },
              "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.setFilter('all')" } } },
              "children": "All"
            },
            {
              "type": "a-button",
              "props": { "type": { "_type": "expression", "expression": "{{ref_state_filter === 'active' ? 'primary' : 'default'}}" } },
              "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.setFilter('active')" } } },
              "children": "Active"
            },
            {
              "type": "a-button",
              "props": { "type": { "_type": "expression", "expression": "{{ref_state_filter === 'completed' ? 'primary' : 'default'}}" } },
              "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.setFilter('completed')" } } },
              "children": "Completed"
            }
          ]
        },
        {
          "type": "a-list",
          "props": {
            "dataSource": { "_type": "expression", "expression": "{{ref_computed_filteredTodos}}" },
            "itemLayout": "horizontal"
          },
          "children": [
            {
              "type": "template",
              "directives": {
                "vSlot": { "props": ["item"] }
              },
              "children": {
                "type": "a-list-item",
                "children": [
                  {
                    "type": "a-checkbox",
                    "props": { "checked": { "_type": "expression", "expression": "{{item.completed}}" } },
                    "directives": {
                      "vOn": { "change": { "_type": "function", "params": {}, "body": "methods.toggleTodo(item.id)" } }
                    }
                  },
                  {
                    "type": "span",
                    "directives": {
                      "vBind": {
                        "style": { "_type": "expression", "expression": "{{ { textDecoration: item.completed ? 'line-through' : 'none' } }}" }
                      }
                    },
                    "children": { "_type": "expression", "expression": "{{item.text}}" }
                  },
                  {
                    "type": "a-button",
                    "props": { "type": "text", "danger": true },
                    "directives": {
                      "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.removeTodo(item.id)" } }
                    },
                    "children": "Delete"
                  }
                ]
              }
            }
          ]
        },
        {
          "type": "div",
          "directives": {
            "vIf": { "_type": "expression", "expression": "{{ref_computed_completedCount > 0}}" }
          },
          "children": [
            {
              "type": "span",
              "children": { "_type": "expression", "expression": "{{ref_computed_activeCount + ' items left'}}" }
            },
            {
              "type": "a-button",
              "directives": {
                "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.clearCompleted()" } }
              },
              "children": "Clear completed"
            }
          ]
        }
      ]
    }
  }
}
```

---

## API 集成示例

### 正确示例：UserTable 组件（使用插件）

```json
{
  "name": "UserTable",
  "state": {
    "users": { "type": "ref", "initial": [] },
    "loading": { "type": "ref", "initial": false },
    "pagination": { "type": "reactive", "initial": { "current": 1, "pageSize": 10, "total": 0 } },
    "searchText": { "type": "ref", "initial": "" }
  },
  "computed": {
    "tableLoading": { "getter": "{{ref_state_loading}}" },
    "columns": {
      "getter": "{{[ { title: 'ID', dataIndex: 'id' }, { title: 'Name', dataIndex: 'name' }, { title: 'Email', dataIndex: 'email' }, { title: 'Actions', key: 'actions' } ]}}"
    }
  },
  "methods": {
    "loadUsers": {
      "_type": "function",
      "params": {},
      "body": "state.loading.value = true; coreScope._api.get('/users', { params: { page: state.pagination.current, pageSize: state.pagination.pageSize, search: state.searchText.value } }).then(res => { state.users.value = res.data.list; state.pagination.total = res.data.total; state.loading.value = false }).catch(err => { state.loading.value = false; console.error(err) })"
    },
    "handleSearch": {
      "_type": "function",
      "params": { "value": "" },
      "body": "state.searchText.value = value; state.pagination.current = 1; methods.loadUsers()"
    },
    "handlePageChange": {
      "_type": "function",
      "params": { "page": "", "pageSize": "" },
      "body": "state.pagination.current = page; state.pagination.pageSize = pageSize; methods.loadUsers()"
    },
    "deleteUser": {
      "_type": "function",
      "params": { "id": "" },
      "body": "coreScope._api.delete(`/users/${id}`).then(() => { methods.loadUsers() })"
    },
    "editUser": {
      "_type": "function",
      "params": { "id": "" },
      "body": "coreScope._router.push(`/users/${id}/edit`)"
    }
  },
  "lifecycle": {
    "onMounted": { "_type": "function", "params": {}, "body": "methods.loadUsers()" }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "children": [
        {
          "type": "a-input-search",
          "props": {
            "placeholder": "Search users",
            "style": { "type": "object", "body": "{{{ \"width\": \"200px\", \"marginBottom\": \"16px\" }}}" }
          },
          "directives": {
            "vOn": { "search": { "_type": "function", "params": { "value": "" }, "body": "methods.handleSearch(value)" } }
          }
        },
        {
          "type": "a-table",
          "props": {
            "dataSource": { "_type": "expression", "expression": "{{ref_state_users}}" },
            "columns": { "_type": "expression", "expression": "{{ref_computed_columns}}" },
            "loading": { "_type": "expression", "expression": "{{ref_state_loading}}" },
            "pagination": { "_type": "expression", "expression": "{{ref_state_pagination}}" },
            "rowKey": "id"
          },
          "children": [
            {
              "type": "template",
              "directives": { "vSlot": { "name": { "_type": "expression", "expression": "'actions'" }, "props": ["record"] } },
              "children": {
                "type": "a-space",
                "children": [
                  {
                    "type": "a-button",
                    "props": { "type": "link" },
                    "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.editUser(record.id)" } } },
                    "children": "Edit"
                  },
                  {
                    "type": "a-popconfirm",
                    "props": {
                      "title": "Delete this user?",
                      "onConfirm": { "_type": "function", "params": {}, "body": "methods.deleteUser(record.id)" }
                    },
                    "children": {
                      "type": "a-button",
                      "props": { "type": "link", "danger": true },
                      "children": "Delete"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
}
```

### 错误示例对比

```json
// 错误：插件未注册
{
  "methods": {
    "loadUsers": {
      "_type": "function",
      "params": {},
      "body": "coreScope._api.get('/users')"  // ❌ axiosPlugin 未注册
    }
  }
}
// ❌ 规则 P01, R17 违反

// 错误：Scope 引用语法错误
{
  "computed": {
    "currentPath": { "getter": "{{$_core_router.getCurrentRoute()}}" }
  }
}
// ❌ 规则 R14 违反：应为 {{$_core_router.getCurrentRoute()}}
```

---

## 常见错误汇总

### Schema 结构错误

| 错误类型 | 错误示例 | 正确示例 | 规则 |
|----------|----------|----------|------|
| 缺少 name | `{ "render": {...} }` | `{ "name": "Comp", "render": {...} }` | S01 |
| 缺少 render | `{ "name": "Comp" }` | `{ "name": "Comp", "render": {...} }` | S02 |
| ref initial 类型错误 | `{ "type": "ref", "initial": {} }` | `{ "type": "ref", "initial": 0 }` | S06 |
| reactive initial 类型错误 | `{ "type": "reactive", "initial": 0 }` | `{ "type": "reactive", "initial": {} }` | S07 |
| computed 缺少 getter | `{ "doubled": {} }` | `{ "doubled": { "getter": "{{...}}" } }` | S16 |

### 引用语法错误

| 错误类型 | 错误示例 | 正确示例 | 规则 |
|----------|----------|----------|------|
| 直接访问 state | `{{state.count}}` | `{{ref_state_count}}` | R01 |
| 直接访问 props | `{{props.title}}` | `{{ref_props_title}}` | R06 |
| 直接访问 computed | `{{computed.doubled}}` | `{{ref_computed_doubled}}` | R10 |
| Scope 缺少方括号 | `{{$_core_api}}` | `{{$_core_api}}` | R14 |
| 分隔符错误 | `{{ref-state-count}}` | `{{ref_state_count}}` | R01 |

### 函数体错误

| 错误类型 | 错误示例 | 正确示例 | 规则 |
|----------|----------|----------|------|
| ref 缺少 .value | `state.count++` | `state.count.value++` | R03 |
| computed 缺少 .value | `computed.doubled` | `computed.doubled.value` | R12 |
| 修改 props | `props.title = 'new'` | `emit('update:title', 'new')` | R08 |
| 缺少 _type | `{ "body": "..." }` | `{ "_type": "function", "params": {}, "body": "..." }` | S19 |

### 指令错误

| 错误类型 | 错误示例 | 正确示例 | 规则 |
|----------|----------|----------|------|
| vIf 不是 ExpressionValue | `{ "vIf": true }` | `{ "vIf": { "_type": "expression", ... } }` | D01 |
| vElse 不是 true | `{ "vElse": {} }` | `{ "vElse": true }` | D02 |
| vFor 缺少 alias | `{ "vFor": { "source": {...} } }` | `{ "vFor": { "source": {...}, "alias": "item" } }` | D07 |
| vModel prop 不是 ReferenceValue | `{ "vModel": { "prop": "value" } }` | `{ "vModel": { "prop": { "_type": "reference", ... } } }` | D11 |
| vOn 键名格式错误 | `{ "vOn": { "click prevent": {} } }` | `{ "vOn": { "click.prevent": {} } }` | D15 |
| vIf + vFor 同用 | `{ "vIf": {...}, "vFor": {...} }` | 使用嵌套 template | D32 |

---

## 快速检查清单

开发完成后，请检查以下清单：

### Schema 结构
- [ ] `name` 字段存在
- [ ] `render` 字段存在
- [ ] `render.type` 是 'template' 或 'function'
- [ ] state 类型与 initial 值匹配
- [ ] computed 有 getter
- [ ] methods 有 _type、params、body

### 引用语法
- [ ] State 引用使用 `{{ref_state_x}}`
- [ ] Props 引用使用 `{{ref_props_x}}`
- [ ] Computed 引用使用 `{{ref_computed_x}}`
- [ ] Scope 引用使用 `{{$_scope_x}}`
- [ ] 嵌套路径使用 `.` 分隔

### 函数体
- [ ] ref 类型 state 需要 `.value`
- [ ] reactive 类型 state 直接访问
- [ ] computed 需要 `.value`
- [ ] 不修改 props
- [ ] 使用 emit 触发事件

### 指令
- [ ] vIf/vElseIf 是 ExpressionValue
- [ ] vElse 是 true
- [ ] vFor 有 source 和 alias
- [ ] vModel prop 是 ReferenceValue
- [ ] vOn 键名格式正确
- [ ] vIf 和 vFor 不同用

### 插件
- [ ] 使用插件功能前已注册
- [ ] Scope 引用前插件已安装
- [ ] 组件名在 components 字段声明