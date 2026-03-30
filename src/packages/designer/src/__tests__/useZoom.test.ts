import { describe, it, expect } from "vitest"
import { useZoom } from "../composables/useZoom"

describe("useZoom", () => {
  describe("initial state", () => {
    it("should have default scale of 1 (100%)", () => {
      const zoom = useZoom()
      expect(zoom.scale.value).toBe(1)
      expect(zoom.scalePercent.value).toBe(100)
    })

    it("should have zero pan offset initially", () => {
      const zoom = useZoom()
      expect(zoom.panX.value).toBe(0)
      expect(zoom.panY.value).toBe(0)
    })

    it("should not be dragging initially", () => {
      const zoom = useZoom()
      expect(zoom.isDragging.value).toBe(false)
    })
  })

  describe("zoom controls", () => {
    it("should zoom in by step", () => {
      const zoom = useZoom({ step: 0.1 })
      zoom.zoomIn()
      expect(zoom.scale.value).toBe(1.1)
    })

    it("should zoom out by step", () => {
      const zoom = useZoom({ step: 0.1 })
      zoom.zoomIn()
      zoom.zoomOut()
      expect(zoom.scale.value).toBe(1)
    })

    it("should not exceed max zoom", () => {
      const zoom = useZoom({ max: 2, step: 0.1 })
      zoom.setZoom(1.95)
      zoom.zoomIn()
      expect(zoom.scale.value).toBe(2)
    })

    it("should not go below min zoom", () => {
      const zoom = useZoom({ min: 0.5, step: 0.1 })
      zoom.setZoom(0.55)
      zoom.zoomOut()
      expect(zoom.scale.value).toBe(0.5)
    })
  })

  describe("setZoom", () => {
    it("should set zoom to specific value", () => {
      const zoom = useZoom()
      zoom.setZoom(1.5)
      expect(zoom.scale.value).toBe(1.5)
    })

    it("should clamp to min/max", () => {
      const zoom = useZoom({ min: 0.5, max: 2 })
      zoom.setZoom(3)
      expect(zoom.scale.value).toBe(2)
      zoom.setZoom(0.1)
      expect(zoom.scale.value).toBe(0.5)
    })
  })

  describe("scalePercent", () => {
    it("should return percentage value", () => {
      const zoom = useZoom()
      zoom.setZoom(1.5)
      expect(zoom.scalePercent.value).toBe(150)
    })

    it("should set scale from percentage", () => {
      const zoom = useZoom()
      zoom.scalePercent.value = 75
      expect(zoom.scale.value).toBe(0.75)
    })

    it("should clamp percentage values", () => {
      const zoom = useZoom({ min: 0.5, max: 2 })
      zoom.scalePercent.value = 300
      expect(zoom.scale.value).toBe(2)
      zoom.scalePercent.value = 25
      expect(zoom.scale.value).toBe(0.5)
    })
  })

  describe("reset", () => {
    it("should reset all values to defaults", () => {
      const zoom = useZoom()
      zoom.setZoom(1.5)
      zoom.panX.value = 100
      zoom.panY.value = 50
      zoom.reset()
      expect(zoom.scale.value).toBe(1)
      expect(zoom.panX.value).toBe(0)
      expect(zoom.panY.value).toBe(0)
    })
  })

  describe("pan functionality", () => {
    it("should start drag and set isDragging", () => {
      const zoom = useZoom()
      const event = new MouseEvent("mousedown", { clientX: 100, clientY: 200 })
      zoom.startDrag(event)
      expect(zoom.isDragging.value).toBe(true)
    })

    it("should end drag and clear isDragging", () => {
      const zoom = useZoom()
      const event = new MouseEvent("mousedown", { clientX: 100, clientY: 200 })
      zoom.startDrag(event)
      zoom.endDrag()
      expect(zoom.isDragging.value).toBe(false)
    })

    it("should not pan when not dragging", () => {
      const zoom = useZoom()
      const event = new MouseEvent("mousemove", { clientX: 150, clientY: 250 })
      zoom.onDrag(event)
      expect(zoom.panX.value).toBe(0)
      expect(zoom.panY.value).toBe(0)
    })

    it("should calculate pan delta when dragging", () => {
      const zoom = useZoom()
      const startEvent = new MouseEvent("mousedown", { clientX: 100, clientY: 200 })
      zoom.startDrag(startEvent)
      
      const moveEvent = new MouseEvent("mousemove", { clientX: 150, clientY: 300 })
      zoom.onDrag(moveEvent)
      
      expect(zoom.panX.value).toBe(50)
      expect(zoom.panY.value).toBe(100)
    })

    it("should scale pan delta by zoom level", () => {
      const zoom = useZoom()
      zoom.setZoom(2)
      
      const startEvent = new MouseEvent("mousedown", { clientX: 0, clientY: 0 })
      zoom.startDrag(startEvent)
      
      const moveEvent = new MouseEvent("mousemove", { clientX: 100, clientY: 200 })
      zoom.onDrag(moveEvent)
      
      expect(zoom.panX.value).toBe(50)
      expect(zoom.panY.value).toBe(100)
    })
  })

  describe("fitToWidth", () => {
    it("should set scale to fit container width", () => {
      const zoom = useZoom()
      zoom.fitToWidth(500, 1000)
      expect(zoom.scale.value).toBe(0.5)
    })

    it("should reset pan when fitting", () => {
      const zoom = useZoom()
      zoom.panX.value = 100
      zoom.panY.value = 50
      zoom.fitToWidth(500, 1000)
      expect(zoom.panX.value).toBe(0)
      expect(zoom.panY.value).toBe(0)
    })

    it("should clamp scale to min/max", () => {
      const zoom = useZoom({ min: 0.5, max: 2 })
      zoom.fitToWidth(100, 1000)
      expect(zoom.scale.value).toBe(0.5)
      zoom.fitToWidth(3000, 1000)
      expect(zoom.scale.value).toBe(2)
    })
  })
})