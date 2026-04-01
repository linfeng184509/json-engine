# Directives - 指令系统规则

本文档定义 VNode 指令的使用规则和正确示例。

---

## VNodeDirectives 结构

```typescript
interface VNodeDirectives {
  vIf?: ExpressionValue;
  vElseIf?: ExpressionValue;
  vElse?: true;
  vShow?: ExpressionValue;
  vFor?: {
    source: ExpressionValue;
    alias: string;
    index?: string;
  };
  vModel?: {
    prop: ReferenceValue;              // state 或 props 引用
    event?: string;
    modifiers?: string[];
  };
  vOn?: Record<string, FunctionValue>;
  vBind?: Record<string, ExpressionValue>;
  vSlot?: {
    name?: ExpressionValue;
    props?: string[];
  };
  vHtml?: ExpressionValue;
  vText?: ExpressionValue;
  vOnce?: true;
}
```

---

## 条件渲染指令

### vIf / vElseIf / vElse

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D01** | `vIf` 值必须是 `ExpressionValue`，结果必须是 boolean |
| **D02** | `vElse` 值必须是 `true`（字面量） |
| **D03** | `vElseIf` 必须紧跟在 `vIf` 或另一个 `vElseIf` 后 |
| **D04** | `vElse` 必须是条件链最后一个 |

**正确示例**:

```json
{
  "type": "div",
  "children": [
    {
      "type": "p",
      "directives": {
        "vIf": { "_type": "expression", "expression": "{{ref_state_isVisible}}" }
      },
      "children": "Visible content"
    },
    {
      "type": "p",
      "directives": {
        "vElseIf": { "_type": "expression", "expression": "{{ref_state_isLoading}}" }
      },
      "children": "Loading..."
    },
    {
      "type": "p",
      "directives": {
        "vElse": true
      },
      "children": "Hidden content"
    }
  ]
}
```

**错误示例**:

```json
// 错误 - 规则 D01 违反：vIf 不是 ExpressionValue
{
  "type": "div",
  "directives": {
    "vIf": true  // ❌ 应为 ExpressionValue
  }
}

// 错误 - 规则 D02 违反：vElse 不是 true
{
  "type": "div",
  "directives": {
    "vElse": { "_type": "expression", "expression": "{{ref_state_condition}}" }  // ❌ vElse 只能是 true
  }
}
```

---

### vShow

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D05** | `vShow` 值必须是 `ExpressionValue` |
| **D06** | `vShow` 通过 CSS `display` 控制，元素始终渲染 |

**正确示例**:

```json
{
  "type": "div",
  "directives": {
    "vShow": { "_type": "expression", "expression": "{{ref_state_isExpanded}}" }
  },
  "children": "Toggleable content"
}
```

---

## 列表渲染指令

### vFor

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D07** | `vFor` 必须有 `source` 和 `alias` |
| **D08** | `source` 必须是 `ExpressionValue`，结果必须是数组或可迭代对象 |
| **D09** | `alias` 是循环变量名，在子节点中直接引用 |
| **D10** | `index` 是可选的索引变量名 |

**正确示例**:

```json
{
  "type": "ul",
  "children": [
    {
      "type": "li",
      "directives": {
        "vFor": {
          "source": { "_type": "expression", "expression": "{{ref_state_items}}" },
          "alias": "item",
          "index": "i"
        }
      },
      "children": [
        { "type": "span", "children": { "_type": "expression", "expression": "{{i + 1}}" } },
        { "type": "span", "children": { "_type": "expression", "expression": "{{item.name}}" } }
      ]
    }
  ]
}
```

**错误示例**:

```json
// 错误 - 规则 D07 违反：缺少 alias
{
  "type": "li",
  "directives": {
    "vFor": {
      "source": { "_type": "expression", "expression": "{{ref_state_items}}" }  // ❌ 缺少 alias
    }
  }
}

// 错误 - 规则 D08 违反：source 不是 ExpressionValue
{
  "type": "li",
  "directives": {
    "vFor": {
      "source": "items",  // ❌ 应为 ExpressionValue
      "alias": "item"
    }
  }
}
```

