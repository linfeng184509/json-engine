import { describe, it, expect } from "vitest"
import { useHistory } from "../composables/useHistory"
import type { DesignNode } from "../types"

describe("useHistory", () => {
  const makeState = (id: string): DesignNode => ({ id, type: "AForm", children: [] })

  it("should support undo and redo", () => {
    const h = useHistory()
    h.pushState(makeState("s1"))
    h.pushState(makeState("s2"))
    expect(h.canUndo()).toBe(true)
    expect(h.canRedo()).toBe(false)

    const prev = h.undo(makeState("current"))
    expect(prev?.id).toBe("s2")
    expect(h.canRedo()).toBe(true)

    const next = h.redo(makeState("back"))
    expect(next?.id).toBe("current")
  })

  it("should clear redo on new push", () => {
    const h = useHistory()
    h.pushState(makeState("s1"))
    h.pushState(makeState("s2"))
    h.undo(makeState("s2"))
    expect(h.canRedo()).toBe(true)
    h.pushState(makeState("s3"))
    expect(h.canRedo()).toBe(false)
  })

  it("should return null when no undo/redo available", () => {
    const h = useHistory()
    expect(h.undo(makeState("s1"))).toBeNull()
    expect(h.redo(makeState("s1"))).toBeNull()
  })

  it("should clear history", () => {
    const h = useHistory()
    h.pushState(makeState("s1"))
    h.clear()
    expect(h.canUndo()).toBe(false)
    expect(h.canRedo()).toBe(false)
  })
})