import { describe, it, expect } from "vitest"
import type { AiMessage } from "../ai/types"

describe("Multi-turn context message formatting", () => {
  it("should format user messages without prefix", () => {
    const messages: AiMessage[] = [
      { role: "user", content: "Hello", timestamp: 1000 }
    ]
    
    const formatted = messages.map(m => ({
      type: "text" as const,
      text: m.role === "user" ? m.content : `[Assistant]: ${m.content}`
    }))
    
    expect(formatted).toEqual([
      { type: "text", text: "Hello" }
    ])
  })

  it("should format assistant messages with prefix", () => {
    const messages: AiMessage[] = [
      { role: "assistant", content: "Hi there!", timestamp: 1000 }
    ]
    
    const formatted = messages.map(m => ({
      type: "text" as const,
      text: m.role === "user" ? m.content : `[Assistant]: ${m.content}`
    }))
    
    expect(formatted).toEqual([
      { type: "text", text: "[Assistant]: Hi there!" }
    ])
  })

  it("should build correct parts array with history for multi-turn conversation", () => {
    const messages: AiMessage[] = [
      { role: "user", content: "First question", timestamp: 1000 },
      { role: "assistant", content: "First answer", timestamp: 2000 }
    ]
    const currentText = "Follow up question"
    
    const allMessages = messages.map(m => ({
      type: "text" as const,
      text: m.role === "user" ? m.content : `[Assistant]: ${m.content}`
    }))
    
    const parts = [...allMessages, { type: "text" as const, text: currentText }]
    
    expect(parts).toHaveLength(3)
    expect(parts[0]).toEqual({ type: "text", text: "First question" })
    expect(parts[1]).toEqual({ type: "text", text: "[Assistant]: First answer" })
    expect(parts[2]).toEqual({ type: "text", text: "Follow up question" })
  })

  it("should only have current message for first prompt in session", () => {
    const messages: AiMessage[] = []
    const currentText = "First message"
    
    const allMessages = messages.map(m => ({
      type: "text" as const,
      text: m.role === "user" ? m.content : `[Assistant]: ${m.content}`
    }))
    
    const parts = [...allMessages, { type: "text" as const, text: currentText }]
    
    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual({ type: "text", text: "First message" })
  })

  it("should preserve message order in history", () => {
    const messages: AiMessage[] = [
      { role: "user", content: "Q1", timestamp: 1000 },
      { role: "assistant", content: "A1", timestamp: 2000 },
      { role: "user", content: "Q2", timestamp: 3000 },
      { role: "assistant", content: "A2", timestamp: 4000 }
    ]
    const currentText = "Q3"
    
    const allMessages = messages.map(m => ({
      type: "text" as const,
      text: m.role === "user" ? m.content : `[Assistant]: ${m.content}`
    }))
    
    const parts = [...allMessages, { type: "text" as const, text: currentText }]
    
    expect(parts).toEqual([
      { type: "text", text: "Q1" },
      { type: "text", text: "[Assistant]: A1" },
      { type: "text", text: "Q2" },
      { type: "text", text: "[Assistant]: A2" },
      { type: "text", text: "Q3" }
    ])
  })
})