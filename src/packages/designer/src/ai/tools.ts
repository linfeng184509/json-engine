import { ref, computed } from "vue"
import type { AiTool, ToolResult, JSONSchema, ToolContext } from "./types"
import { parseSchema } from "@json-engine/vue-json"
import type { VueJsonSchema } from "@json-engine/vue-json"

type VueJsonSchemaInput = string | VueJsonSchema

const APPLY_SCHEMA_TOOL: AiTool = {
  name: "apply_schema",
  description: `Apply page schema to designer canvas. Use this to render the generated page configuration.

IMPORTANT: Always use validate_form BEFORE this tool to catch errors early.

Parameters:
- schema: The VueJsonSchema to apply (must have 'name' and 'render' properties)`,
  parameters: {
    type: "object",
    properties: {
      schema: {
        type: "object",
        description: "The VueJsonSchema schema to apply"
      }
    },
    required: ["schema"]
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    return { success: true, data: params.schema }
  }
}

const VALIDATE_FORM_TOOL: AiTool = {
  name: "validate_form",
  description: `Validate JsonVue schema structure before rendering.

Validates:
1. JSON structure and required properties (name, render)
2. Schema format using VueJsonSchema specification
3. Property types and values

Returns detailed error messages if validation fails.
The errors are automatically sent to the AI session for correction.

IMPORTANT: Use this BEFORE apply_schema to catch issues early.
If validation fails, fix the errors and try again.`,
  parameters: {
    type: "object",
    properties: {
      schema: {
        type: "object",
        description: "The VueJsonSchema schema to validate"
      }
    },
    required: ["schema"]
  },
  execute: async (params: Record<string, unknown>, context?: ToolContext): Promise<ToolResult> => {
    const schema = params.schema as Record<string, unknown> | undefined
    
    if (!schema) {
      const error = "No schema provided"
      if (context?.addToSession) {
        context.addToSession(`[Validation Error] ${error}\n\nPlease provide a valid schema and try again.`, 'user')
      }
      return { success: false, error }
    }
    
    if (!schema.render) {
      const error = "Schema must have 'render' property defining the component tree"
      if (context?.addToSession) {
        context.addToSession(`[Validation Error] ${error}\n\nPlease add a 'render' property with a valid VNodeDefinition structure.`, 'user')
      }
      return { success: false, error }
    }
    
    const result = parseSchema(schema as unknown as VueJsonSchemaInput)
    
    if (!result.success) {
      const errors = result.errors?.map(e => `  - ${e.path || 'root'}: ${e.message}`).join('\n') || 'Unknown parse error'
      const errorMessage = `Schema validation failed:\n${errors}`
      
      if (context?.addToSession) {
        context.addToSession(
          `[Validation Failed]\n${errorMessage}\n\nPlease fix these errors in your schema and try again. Make sure:\n1. All required properties are present\n2. Property types are correct\n3. The schema follows VueJsonSchema specification`,
          'user'
        )
      }
      
      return { success: false, error: errorMessage, data: { errors: result.errors } }
    }
    
    return { success: true, data: { valid: true } }
  }
}