**vFor 中变量引用规则**:

| 变量类型 | 引用语法 | 说明 |
|----------|----------|------|
| alias | `{{alias.prop}}` | 直接使用 alias 名 |
| index | `{{index}}` | 直接使用 index 名 |
| 父级 state | `{{ref_state_x}}` | 保持标准引用语法 |

---

## 双向绑定指令

### vModel

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D11** | `vModel.prop` 必须是 `state` 或 `props` 的 `ReferenceValue` |
| **D12** | `vModel` 仅用于表单元素（input, select, textarea）或自定义组件 |
| **D13** | `modifiers` 必须是字符串数组，有效值：`trim`, `number`, `lazy` |
| **D14** | 绑定 `props` 时，必须通过 `emit` 更新（单向数据流） |

**正确示例**:

```json
// 基本输入框
{
  "type": "input",
  "props": { "type": "text" },
  "directives": {
    "vModel": {
      "prop": { "_type": "reference", "prefix": "state", "variable": "inputValue" }
    }
  }
}

// 带修饰符
{
  "type": "input",
  "props": { "type": "number" },
  "directives": {
    "vModel": {
      "prop": { "_type": "reference", "prefix": "state", "variable": "age" },
      "modifiers": ["number", "trim"]
    }
  }
}

// 自定义组件
{
  "type": "CustomInput",
  "directives": {
    "vModel": {
      "prop": { "_type": "reference", "prefix": "state", "variable": "value" },
      "event": "update:value"
    }
  }
}
```

**错误示例**:

```json
// 错误 - 规则 D11 违反：prop 不是 ReferenceValue
{
  "type": "input",
  "directives": {
    "vModel": {
      "prop": "value"  // ❌ 应为 ReferenceValue
    }
  }
}

// 错误 - 规则 D13 违反：modifiers 格式错误
{
  "type": "input",
  "directives": {
    "vModel": {
      "prop": { "_type": "reference", "prefix": "state", "variable": "value" },
      "modifiers": "trim"  // ❌ 应为数组
    }
  }
}
```

**表单元素与 vModel 类型匹配**:

| 元素类型 | 绑定值类型 | 事件 |
|----------|------------|------|
| `input[type=text]` | string | `input` |
| `input[type=number]` | number | `input` |
| `input[type=checkbox]` | boolean | `change` |
| `input[type=radio]` | string/number | `change` |
| `select` | string/number/array | `change` |
| `textarea` | string | `input` |

---

## 事件处理指令

### vOn

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D15** | `vOn` 键名格式：`事件名[.修饰符]*` |
| **D16** | `vOn` 值必须是 `FunctionValue` |
| **D17** | 有效修饰符：`stop`, `prevent`, `capture`, `self`, `once`, `pass` |
| **D18** | 键盘事件修饰符：`enter`, `esc`, `space`, `tab`, `up`, `down`, `left`, `right` |

**正确示例**:

```json
// 基本点击事件
{
  "type": "button",
  "directives": {
    "vOn": {
      "click": {
        "_type": "function",
        "params": {},
        "body": "methods.handleClick()"
      }
    }
  },
  "children": "Click"
}

// 带修饰符
{
  "type": "form",
  "directives": {
    "vOn": {
      "submit.prevent": {
        "_type": "function",
        "params": {},
        "body": "methods.handleSubmit()"
      }
    }
  },
  "children": [...]
}

// 事件参数
{
  "type": "button",
  "directives": {
    "vOn": {
      "click": {
        "_type": "function",
        "params": { "event": "MouseEvent" },
        "body": "methods.handleClick(event)"
      }
    }
  }
}

// 键盘事件修饰符
{
  "type": "input",
  "directives": {
    "vOn": {
      "keyup.enter": {
        "_type": "function",
        "params": {},
        "body": "methods.submit()"
      }
    }
  }
}
```

**错误示例**:

