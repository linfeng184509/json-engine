import { ref } from "vue"
import type { AiHook, PromptContext, PromptResult } from "./types"

export function useAiHooks() {
  const hooks = ref<Map<string, AiHook>>(new Map())

  function register(name: string, hook: AiHook): void {
    hooks.value.set(name, hook)
  }

  function unregister(name: string): void {
    hooks.value.delete(name)
  }

  function has(name: string): boolean {
    return hooks.value.has(name)
  }

  function get(name: string): AiHook | undefined {
    return hooks.value.get(name)
  }

  async function executeBeforePrompt(ctx: PromptContext): Promise<void> {
    for (const [, hook] of hooks.value) {
      if (hook.onBeforePrompt) {
        await hook.onBeforePrompt(ctx)
      }
    }
  }

  async function executeAfterPrompt(ctx: PromptContext, result: PromptResult): Promise<void> {
    for (const [, hook] of hooks.value) {
      if (hook.onAfterPrompt) {
        await hook.onAfterPrompt(ctx, result)
      }
    }
  }

  function executeStreamChunk(chunk: string): void {
    for (const [, hook] of hooks.value) {
      if (hook.onStreamChunk) {
        hook.onStreamChunk(chunk)
      }
    }
  }

  async function executeToolCall(name: string, input: unknown): Promise<unknown> {
    for (const [, hook] of hooks.value) {
      if (hook.onToolCall) {
        const result = await hook.onToolCall(name, input)
        if (result !== undefined) {
          return result
        }
      }
    }
    return undefined
  }

  function executeError(error: Error): void {
    for (const [, hook] of hooks.value) {
      if (hook.onError) {
        hook.onError(error)
      }
    }
  }

  function clear(): void {
    hooks.value.clear()
  }

  return {
    hooks,
    register,
    unregister,
    has,
    get,
    executeBeforePrompt,
    executeAfterPrompt,
    executeStreamChunk,
    executeToolCall,
    executeError,
    clear
  }
}