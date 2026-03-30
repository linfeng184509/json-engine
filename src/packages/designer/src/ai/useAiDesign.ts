import { ref, shallowRef, computed } from "vue"
import type { AiMessage, AiState, PromptContext, PromptResult, AiModelSelection, ToolContext } from "./types"
import { useAiSession } from "./session"
import { useAiModels } from "./models"
import { useAiHooks } from "./hooks"
import { useAiSkills } from "./skills"
import { useAiTools } from "./tools"
import { PAGE_DESIGNER_SYSTEM_PROMPT } from "./skills/pageDesigner/systemPrompt"

export interface UseAiDesignOptions {
  serverUrl?: string
  autoConnect?: boolean
}

let instanceInitialized = false
const client = shallowRef<any>(null)
const serverSessionId = ref<string | null>(null)
const session = useAiSession()
const models = useAiModels()
const hooks = useAiHooks()
const skills = useAiSkills()
const tools = useAiTools()

const state = ref<AiState>({
  connected: false,
  loading: false,
  error: null,
  modelName: "未连接",
  serverUrl: session.lastServerUrl.value || "http://localhost:4096"
})

const messages = computed(() => session.messages.value)

export function resetAiDesignInstance(): void {
  instanceInitialized = false
  client.value = null
  serverSessionId.value = null
  state.value = {
    connected: false,
    loading: false,
    error: null,
    modelName: "未连接",
    serverUrl: "http://localhost:4096"
  }
}

function initialize() {
  if (instanceInitialized) return
  instanceInitialized = true
  
  skills.loadBuiltinSkills()
  tools.loadBuiltinTools()
  skills.load("page-designer")
}

async function connect(url?: string): Promise<void> {
  const serverUrl = url || state.value.serverUrl
  state.value.serverUrl = serverUrl
  state.value.loading = true
  state.value.error = null
  try {
    const { createOpencodeClient } = await import("@opencode-ai/sdk")
    const c = createOpencodeClient({ baseUrl: serverUrl })
    client.value = c as typeof client.value
    state.value.connected = true
    state.value.loading = false
    
    session.setServerUrl(serverUrl)
    
    await models.fetchModels(c as { config: { providers: () => Promise<{ data: unknown }> } })
    
    await initOrRestoreSession()
    
    state.value.modelName = models.selectedModelInfo.value?.name || "已连接"
  } catch (err: unknown) {
    const e = err as Error
    state.value.error = "无法连接: " + (e.message || "请确认服务器已运行在 " + serverUrl)
    state.value.loading = false
    state.value.connected = false
    hooks.executeError(e)
  }
}

async function initOrRestoreSession(): Promise<void> {
  if (!client.value) return
  
  if (serverSessionId.value) {
    try {
      await client.value.session.get({ path: { id: serverSessionId.value } })
      return
    } catch {
      console.log("[AiDesign] Server session not found, creating new one")
      serverSessionId.value = null
    }
  }
  
  await createServerSession()
}

async function ensureServerSession(): Promise<boolean> {
  if (!client.value) return false
  if (!serverSessionId.value) {
    await createServerSession()
    return !!serverSessionId.value
  }
  
  try {
    await client.value.session.get({ path: { id: serverSessionId.value } })
    return true
  } catch {
    console.log("[AiDesign] Server session expired, recreating...")
    serverSessionId.value = null
    await createServerSession()
    return !!serverSessionId.value
  }
}

async function createServerSession(): Promise<void> {
  if (!client.value) return
  try {
    const result = await client.value.session.create({ body: { title: "Form Design" } })
    serverSessionId.value = result.data.id
    
    if (!session.currentSessionId.value) {
      session.createSession("新会话")
    }
    
    const systemPrompt = skills.getSystemPrompt() || PAGE_DESIGNER_SYSTEM_PROMPT
    await client.value.session.prompt({
      path: { id: serverSessionId.value! },
      body: { noReply: true, parts: [{ type: "text", text: systemPrompt }] }
    })
  } catch (err: unknown) {
    const e = err as Error
    state.value.error = "创建会话失败: " + e.message
    hooks.executeError(e)
  }
}

