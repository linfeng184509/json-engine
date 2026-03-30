# ECharts 插件使用指南

## 安装

```bash
npm install echarts
```

## 快速开始

### 1. 基础柱状图

```json
{
  "name": "BarChart",
  "render": {
    "type": "template",
    "content": {
      "type": "ECharts",
      "props": {
        "option": {
          "type": "echarts-option",
          "body": {
            "xAxis": {
              "type": "category",
              "data": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
            },
            "yAxis": {
              "type": "value"
            },
            "series": [
              {
                "type": "bar",
                "data": [120, 200, 150, 80, 70, 110, 130]
              }
            ],
            "tooltip": {
              "trigger": "axis"
            }
          }
        },
        "height": 300,
        "autoResize": true
      }
    }
  }
}
```

### 2. 响应式数据绑定

```json
{
  "name": "ReactiveChart",
  "state": {
    "chartData": {
      "type": "ref",
      "initial": [120, 200, 150, 80, 70, 110, 130]
    }
  },
  "methods": {
    "updateData": {
      "type": "function",
      "params": "{{{}}}",
      "body": "{{ref_state_chartData = [100, 150, 200, 120, 90, 160, 180]}}"
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "children": [
        {
          "type": "ECharts",
          "props": {
            "option": {
              "type": "echarts-option",
              "body": {
                "xAxis": {
                  "type": "category",
                  "data": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
                },
                "yAxis": {
                  "type": "value"
                },
                "series": [
                  {
                    "type": "bar",
                    "data": "{{ref_state_chartData}}"
                  }
                ]
              }
            },
            "height": 300,
            "autoResize": true
          }
        },
        {
          "type": "AButton",
          "directives": {
            "vOn": {
              "click": {
                "type": "function",
                "params": "{{{}}}",
                "body": "{{methods.updateData()}}"
              }
            }
          },
          "children": ["更新数据"]
        }
      ]
    }
  }
}
```

### 3. 饼图示例

```json
{
  "name": "PieChart",
  "state": {
    "pieData": {
      "type": "ref",
      "initial": [
        { "value": 1048, "name": "搜索引擎" },
        { "value": 735, "name": "直接访问" },
        { "value": 580, "name": "邮件营销" },
        { "value": 484, "name": "联盟广告" }
      ]
    }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "ECharts",
      "props": {
        "option": {
          "type": "echarts-option",
          "body": {
            "tooltip": {
              "trigger": "item"
            },
            "legend": {
              "orient": "vertical",
              "left": "left"
            },
            "series": [
              {
                "type": "pie",
                "radius": "60%",
                "data": "{{ref_state_pieData}}",
                "emphasis": {
                  "itemStyle": {
                    "shadowBlur": 10,
                    "shadowOffsetX": 0,
                    "shadowColor": "rgba(0, 0, 0, 0.5)"
                  }
                }
              }
            ]
          }
        },
        "height": 400
      }
    }
  }
}
```

## API 参考

### ECharts 组件 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `option` | `EChartsOption` | - | **必填**。ECharts 配置对象 |
| `autoResize` | `boolean` | `false` | 是否启用容器大小自适应 |
| `theme` | `string \| object` | `undefined` | 图表主题，可以是 `'dark'` 或 `'light'` 或自定义主题对象 |
| `loading` | `boolean` | `false` | 是否显示加载动画 |
| `width` | `string \| number` | `undefined` | 图表宽度，如 `600` 或 `"100%"` |
| `height` | `string \| number` | `"400px"` | 图表高度，如 `300` 或 `"100%"` |

### echarts-option 类型

在 JSON Schema 中使用 `type: 'echarts-option'` 来声明 ECharts 配置：

```json
{
  "type": "echarts-option",
  "body": {
    // ECharts 完整配置对象
    // 参考：https://echarts.apache.org/zh/option.html
  }
}
```

### 支持的表达式引用

在 `body` 中可以使用以下表达式引用动态数据：

- State 引用：`{{ref_state_xxx}}`
- Props 引用：`{{ref_props_xxx}}`
- Computed 引用：`{{ref_computed_xxx}}`

```json
{
  "type": "echarts-option",
  "body": {
    "series": [
      {
        "type": "bar",
        "data": "{{ref_state_chartData}}"
      }
    ]
  }
}
```

## 响应式更新

当绑定的 `state` 数据变化时，图表会自动调用 `setOption()` 更新。为了避免频繁更新，系统内置了 300ms 的防抖延迟。

## 自动大小调整

启用 `autoResize: true` 后，图表会监听容器大小变化并自动调用 `resize()`。注意：需要确保容器有明确的尺寸。

```json
{
  "type": "ECharts",
  "props": {
    "option": { ... },
    "autoResize": true,
    "height": 300
  }
}
```

## 主题

支持内置主题和自定义主题：

### 内置主题

```json
{
  "type": "ECharts",
  "props": {
    "option": { ... },
    "theme": "dark"
  }
}
```

### 自定义主题

```json
{
  "type": "ECharts",
  "props": {
    "option": { ... },
    "theme": {
      "color": ["#5470c6", "#91cc75", "#fac858"],
      "backgroundColor": "#f4f4f4"
    }
  }
}
```

## 完整示例

查看 `src/packages/enterprise-admin/public/schemas/pages/charts.json` 获取完整的示例代码。

## 注意事项

1. **必须安装 echarts**: `npm install echarts`
2. **ECharts 版本**: 推荐使用 ECharts 5.x
3. **容器尺寸**: 必须为图表容器设置明确的宽度和高度
4. **内存管理**: 组件卸载时会自动销毁图表实例
5. **浏览器兼容性**: `autoResize` 功能需要 `ResizeObserver` API（现代浏览器支持）

## 参考资料

- [ECharts 官方文档](https://echarts.apache.org/zh/index.html)
- [ECharts 配置项手册](https://echarts.apache.org/zh/option.html)
- [ECharts 示例库](https://echarts.apache.org/examples/zh/index.html)
