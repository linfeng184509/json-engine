import { describe, it, expect, vi } from "vitest"
import { useAiHooks } from "../ai/hooks"
import type { PromptContext, PromptResult } from "../ai/types"

describe("useAiHooks", () => {
  describe("registration", () => {
    it("should register a hook", () => {
      const hooks = useAiHooks()
      const hook = { onBeforePrompt: vi.fn() }
      
      hooks.register("test", hook)
      
      expect(hooks.has("test")).toBe(true)
      expect(hooks.get("test")).toStrictEqual(hook)
    })

    it("should unregister a hook", () => {
      const hooks = useAiHooks()
      hooks.register("test", { onBeforePrompt: vi.fn() })
      
      hooks.unregister("test")
      
      expect(hooks.has("test")).toBe(false)
    })

    it("should clear all hooks", () => {
      const hooks = useAiHooks()
      hooks.register("a", { onBeforePrompt: vi.fn() })
      hooks.register("b", { onBeforePrompt: vi.fn() })
      
      hooks.clear()
      
      expect(hooks.has("a")).toBe(false)
      expect(hooks.has("b")).toBe(false)
    })
  })

  describe("onBeforePrompt", () => {
    it("should execute onBeforePrompt hooks", async () => {
      const hooks = useAiHooks()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      hooks.register("h1", { onBeforePrompt: fn1 })
      hooks.register("h2", { onBeforePrompt: fn2 })
      
      const ctx: PromptContext = {
        sessionId: "test",
        text: "hello",
        skill: null,
        model: null,
        messages: []
      }
      await hooks.executeBeforePrompt(ctx)
      
      expect(fn1).toHaveBeenCalledWith(ctx)
      expect(fn2).toHaveBeenCalledWith(ctx)
    })

    it("should stop execution if hook throws", async () => {
      const hooks = useAiHooks()
      const fn1 = vi.fn().mockRejectedValue(new Error("stop"))
      const fn2 = vi.fn()
      hooks.register("h1", { onBeforePrompt: fn1 })
      hooks.register("h2", { onBeforePrompt: fn2 })
      
      const ctx: PromptContext = {
        sessionId: "test",
        text: "hello",
        skill: null,
        model: null,
        messages: []
      }
      
      await expect(hooks.executeBeforePrompt(ctx)).rejects.toThrow("stop")
    })
  })

  describe("onAfterPrompt", () => {
    it("should execute onAfterPrompt hooks", async () => {
      const hooks = useAiHooks()
      const fn = vi.fn()
      hooks.register("test", { onAfterPrompt: fn })
      
      const ctx: PromptContext = {
        sessionId: "test",
        text: "hello",
        skill: null,
        model: null,
        messages: []
      }
      const result: PromptResult = { success: true, content: "response" }
      
      await hooks.executeAfterPrompt(ctx, result)
      
      expect(fn).toHaveBeenCalledWith(ctx, result)
    })
  })

  describe("onStreamChunk", () => {
    it("should execute onStreamChunk hooks", () => {
      const hooks = useAiHooks()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      hooks.register("h1", { onStreamChunk: fn1 })
      hooks.register("h2", { onStreamChunk: fn2 })
      
      hooks.executeStreamChunk("chunk1")
      
      expect(fn1).toHaveBeenCalledWith("chunk1")
      expect(fn2).toHaveBeenCalledWith("chunk1")
    })
  })

  describe("onToolCall", () => {
    it("should execute onToolCall hooks and return first result", async () => {
      const hooks = useAiHooks()
      const fn1 = vi.fn().mockReturnValue(undefined)
      const fn2 = vi.fn().mockResolvedValue({ result: "data" })
      hooks.register("h1", { onToolCall: fn1 })
      hooks.register("h2", { onToolCall: fn2 })
      
      const result = await hooks.executeToolCall("myTool", { arg: "value" })
      
      expect(fn1).toHaveBeenCalledWith("myTool", { arg: "value" })
      expect(fn2).toHaveBeenCalledWith("myTool", { arg: "value" })
      expect(result).toEqual({ result: "data" })
    })
  })

  describe("onError", () => {
    it("should execute onError hooks", () => {
      const hooks = useAiHooks()
      const fn = vi.fn()
      hooks.register("test", { onError: fn })
      
      const error = new Error("test error")
      hooks.executeError(error)
      
      expect(fn).toHaveBeenCalledWith(error)
    })
  })
})