async function prompt(text: string): Promise<PromptResult> {
  if (!client.value) {
    state.value.error = "请先连接服务器"
    return { success: false, error: new Error("请先连接服务器") }
  }

  if (!await ensureServerSession()) {
    state.value.error = "无法创建服务端会话"
    return { success: false, error: new Error("无法创建服务端会话") }
  }

  const ctx: PromptContext = {
    sessionId: serverSessionId.value,
    text,
    skill: skills.activeSkillId.value,
    model: models.selectedModel.value,
    messages: messages.value
  }

  try {
    await hooks.executeBeforePrompt(ctx)
  } catch (e) {
    return { success: false, error: e as Error }
  }

  const allMessages = messages.value
    .filter(m => m.content || m.formData)
    .map(m => ({
      type: "text" as const,
      text: m.role === "user" ? m.content : `[Assistant]: ${m.content}`
    }))

  state.value.loading = true
  session.addMessage({ role: "user", content: text, timestamp: Date.now() })

  try {
    const toolNames = skills.getToolNames()
    const sdkTools = tools.toSdkTools(toolNames)
    
    const requestBody: Record<string, unknown> = {
      parts: [...allMessages, { type: "text", text }],
      tools: Object.keys(sdkTools).length > 0 ? sdkTools : undefined
    }
    
    const model = models.toSdkModel()
    if (model) {
      requestBody.model = model
    }

    const result = await client.value.session.prompt({
      path: { id: serverSessionId.value },
      body: requestBody
    })

    const response = result.data as {
      parts?: Array<{ type: string; text?: string }>
    }

    let formData: Record<string, unknown> | undefined
    let content = ""

    const textParts = response?.parts?.filter((p: { type: string }) => p.type === "text")
    if (textParts?.length) {
      content = textParts.map((p: { text?: string }) => p.text || "").join("")
    }

    if (!content && !response?.parts?.length) {
      console.warn("[AiDesign] Empty response from server, recreating session and retrying...")
      
      serverSessionId.value = null
      if (!await ensureServerSession()) {
        state.value.error = "服务端会话异常，请重新连接"
        state.value.loading = false
        return { success: false, error: new Error("服务端会话异常") }
      }
      
      const retryResult = await client.value.session.prompt({
        path: { id: serverSessionId.value },
        body: { parts: [{ type: "text", text }], tools: requestBody.tools, model: requestBody.model }
      })
      
      const retryResponse = retryResult.data as {
        parts?: Array<{ type: string; text?: string }>
      }
      
      const retryTextParts = retryResponse?.parts?.filter((p: { type: string }) => p.type === "text")
      if (retryTextParts?.length) {
        content = retryTextParts.map((p: { text?: string }) => p.text || "").join("")
      }
      
      if (!content) {
        state.value.error = "AI 未返回有效响应，请重试"
        state.value.loading = false
        return { success: false, error: new Error("AI 未返回有效响应") }
      }
    }

    if (content) {
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/) || content.match(/{[\s\S]*}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
          if (parsed.render) {
            formData = parsed
          } else if (parsed.type === "AForm" || parsed.type?.startsWith("A")) {
            formData = { render: parsed, state: parsed.state || { formData: {} } }
          }
        } catch (e) { 
          console.warn("[AiDesign] Failed to parse JSON from response:", e)
        }
      }
    }

    // 没有 JSON，请求 AI 返回 JSON
    if (!formData && content) {
      console.log("[AiDesign] No valid JSON found, requesting correction...")
      const correctionPrompt = `你的响应没有包含有效的 JSON 定义。

请返回完整的 JsonVueComponentDef JSON 格式定义，要求：
1. 包含 name, state, render 字段
2. 用 \`\`\`json 代码块包裹
3. render 必须包含完整的组件树

示例格式：
\`\`\`json
{
  "name": "PageName",
  "state": { ... },
  "methods": { ... },
  "render": { "type": "AForm", "children": [...] }
}
\`\`\``

      try {
        const correctionResult = await client.value.session.prompt({
          path: { id: serverSessionId.value },
          body: {
            parts: [{ type: "text", text: correctionPrompt }],
            tools: requestBody.tools,
            model: requestBody.model
          }
        })
        
        const correctionResponse = correctionResult.data as { parts?: Array<{ type: string; text?: string }> }
        const correctionTextParts = correctionResponse?.parts?.filter((p: { type: string }) => p.type === "text")
        
        if (correctionTextParts?.length) {
          content = correctionTextParts.map((p: { text?: string }) => p.text || "").join("")
          const newJsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/) || content.match(/{[\s\S]*}/)
          if (newJsonMatch) {
            try {
              const parsed = JSON.parse(newJsonMatch[1] || newJsonMatch[0])
              if (parsed.render) {
                formData = parsed
              } else if (parsed.type === "AForm" || parsed.type?.startsWith("A")) {
                formData = { render: parsed, state: parsed.state || { formData: {} } }
              }
            } catch (e) {
              console.warn("[AiDesign] Failed to parse correction JSON:", e)
            }
          }
        }
      } catch (e) {
        console.warn("[AiDesign] Correction request failed:", e)
      }
    }

    // 验证 JSON，失败时请求 AI 纠正
    if (formData) {
      const validateResult = await tools.execute('validate_form', { schema: formData })
      if (!validateResult.success) {
        console.log("[AiDesign] Validation failed, requesting correction...")
        
        const correctionPrompt = `JSON 验证失败：

错误信息：
${validateResult.error}

原 JSON：
\`\`\`json
${JSON.stringify(formData, null, 2)}
\`\`\`

请根据错误信息纠正 JSON 并重新返回完整的 JsonVueComponentDef 定义。确保：
1. 包含 name, state, render 字段
2. render 包含有效的组件树
3. 所有组件类型正确（如 AInput, AForm 等）`

        try {
          const correctionResult = await client.value.session.prompt({
            path: { id: serverSessionId.value },
            body: {
              parts: [{ type: "text", text: correctionPrompt }],
              tools: requestBody.tools,
              model: requestBody.model
            }
          })
          
          const correctionResponse = correctionResult.data as { parts?: Array<{ type: string; text?: string }> }
          const correctionTextParts = correctionResponse?.parts?.filter((p: { type: string }) => p.type === "text")
          
          if (correctionTextParts?.length) {
            content = correctionTextParts.map((p: { text?: string }) => p.text || "").join("")
            const newJsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/) || content.match(/{[\s\S]*}/)
            if (newJsonMatch) {
              try {
                const parsed = JSON.parse(newJsonMatch[1] || newJsonMatch[0])
                if (parsed.render) {
                  formData = parsed
                } else if (parsed.type === "AForm" || parsed.type?.startsWith("A")) {
                  formData = { render: parsed, state: parsed.state || { formData: {} } }
                }
                
                // 重新验证纠正后的 JSON
                if (formData) {
                  const retryValidate = await tools.execute('validate_form', { schema: formData })
                  if (!retryValidate.success) {
                    session.addMessage({
                      role: "assistant",
                      content: `验证仍然失败: ${retryValidate.error}\n\n${content}`,
                      timestamp: Date.now()
                    })
                    state.value.loading = false
                    return {
                      success: false,
                      error: new Error(retryValidate.error),
                      content,
                      validationError: retryValidate.error
                    }
                  }
                }
              } catch (e) {
                console.warn("[AiDesign] Failed to parse correction JSON:", e)
              }
            }
          }
        } catch (e) {
          console.warn("[AiDesign] Correction request failed:", e)
        }
      }
    }

    if (content || formData) {
      session.addMessage({
        role: "assistant",
        content,
        timestamp: Date.now(),
        formData
      })
    }

    const promptResult: PromptResult = {
      success: true,
      content,
      formData,
      raw: result
    }

    await hooks.executeAfterPrompt(ctx, promptResult)
    
    state.value.loading = false
    return promptResult

  } catch (err: unknown) {
    const e = err as Error
    state.value.error = e.message
    state.value.loading = false
    session.addMessage({ role: "assistant", content: "错误: " + e.message, timestamp: Date.now() })
    hooks.executeError(e)
    return { success: false, error: e }
  }
}

