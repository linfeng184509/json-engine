import { describe, it, expect } from "vitest"
import { generateJsonVueDef } from "../utils/schemaGenerator"
import type { DesignNode } from "../types"
import type { VueJsonSchema, TemplateRenderDefinition } from "@json-engine/vue-json/types"

describe("schemaGenerator", () => {
  it("should generate VueJsonSchema from design tree", () => {
    const tree: DesignNode = {
      id: "root",
      type: "AForm",
      props: { layout: "vertical" },
      children: [
        {
          id: "item1",
          type: "AFormItem",
          props: { label: "Name" },
          children: [{
            id: "input1",
            type: "AInput",
            props: { "v-model:value": "$state.formData.name", placeholder: "Enter name" }
          }]
        }
      ]
    }
    const def = generateJsonVueDef(tree, "MyForm") as VueJsonSchema
    expect(def.name).toBe("MyForm")
    expect(def.render).toBeDefined()
    
    const renderDef = def.render as TemplateRenderDefinition
    expect(renderDef.type).toBe("template")
    
    const content = renderDef.content as { type: string; props?: Record<string, unknown>; children?: unknown[] }
    expect(content.type).toBe("AForm")
    expect(content.props?.layout).toBe("vertical")
    
    const children = content.children as unknown[]
    expect((children[0] as { type: string })?.type).toBe("AFormItem")
  })

  it("should strip designer metadata", () => {
    const tree: DesignNode = {
      id: "root",
      type: "AForm",
      designerMeta: { icon: "F", category: "layout" },
      children: [{
        id: "item1",
        type: "AInput",
        designerMeta: { icon: "E", propEditors: [] }
      }]
    }
    const def = generateJsonVueDef(tree)
    const json = JSON.stringify(def)
    expect(json).not.toContain("designerMeta")
    expect(json).not.toContain('"id"')
  })

  it("should auto-generate state from v-model bindings", () => {
    const tree: DesignNode = {
      id: "root",
      type: "AForm",
      children: [
        { id: "input1", type: "AInput", props: { "v-model:value": "$state.formData.name" } },
        { id: "input2", type: "AInput", props: { "v-model:value": "$state.formData.email" } }
      ]
    }
    const def = generateJsonVueDef(tree) as VueJsonSchema
    expect(def.state).toBeDefined()
    expect(def.state!.formData).toBeDefined()
  })
})
