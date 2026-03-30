export interface JSONSchema {
  type?: string
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  description?: string
  $ref?: string
  [key: string]: unknown
}

export interface AiMessage {
  id?: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  formData?: Record<string, unknown>
}

export interface AiState {
  connected: boolean
  loading: boolean
  error: string | null
  modelName: string
  serverUrl: string
}

export interface AiModel {
  id: string
  name: string
  providerID: string
  providerName?: string
  contextWindow?: number
  capabilities?: string[]
}

export interface AiModelSelection {
  providerID: string
  modelID: string
}

export interface StoredSession {
  id: string
  title: string
  messages: AiMessage[]
  activeSkill: string | null
  model: AiModelSelection | null
  createdAt: number
  updatedAt: number
}

export interface StoredSessions {
  currentSessionId: string | null
  globalModel: AiModelSelection | null
  lastServerUrl: string | null
  autoConnect: boolean
  sessions: StoredSession[]
}

export interface PromptContext {
  sessionId: string
  text: string
  skill: string | null
  model: AiModelSelection | null
  messages: AiMessage[]
}

export interface PromptResult {
  success: boolean
  content?: string
  formData?: Record<string, unknown>
  error?: Error
  raw?: unknown
  validationError?: string
}

export interface AiHook {
  onBeforePrompt?: (ctx: PromptContext) => void | Promise<void>
  onAfterPrompt?: (ctx: PromptContext, result: PromptResult) => void | Promise<void>
  onStreamChunk?: (chunk: string) => void
  onToolCall?: (name: string, input: unknown) => unknown | Promise<unknown>
  onError?: (error: Error) => void
}

export interface SkillExample {
  input: string
  output: Record<string, unknown>
  pageType?: 'list' | 'detail' | 'form' | 'tree' | 'dashboard' | 'approval'
  description?: string
}

export interface AiSkill {
  id: string
  name: string
  description: string
  systemPrompt?: string
  tools?: string[]
  examples?: SkillExample[]
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface AiTool {
  name: string
  description: string
  parameters: JSONSchema
  execute: (params: Record<string, unknown>, context?: ToolContext) => Promise<ToolResult>
}

export interface ToolContext {
  getDesignTree: () => Record<string, unknown> | null
  getApiList: () => ApiEndpointDef[]
  addToSession: (content: string, role?: 'user' | 'assistant') => void
  formName: string
}

export interface ApiEndpointDef {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: string
  dataPath?: string
  labelField?: string
  valueField?: string
  description?: string
}

export const STORAGE_KEY = "ai-designer-sessions"

export const MAX_MESSAGES_PER_SESSION = 50

export type JSONSchemaType = JSONSchema