```json
// 错误 - 规则 D15 违反：修饰符分隔符错误
{
  "type": "button",
  "directives": {
    "vOn": {
      "click prevent": {  // ❌ 应为 "click.prevent"
        "_type": "function",
        "params": {},
        "body": "..."
      }
    }
  }
}

// 错误 - 规则 D16 违反：值不是 FunctionValue
{
  "type": "button",
  "directives": {
    "vOn": {
      "click": "handleClick"  // ❌ 应为 FunctionValue
    }
  }
}
```

**事件修饰符列表**:

| 修饰符 | 作用 | Vue 原生 |
|--------|------|----------|
| `.stop` | 阻止冒泡 | `event.stopPropagation()` |
| `.prevent` | 阻止默认行为 | `event.preventDefault()` |
| `.capture` | 捕获模式 | `addEventListener('capture')` |
| `.self` | 仅自身触发 | `event.target === element` |
| `.once` | 单次触发 | `addEventListener('once')` |
| `.pass` | passive 模式 | `addEventListener('passive')` |

---

## 属性绑定指令

### vBind

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D19** | `vBind` 值可以是静态值或 `ExpressionValue` |
| **D20** | `vBind` 用于动态属性绑定 |
| **D21** | `class` 绑定支持对象/数组语法 |
| **D22** | `style` 绑定支持对象语法 |

**正确示例**:

```json
// 动态属性
{
  "type": "div",
  "directives": {
    "vBind": {
      "id": { "_type": "expression", "expression": "{{ref_state_elementId}}" },
      "disabled": { "_type": "expression", "expression": "{{ref_state_isDisabled}}" }
    }
  },
  "children": "Content"
}

// class 对象语法
{
  "type": "div",
  "directives": {
    "vBind": {
      "class": { 
        "_type": "expression", 
        "expression": "{{ { active: ref_state_isActive, disabled: ref_state_isDisabled } }}" 
      }
    }
  }
}

// class 数组语法
{
  "type": "div",
  "directives": {
    "vBind": {
      "class": { 
        "_type": "expression", 
        "expression": "{{ [ref_state_baseClass, ref_state_isActive ? 'active' : ''] }}" 
      }
    }
  }
}

// style 对象语法
{
  "type": "div",
  "directives": {
    "vBind": {
      "style": { 
        "_type": "expression", 
        "expression": "{{ { color: ref_state_textColor, fontSize: ref_state_fontSize + 'px' } }}" 
      }
    }
  }
}
```

---

## 内容指令

### vHtml / vText

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D23** | `vHtml` 用于插入 HTML 内容，值必须是 `ExpressionValue` |
| **D24** | `vText` 用于插入文本内容，值必须是 `ExpressionValue` |
| **D25** | `vHtml` 存在 XSS 风险，仅用于可信内容 |
| **D26** | 使用 `vHtml` 或 `vText` 时不应有 `children` |

**正确示例**:

```json
// vHtml
{
  "type": "div",
  "directives": {
    "vHtml": { "_type": "expression", "expression": "{{ref_state_htmlContent}}" }
  }
}

// vText
{
  "type": "p",
  "directives": {
    "vText": { "_type": "expression", "expression": "{{ref_state_message}}" }
  }
}
```

**错误示例**:

```json
// 错误 - 规则 D26 违反：vHtml 与 children 同时存在
{
  "type": "div",
  "directives": {
    "vHtml": { "_type": "expression", "expression": "{{ref_state_html}}" }
  },
  "children": "Text"  // ❌ vHtml 时不应有 children
}
```

---

## 插槽指令

### vSlot

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D27** | `vSlot` 定义插槽内容传递给子组件 |
| **D28** | `name` 指定插槽名称，默认为 `default` |
| **D29** | `props` 指定插槽 prop 名称列表 |

**正确示例**:

```json
// 默认插槽
{
  "type": "template",
  "directives": {
    "vSlot": {}
  },
  "children": { "type": "div", "children": "Default slot content" }
}

// 具名插槽
{
  "type": "template",
  "directives": {
    "vSlot": { "name": { "_type": "expression", "expression": "'header'" } }
  },
  "children": { "type": "h1", "children": "Header" }
}

// 作用域插槽
{
  "type": "template",
  "directives": {
    "vSlot": { "props": ["item", "index"] }
  },
  "children": { 
    "type": "div", 
    "children": { "_type": "expression", "expression": "{{item.name}} ({{index}})" } 
  }
}
```