const GET_SUPPORTED_COMPONENTS_TOOL: AiTool = {
  name: "get_supported_components",
  description: `Get all supported components from the designer registry.

Returns:
- Component type name
- Display label
- Category (layout/basic/selection/date/advanced)
- Configurable properties

Use this to understand available components before generating page configuration.`,
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "Filter by category: layout, basic, selection, date, advanced"
      },
      filter: {
        type: "string",
        description: "Filter by component name (partial match)"
      }
    }
  },
  execute: async (params: Record<string, unknown>, _context?: ToolContext): Promise<ToolResult> => {
    const components = [
      { name: "AForm", label: "表单容器", category: "layout", isContainer: true, props: ["layout", "labelCol", "wrapperCol"] },
      { name: "AFormItem", label: "表单项", category: "layout", isContainer: true, props: ["label", "name", "required", "rules"] },
      { name: "ACard", label: "卡片", category: "layout", isContainer: true, props: ["title", "bordered", "size"] },
      { name: "ATabs", label: "标签页", category: "layout", isContainer: true, props: ["activeKey"] },
      { name: "ATabPane", label: "标签页面", category: "layout", isContainer: true, props: ["key", "tab"] },
      { name: "ARow", label: "行布局", category: "layout", isContainer: true, props: ["gutter"] },
      { name: "ACol", label: "列布局", category: "layout", isContainer: true, props: ["span", "offset"] },
      { name: "AInput", label: "文本输入", category: "basic", props: ["value", "placeholder", "disabled", "maxlength"] },
      { name: "AInputPassword", label: "密码输入", category: "basic", props: ["value", "placeholder", "visibilityToggle"] },
      { name: "ATextArea", label: "多行文本", category: "basic", props: ["value", "placeholder", "rows", "maxlength"] },
      { name: "AInputNumber", label: "数字输入", category: "basic", props: ["value", "min", "max", "step", "precision"] },
      { name: "AInputSearch", label: "搜索输入", category: "basic", props: ["value", "placeholder", "onSearch"] },
      { name: "ASelect", label: "下拉选择", category: "selection", props: ["value", "options", "mode", "allowClear", "showSearch"] },
      { name: "ARadioGroup", label: "单选组", category: "selection", props: ["value", "options"] },
      { name: "ACheckbox", label: "复选框", category: "selection", props: ["checked"] },
      { name: "ACheckboxGroup", label: "复选组", category: "selection", props: ["value", "options"] },
      { name: "ASwitch", label: "开关", category: "selection", props: ["checked", "checkedChildren", "unCheckedChildren"] },
      { name: "ACascader", label: "级联选择", category: "selection", props: ["value", "options", "multiple"] },
      { name: "ATreeSelect", label: "树选择", category: "selection", props: ["value", "treeData", "multiple"] },
      { name: "ADatePicker", label: "日期选择", category: "date", props: ["value", "format", "showTime"] },
      { name: "ARangePicker", label: "日期范围", category: "date", props: ["value", "format"] },
      { name: "ATimePicker", label: "时间选择", category: "date", props: ["value", "format"] },
      { name: "AUpload", label: "文件上传", category: "advanced", props: ["action", "multiple", "accept", "maxCount"] },
      { name: "ARate", label: "评分", category: "advanced", props: ["value", "count", "allowHalf"] },
      { name: "ASlider", label: "滑块", category: "advanced", props: ["value", "min", "max", "range"] },
      { name: "ATransfer", label: "穿梭框", category: "advanced", props: ["dataSource", "targetKeys", "titles"] },
      { name: "ATable", label: "数据表格", category: "data", isContainer: false, props: ["columns", "dataSource", "loading", "pagination", "rowSelection"] },
      { name: "ATree", label: "树形控件", category: "data", isContainer: false, props: ["treeData", "selectedKeys", "expandedKeys"] },
      { name: "AList", label: "列表", category: "data", isContainer: true, props: ["dataSource", "loading"] },
      { name: "ADescriptions", label: "描述列表", category: "data", isContainer: true, props: ["column", "bordered", "title"] },
      { name: "AStatistic", label: "统计数值", category: "data", isContainer: false, props: ["title", "value", "suffix", "prefix"] },
      { name: "ATimeline", label: "时间轴", category: "data", isContainer: true, props: ["items", "mode"] },
      { name: "ATag", label: "标签", category: "data", isContainer: false, props: ["color", "closable"] },
      { name: "ABadge", label: "徽标", category: "data", isContainer: false, props: ["count", "dot"] },
      { name: "AButton", label: "按钮", category: "action", props: ["type", "loading", "disabled", "danger", "onClick"] },
      { name: "AModal", label: "模态框", category: "action", isContainer: true, props: ["title", "open", "onOk", "onCancel", "width", "confirmLoading"] },
      { name: "ADrawer", label: "抽屉", category: "action", isContainer: true, props: ["title", "open", "onClose", "width", "placement"] },
      { name: "APopconfirm", label: "气泡确认", category: "action", isContainer: true, props: ["title", "onConfirm", "onCancel"] },
      { name: "APagination", label: "分页", category: "navigation", props: ["current", "pageSize", "total", "onChange"] },
      { name: "ASteps", label: "步骤条", category: "navigation", props: ["current", "items"] },
      { name: "AAlert", label: "警告提示", category: "feedback", props: ["type", "message", "description", "closable"] },
      { name: "ASpin", label: "加载中", category: "feedback", isContainer: true, props: ["spinning", "tip"] },
      { name: "AResult", label: "结果页", category: "feedback", isContainer: true, props: ["status", "title", "subTitle"] }
    ]

    let filtered = components

    if (params.category) {
      filtered = filtered.filter(c => c.category === params.category)
    }

    if (params.filter) {
      const keyword = (params.filter as string).toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.label.toLowerCase().includes(keyword)
      )
    }

    const categories = [...new Set(components.map(c => c.category))]

    return {
      success: true,
      data: {
        categories,
        total: filtered.length,
        components: filtered
      }
    }
  }
}

