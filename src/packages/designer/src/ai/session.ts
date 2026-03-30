import { ref, computed, type Ref } from "vue"
import type { StoredSessions, StoredSession, AiMessage, AiModelSelection } from "./types"
import { STORAGE_KEY, MAX_MESSAGES_PER_SESSION } from "./types"

function loadFromStorage(): StoredSessions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        currentSessionId: parsed.currentSessionId ?? null,
        globalModel: parsed.globalModel ?? null,
        lastServerUrl: parsed.lastServerUrl ?? null,
        autoConnect: parsed.autoConnect ?? false,
        sessions: parsed.sessions ?? []
      }
    }
  } catch (e) {
    console.warn("[AiSession] Failed to load from localStorage:", e)
  }
  return { currentSessionId: null, globalModel: null, lastServerUrl: null, autoConnect: false, sessions: [] }
}

function saveToStorage(data: StoredSessions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn("[AiSession] Failed to save to localStorage:", e)
  }
}

function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function trimMessages(messages: AiMessage[]): AiMessage[] {
  if (messages.length <= MAX_MESSAGES_PER_SESSION) return messages
  return messages.slice(-MAX_MESSAGES_PER_SESSION)
}

let storageInstance: Ref<StoredSessions> | null = null

function getStorage(): Ref<StoredSessions> {
  if (!storageInstance) {
    storageInstance = ref<StoredSessions>(loadFromStorage())
  }
  return storageInstance
}

export function resetSessionInstance(): void {
  storageInstance = null
}

export function useAiSession() {
  const storage = getStorage()
  
  const currentSessionId = computed(() => storage.value.currentSessionId)
  
  const sessions = computed(() => storage.value.sessions)
  
  const currentSession = computed(() => {
    if (!storage.value.currentSessionId) return null
    return storage.value.sessions.find(s => s.id === storage.value.currentSessionId) || null
  })
  
  const messages = computed(() => currentSession.value?.messages || [])
  
  const globalModel = computed(() => storage.value.globalModel)

  const lastServerUrl = computed(() => storage.value.lastServerUrl)

  const autoConnect = computed(() => storage.value.autoConnect)

  function save(): void {
    saveToStorage(storage.value)
  }

  function createSession(title?: string): StoredSession {
    const session: StoredSession = {
      id: generateId(),
      title: title || "新会话",
      messages: [],
      activeSkill: null,
      model: storage.value.globalModel,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    storage.value.sessions.unshift(session)
    storage.value.currentSessionId = session.id
    save()
    return session
  }

  function deleteSession(sessionId: string): void {
    const index = storage.value.sessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      storage.value.sessions.splice(index, 1)
      if (storage.value.currentSessionId === sessionId) {
        storage.value.currentSessionId = storage.value.sessions[0]?.id || null
      }
      save()
    }
  }

  function selectSession(sessionId: string): void {
    const session = storage.value.sessions.find(s => s.id === sessionId)
    if (session) {
      storage.value.currentSessionId = sessionId
      save()
    }
  }

  function addMessage(message: AiMessage): void {
    if (!storage.value.currentSessionId) {
      createSession()
    }
    const session = storage.value.sessions.find(s => s.id === storage.value.currentSessionId)
    if (session) {
      session.messages.push({
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      })
      session.messages = trimMessages(session.messages)
      session.updatedAt = Date.now()
      if (session.messages.length === 1 && message.role === "user") {
        session.title = message.content.slice(0, 50)
      }
      save()
    }
  }

  function updateMessage(messageId: string, updates: Partial<AiMessage>): void {
    const session = storage.value.sessions.find(s => s.id === storage.value.currentSessionId)
    if (session) {
      const msg = session.messages.find(m => m.id === messageId)
      if (msg) {
        Object.assign(msg, updates)
        save()
      }
    }
  }

  function clearMessages(): void {
    const session = storage.value.sessions.find(s => s.id === storage.value.currentSessionId)
    if (session) {
      session.messages = []
      session.updatedAt = Date.now()
      save()
    }
  }

  function setSessionModel(model: AiModelSelection | null): void {
    const session = storage.value.sessions.find(s => s.id === storage.value.currentSessionId)
    if (session) {
      session.model = model
      save()
    }
  }

  function setGlobalModel(model: AiModelSelection | null): void {
    storage.value.globalModel = model
    save()
  }

  function setServerUrl(url: string | null): void {
    storage.value.lastServerUrl = url
    save()
  }

  function setAutoConnect(enabled: boolean): void {
    storage.value.autoConnect = enabled
    save()
  }

  function setSessionSkill(skillId: string | null): void {
    const session = storage.value.sessions.find(s => s.id === storage.value.currentSessionId)
    if (session) {
      session.activeSkill = skillId
      save()
    }
  }

  function getSession(sessionId: string): StoredSession | undefined {
    return storage.value.sessions.find(s => s.id === sessionId)
  }

  function clearAllSessions(): void {
    storage.value = { 
      currentSessionId: null, 
      globalModel: null, 
      lastServerUrl: storage.value.lastServerUrl,
      autoConnect: storage.value.autoConnect,
      sessions: [] 
    }
    save()
  }

  return {
    currentSessionId,
    sessions,
    currentSession,
    messages,
    globalModel,
    lastServerUrl,
    autoConnect,
    createSession,
    deleteSession,
    selectSession,
    addMessage,
    updateMessage,
    clearMessages,
    setSessionModel,
    setGlobalModel,
    setServerUrl,
    setAutoConnect,
    setSessionSkill,
    getSession,
    clearAllSessions,
    save
  }
}