---

## 其他指令

### vOnce

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D30** | `vOnce` 值必须是 `true` |
| **D31** | 使用 `vOnce` 的元素只渲染一次，后续不更新 |

**正确示例**:

```json
{
  "type": "div",
  "directives": {
    "vOnce": true
  },
  "children": "Static content"
}
```

---

## 指令组合规则

### 多指令组合

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **D32** | `vIf` 和 `vFor` 不应同时使用 |
| **D33** | `vFor` 优先级高于 `vIf`（如需同时，用嵌套） |
| **D34** | `vModel` 可与 `vOn` 组合使用 |

**正确示例**:

```json
// vIf + vFor 组合（通过嵌套）
{
  "type": "div",
  "children": [
    {
      "type": "template",
      "directives": {
        "vIf": { "_type": "expression", "expression": "{{ref_state_shouldRender}}" }
      },
      "children": [
        {
          "type": "li",
          "directives": {
            "vFor": {
              "source": { "_type": "expression", "expression": "{{ref_state_items}}" },
              "alias": "item"
            }
          },
          "children": "{{item.name}}"
        }
      ]
    }
  ]
}

// vModel + vOn 组合
{
  "type": "input",
  "directives": {
    "vModel": {
      "prop": { "_type": "reference", "prefix": "state", "variable": "value" }
    },
    "vOn": {
      "focus": { "_type": "function", "params": {}, "body": "methods.handleFocus()" }
    }
  }
}
```

**错误示例**:

```json
// 错误 - 规则 D32 违反：vIf 和 vFor 同时使用
{
  "type": "li",
  "directives": {
    "vIf": { "_type": "expression", "expression": "{{ref_state_isVisible}}" },
    "vFor": {
      "source": { "_type": "expression", "expression": "{{ref_state_items}}" },
      "alias": "item"
    }
  },
  "children": "{{item.name}}"  // ❌ 不应同时使用
}
```

---

## 规则汇总表

| ID | 指令 | 规则 |
|----|------|------|
| D01 | vIf | 必须是 ExpressionValue (boolean) |
| D02 | vElse | 值必须是 true |
| D03 | vElseIf | 必须紧跟 vIf/vElseIf |
| D04 | vElse | 必须是条件链最后 |
| D05 | vShow | 必须是 ExpressionValue |
| D06 | vShow | CSS display 控制 |
| D07 | vFor | 必须有 source + alias |
| D08 | vFor | source 必须是 ExpressionValue |
| D09 | vFor | alias 直接引用 |
| D10 | vFor | index 可选 |
| D11 | vModel | prop 必须是 ReferenceValue |
| D12 | vModel | 仅用于表单元素 |
| D13 | vModel | modifiers 是数组 |
| D14 | vModel | props 需要 emit |
| D15 | vOn | 键名格式正确 |
| D16 | vOn | 值必须是 FunctionValue |
| D17 | vOn | 有效修饰符 |
| D18 | vOn | 键盘修饰符 |
| D19 | vBind | 静态或 ExpressionValue |
| D20 | vBind | 动态属性 |
| D21 | vBind | class 对象/数组 |
| D22 | vBind | style 对象 |
| D23 | vHtml | ExpressionValue |
| D24 | vText | ExpressionValue |
| D25 | vHtml | XSS 风险警告 |
| D26 | vHtml/vText | 不应有 children |
| D27 | vSlot | 定义插槽 |
| D28 | vSlot | name 默认 default |
| D29 | vSlot | props 列表 |
| D30 | vOnce | 值必须是 true |
| D31 | vOnce | 只渲染一次 |
| D32 | 组合 | vIf + vFor 禁止同用 |
| D33 | 组合 | vFor > vIf 优先级 |
| D34 | 组合 | vModel + vOn 可组合 |