const GET_CURRENT_DESIGN_TOOL: AiTool = {
  name: "get_current_design",
  description: `Get the current page design from the designer canvas.

Returns VueJsonSchema format with:
- name: Component name
- render: Render tree (VNodeDefinition)
- state: Extracted form state (ref/reactive definitions)
- methods: Extracted methods

Use this to understand the current design state for optimization or modification.`,
  parameters: {
    type: "object",
    properties: {
      includeState: {
        type: "boolean",
        description: "Include auto-extracted state (default: true)"
      },
      format: {
        type: "string",
        enum: ["json", "summary"],
        description: "Output format: json (full) or summary (key metrics)"
      }
    }
  },
  execute: async (params: Record<string, unknown>, context?: ToolContext): Promise<ToolResult> => {
    if (!context?.getDesignTree) {
      return { success: false, error: "Designer not initialized" }
    }

    const tree = context.getDesignTree()
    if (!tree) {
      return { success: false, error: "No design in canvas" }
    }

    const apiList = context.getApiList?.() || []
    const formName = context.formName || "CurrentDesign"

    const includeState = params.includeState !== false
    const format = params.format || "json"

    function extractState(node: Record<string, unknown>, state: Record<string, unknown>): void {
      const props = node.props as Record<string, unknown> | undefined
      if (props) {
        for (const [_key, value] of Object.entries(props)) {
          if (typeof value === "string" && value.startsWith("$state.form.")) {
            const fieldName = value.replace("$state.form.", "").split(".")[0]
            if (!state[fieldName]) {
              state[fieldName] = ""
            }
          }
        }
      }
      const children = node.children as Array<Record<string, unknown>> | undefined
      if (Array.isArray(children)) {
        for (const child of children) {
          extractState(child, state)
        }
      }
    }

    const def: Record<string, unknown> = {
      name: formName,
      render: tree
    }

    if (includeState) {
      const formData: Record<string, unknown> = {}
      extractState(tree, formData)
      def.state = { formData }
    }

    if (format === "summary") {
      return {
        success: true,
        data: {
          name: def.name,
          hasState: !!def.state,
          stateFields: Object.keys((def.state as Record<string, unknown>)?.formData || {}),
          rootType: (tree as Record<string, unknown>)?.type,
          hasApis: apiList.length > 0,
          apiCount: apiList.length
        }
      }
    }

    return { success: true, data: def }
  }
}