async function generateForm(description: string): Promise<Record<string, unknown> | null> {
  const result = await prompt(description)
  return result.formData || null
}

async function optimizeForm(currentJson: string): Promise<Record<string, unknown> | null> {
  const result = await prompt("Analyze and optimize this form. Return improved JSON:\n" + currentJson)
  return result.formData || null
}

async function configureProperty(nodeType: string, instruction: string): Promise<Record<string, unknown> | null> {
  const result = await prompt(`For ${nodeType}, generate props: ${instruction}. Return JSON only.`)
  if (result.content) {
    const jsonMatch = result.content.match(/{[\s\S]*}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch { /* ignore */ }
    }
  }
  return null
}

function disconnect(): void {
  client.value = null
  serverSessionId.value = null
  state.value.connected = false
  state.value.modelName = "未连接"
}

function clearMessages(): void {
  session.clearMessages()
}

function createNewSession(): void {
  session.createSession("新会话")
  serverSessionId.value = null
}

function setApplySchemaHandler(handler: (schema: Record<string, unknown>) => void): void {
  tools.setApplySchemaHandler(handler)
}

function setToolContext(ctx: ToolContext): void {
  tools.setToolContext(ctx)
}

async function reloadSkill(): Promise<void> {
  if (!client.value || !state.value.connected) return
  
  serverSessionId.value = null
  await createServerSession()
}

async function tryAutoConnect(): Promise<boolean> {
  if (state.value.connected) return true
  
  const lastUrl = session.lastServerUrl.value
  if (!lastUrl) return false
  
  try {
    await connect(lastUrl)
    return state.value.connected
  } catch {
    return false
  }
}

function getStoredServerUrl(): string | null {
  return session.lastServerUrl.value
}

export function useAiDesign(options: UseAiDesignOptions = {}) {
  initialize()
  
  if (options.serverUrl && !session.lastServerUrl.value) {
    state.value.serverUrl = options.serverUrl
  }
  
  return {
    client,
    serverSessionId,
    state,
    messages,
    session,
    models,
    hooks,
    skills,
    tools,
    connect,
    disconnect,
    prompt,
    generateForm,
    optimizeForm,
    configureProperty,
    clearMessages,
    createNewSession,
    setApplySchemaHandler,
    setToolContext,
    reloadSkill,
    tryAutoConnect,
    getStoredServerUrl
  }
}

export type { AiMessage, AiState, AiModelSelection }