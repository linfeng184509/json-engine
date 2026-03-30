import { describe, it, expect, beforeEach, vi } from "vitest"
import { useAiSession, resetSessionInstance } from "../ai/session"

const STORAGE_KEY = "ai-designer-sessions"

describe("useAiSession", () => {
  beforeEach(() => {
    localStorage.clear()
    resetSessionInstance()
  })

  describe("session creation", () => {
    it("should create a new session", () => {
      const session = useAiSession()
      const newSession = session.createSession("Test Session")
      
      expect(newSession.title).toBe("Test Session")
      expect(newSession.messages).toEqual([])
      expect(session.currentSessionId.value).toBe(newSession.id)
    })

    it("should create session with default title", () => {
      const session = useAiSession()
      const newSession = session.createSession()
      
      expect(newSession.title).toBe("新会话")
    })
  })

  describe("session persistence", () => {
    it("should persist session to localStorage", () => {
      const session = useAiSession()
      session.createSession("Persistent Session")
      
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.sessions).toHaveLength(1)
      expect(parsed.sessions[0].title).toBe("Persistent Session")
    })

    it("should restore sessions from localStorage", () => {
      const data = {
        currentSessionId: "test-id",
        globalModel: null,
        sessions: [{
          id: "test-id",
          title: "Restored Session",
          messages: [],
          activeSkill: null,
          model: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      
      const session = useAiSession()
      expect(session.sessions.value).toHaveLength(1)
      expect(session.currentSession.value?.title).toBe("Restored Session")
    })
  })

  describe("message handling", () => {
    it("should add message to current session", () => {
      const session = useAiSession()
      session.createSession()
      
      session.addMessage({ role: "user", content: "Hello", timestamp: Date.now() })
      
      expect(session.messages.value).toHaveLength(1)
      expect(session.messages.value[0].content).toBe("Hello")
    })

    it("should auto-generate title from first user message", () => {
      const session = useAiSession()
      session.createSession()
      
      const longMessage = "This is a very long message that should be truncated to exactly fifty characters for the title"
      session.addMessage({ role: "user", content: longMessage, timestamp: Date.now() })
      
      expect(session.currentSession.value?.title).toBe(longMessage.slice(0, 50))
      expect(session.currentSession.value?.title?.length).toBe(50)
    })

    it("should create session automatically when adding message without active session", () => {
      const session = useAiSession()
      
      session.addMessage({ role: "user", content: "Hello", timestamp: Date.now() })
      
      expect(session.currentSessionId.value).toBeTruthy()
      expect(session.messages.value).toHaveLength(1)
    })
  })

  describe("session management", () => {
    it("should delete session", () => {
      const session = useAiSession()
      const s1 = session.createSession("Session 1")
      const s2 = session.createSession("Session 2")
      
      session.deleteSession(s1.id)
      
      expect(session.sessions.value).toHaveLength(1)
      expect(session.sessions.value[0].id).toBe(s2.id)
    })

    it("should switch to another session after deletion", () => {
      const session = useAiSession()
      const s1 = session.createSession("Session 1")
      session.createSession("Session 2")
      
      session.selectSession(s1.id)
      session.deleteSession(s1.id)
      
      expect(session.currentSessionId.value).not.toBe(s1.id)
    })

    it("should select session", () => {
      const session = useAiSession()
      const s1 = session.createSession("Session 1")
      const s2 = session.createSession("Session 2")
      
      session.selectSession(s1.id)
      
      expect(session.currentSessionId.value).toBe(s1.id)
    })
  })

  describe("model and skill persistence", () => {
    it("should set session model", () => {
      const session = useAiSession()
      session.createSession()
      
      session.setSessionModel({ providerID: "anthropic", modelID: "claude-3" })
      
      expect(session.currentSession.value?.model).toEqual({
        providerID: "anthropic",
        modelID: "claude-3"
      })
    })

    it("should set global model", () => {
      const session = useAiSession()
      
      session.setGlobalModel({ providerID: "openai", modelID: "gpt-4" })
      
      expect(session.globalModel.value).toEqual({
        providerID: "openai",
        modelID: "gpt-4"
      })
    })

    it("should set session skill", () => {
      const session = useAiSession()
      session.createSession()
      
      session.setSessionSkill("form-designer")
      
      expect(session.currentSession.value?.activeSkill).toBe("form-designer")
    })
  })

  describe("connection persistence", () => {
    it("should set and persist server URL", () => {
      const session = useAiSession()
      
      session.setServerUrl("http://localhost:8080")
      
      expect(session.lastServerUrl.value).toBe("http://localhost:8080")
      
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored!)
      expect(parsed.lastServerUrl).toBe("http://localhost:8080")
    })

    it("should set and persist auto connect setting", () => {
      const session = useAiSession()
      
      session.setAutoConnect(true)
      
      expect(session.autoConnect.value).toBe(true)
      
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored!)
      expect(parsed.autoConnect).toBe(true)
    })

    it("should restore server URL and auto connect from localStorage", () => {
      const data = {
        currentSessionId: null,
        globalModel: null,
        lastServerUrl: "http://example.com:4096",
        autoConnect: true,
        sessions: []
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      
      const session = useAiSession()
      expect(session.lastServerUrl.value).toBe("http://example.com:4096")
      expect(session.autoConnect.value).toBe(true)
    })

    it("should have default values for new storage", () => {
      localStorage.clear()
      const session = useAiSession()
      
      expect(session.lastServerUrl.value).toBeNull()
      expect(session.autoConnect.value).toBe(false)
    })

    it("should preserve connection settings when clearing sessions", () => {
      const session = useAiSession()
      session.setServerUrl("http://localhost:3000")
      session.setAutoConnect(true)
      session.createSession("Test")
      
      session.clearAllSessions()
      
      expect(session.lastServerUrl.value).toBe("http://localhost:3000")
      expect(session.autoConnect.value).toBe(true)
      expect(session.sessions.value).toHaveLength(0)
    })
  })
})