const SUBMIT_DESIGN_TO_SESSION_TOOL: AiTool = {
  name: "submit_design_to_session",
  description: `Submit current design to AI session context.

This adds the current page configuration to the conversation,
allowing AI to understand and work with the existing design.

Use for:
1. Getting optimization suggestions
2. Analyzing design issues
3. Making modifications to existing design`,
  parameters: {
    type: "object",
    properties: {
      context: {
        type: "string",
        description: "Optional context description to help AI understand the design"
      },
      request: {
        type: "string",
        description: "Optional request (e.g., 'optimize this design', 'check validation')"
      }
    }
  },
  execute: async (params: Record<string, unknown>, context?: ToolContext): Promise<ToolResult> => {
    if (!context?.getDesignTree || !context?.addToSession) {
      return { success: false, error: "Session or designer not initialized" }
    }

    const tree = context.getDesignTree()
    if (!tree) {
      return { success: false, error: "No design in canvas" }
    }

    const def = {
      name: context.formName || "CurrentDesign",
      render: tree
    }

    const contextText = params.context ? `\n\nContext: ${params.context}` : ""
    const requestText = params.request ? `\n\nRequest: ${params.request}` : ""

    const message = `Current design configuration:${contextText}${requestText}

\`\`\`json
${JSON.stringify(def, null, 2)}
\`\`\``

    context.addToSession(message, 'user')

    return {
      success: true,
      data: {
        submitted: true,
        designName: def.name,
        message: "Design submitted to session"
      }
    }
  }
}

const QUERY_COMPONENTS_TOOL: AiTool = {
  name: "query_components",
  description: "Query available form components and their props. (Deprecated: use get_supported_components)",
  parameters: {
    type: "object",
    properties: {
      filter: {
        type: "string",
        description: "Optional filter for component names"
      }
    }
  },
  execute: async (params: Record<string, unknown>, context?: ToolContext): Promise<ToolResult> => {
    return GET_SUPPORTED_COMPONENTS_TOOL.execute(params, context)
  }
}

export const BUILTIN_TOOLS: AiTool[] = [
  APPLY_SCHEMA_TOOL,
  VALIDATE_FORM_TOOL,
  GET_SUPPORTED_COMPONENTS_TOOL,
  GET_CURRENT_DESIGN_TOOL,
  SUBMIT_DESIGN_TO_SESSION_TOOL,
  QUERY_COMPONENTS_TOOL
]

export function useAiTools() {
  const tools = ref<Map<string, AiTool>>(new Map())
  const toolContext = ref<ToolContext | null>(null)
  const onApplySchema = ref<((schema: Record<string, unknown>) => void) | null>(null)

  const toolList = computed(() => Array.from(tools.value.values()))

  function register(tool: AiTool): void {
    tools.value.set(tool.name, tool)
  }

  function unregister(name: string): void {
    tools.value.delete(name)
  }

  function has(name: string): boolean {
    return tools.value.has(name)
  }

  function get(name: string): AiTool | undefined {
    return tools.value.get(name)
  }

  function getSchema(name: string): JSONSchema | undefined {
    return tools.value.get(name)?.parameters
  }

  function setToolContext(ctx: ToolContext): void {
    toolContext.value = ctx
  }

  function getToolContext(): ToolContext | null {
    return toolContext.value
  }

  async function execute(name: string, params: Record<string, unknown>): Promise<ToolResult> {
    const tool = tools.value.get(name)
    if (!tool) {
      return { success: false, error: `Tool not found: ${name}` }
    }
    try {
      const result = await tool.execute(params, toolContext.value || undefined)
      if (name === "apply_schema" && result.success && onApplySchema.value) {
        onApplySchema.value(params.schema as Record<string, unknown>)
      }
      return result
    } catch (e) {
      const error = e as Error
      return { success: false, error: error.message }
    }
  }

  function toSdkTools(toolNames?: string[]): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    const names = toolNames || Array.from(tools.value.keys())
    for (const name of names) {
      if (tools.value.has(name)) {
        result[name] = true
      }
    }
    return result
  }

  function loadBuiltinTools(): void {
    for (const tool of BUILTIN_TOOLS) {
      register(tool)
    }
  }

  function setApplySchemaHandler(handler: (schema: Record<string, unknown>) => void): void {
    onApplySchema.value = handler
  }

  function clear(): void {
    tools.value.clear()
  }

  return {
    tools,
    toolList,
    register,
    unregister,
    has,
    get,
    getSchema,
    setToolContext,
    getToolContext,
    execute,
    toSdkTools,
    loadBuiltinTools,
    setApplySchemaHandler,
    clear
  }
}