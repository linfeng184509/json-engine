import { describe, it, expect, beforeEach, vi } from "vitest"
import { useAiTools, BUILTIN_TOOLS } from "../ai/tools"

describe("useAiTools", () => {
  describe("builtin tools", () => {
    it("should have apply_schema tool", () => {
      expect(BUILTIN_TOOLS.find(t => t.name === "apply_schema")).toBeTruthy()
    })

    it("should have validate_form tool", () => {
      expect(BUILTIN_TOOLS.find(t => t.name === "validate_form")).toBeTruthy()
    })

    it("should have query_components tool", () => {
      expect(BUILTIN_TOOLS.find(t => t.name === "query_components")).toBeTruthy()
    })
  })

  describe("registration", () => {
    it("should register a tool", () => {
      const tools = useAiTools()
      const tool = {
        name: "test_tool",
        description: "Test tool",
        parameters: { type: "object" },
        execute: async () => ({ success: true })
      }
      
      tools.register(tool)
      
      expect(tools.has("test_tool")).toBe(true)
    })

    it("should unregister a tool", () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      tools.unregister("apply_schema")
      
      expect(tools.has("apply_schema")).toBe(false)
    })

    it("should load builtin tools", () => {
      const tools = useAiTools()
      
      tools.loadBuiltinTools()
      
      expect(tools.has("apply_schema")).toBe(true)
      expect(tools.has("validate_form")).toBe(true)
      expect(tools.has("query_components")).toBe(true)
    })
  })

  describe("execution", () => {
    it("should execute apply_schema tool", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const result = await tools.execute("apply_schema", {
        schema: { name: "TestForm", render: { type: "AForm" } }
      })
      
      expect(result.success).toBe(true)
    })

    it("should execute validate_form tool with valid schema", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const result = await tools.execute("validate_form", {
        schema: { render: { type: "AForm" } }
      })
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ valid: true })
    })

    it("should execute validate_form tool with invalid schema", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const result = await tools.execute("validate_form", {
        schema: { name: "InvalidForm" }
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toContain("render")
    })

    it("should submit validation error to session when context provided", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const addToSession = vi.fn()
      tools.setToolContext({
        getDesignTree: () => null,
        getApiList: () => [],
        addToSession,
        formName: "Test"
      })
      
      const result = await tools.execute("validate_form", {
        schema: { name: "InvalidForm" }
      })
      
      expect(result.success).toBe(false)
      expect(addToSession).toHaveBeenCalled()
      expect(addToSession.mock.calls[0][0]).toContain("Validation Error")
    })

    it("should validate schema with JSON Schema validation", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const validSchema = {
        name: "TestForm",
        render: {
          type: "AForm",
          props: { layout: "vertical" },
          children: [
            { type: "AFormItem", props: { label: "Name" }, children: [{ type: "AInput" }] }
          ]
        },
        state: { formData: {} }
      }
      
      const result = await tools.execute("validate_form", { schema: validSchema })
      expect(result.success).toBe(true)
    })

    it("should execute query_components tool", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const result = await tools.execute("query_components", {})
      
      expect(result.success).toBe(true)
      const data = result.data as { components: Array<{ name: string }> }
      expect(data.components.length).toBeGreaterThan(0)
      expect(data.components.find(c => c.name === "AForm")).toBeTruthy()
    })

    it("should filter components by name", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const result = await tools.execute("query_components", { filter: "Input" })
      
      expect(result.success).toBe(true)
      const data = result.data as { components: Array<{ name: string }> }
      expect(data.components.every(c => c.name.toLowerCase().includes("input"))).toBe(true)
    })

    it("should return error for unknown tool", async () => {
      const tools = useAiTools()
      
      const result = await tools.execute("unknown_tool", {})
      
      expect(result.success).toBe(false)
      expect(result.error).toContain("not found")
    })
  })

  describe("toSdkTools", () => {
    it("should convert tool names to SDK format", () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const sdkTools = tools.toSdkTools(["apply_schema", "validate_form"])
      
      expect(sdkTools).toEqual({
        apply_schema: true,
        validate_form: true
      })
    })

    it("should convert all tools when no names provided", () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const sdkTools = tools.toSdkTools()
      
      expect(sdkTools.apply_schema).toBe(true)
      expect(sdkTools.validate_form).toBe(true)
      expect(sdkTools.query_components).toBe(true)
    })
  })

  describe("apply schema handler", () => {
    it("should call handler when apply_schema succeeds", async () => {
      const tools = useAiTools()
      tools.loadBuiltinTools()
      
      const handler = vi.fn()
      tools.setApplySchemaHandler(handler)
      
      const schema = { name: "TestForm", render: { type: "AForm" } }
      await tools.execute("apply_schema", { schema })
      
      expect(handler).toHaveBeenCalledWith(schema)
    })
  })
})

import { vi } from "vitest"