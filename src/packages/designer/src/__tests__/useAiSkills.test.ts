import { describe, it, expect, beforeEach } from "vitest"
import { useAiSkills, BUILTIN_SKILLS } from "../ai/skills"

describe("useAiSkills", () => {
  describe("builtin skills", () => {
    it("should have page-designer skill", () => {
      const skill = BUILTIN_SKILLS.find(s => s.id === "page-designer")
      expect(skill).toBeTruthy()
      expect(skill?.name).toBe("页面设计")
      expect(skill?.systemPrompt).toBeTruthy()
      expect(skill?.tools).toContain("apply_schema")
    })

    it("should have antd-design-spec skill", () => {
      const skill = BUILTIN_SKILLS.find(s => s.id === "antd-design-spec")
      expect(skill).toBeTruthy()
      expect(skill?.name).toBe("Ant Design 设计规范")
      expect(skill?.systemPrompt).toBeTruthy()
      expect(skill?.tools).toContain("get_supported_components")
    })

    it("should have 2 builtin skills", () => {
      expect(BUILTIN_SKILLS.length).toBe(2)
    })
  })

  describe("registration", () => {
    it("should register a skill", () => {
      const skills = useAiSkills()
      const skill = {
        id: "test-skill",
        name: "Test Skill",
        description: "A test skill"
      }
      
      skills.register(skill)
      
      expect(skills.has("test-skill")).toBe(true)
    })

    it("should unregister a skill", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      
      skills.unregister("page-designer")
      
      expect(skills.has("page-designer")).toBe(false)
    })

    it("should load builtin skills", () => {
      const skills = useAiSkills()
      
      skills.loadBuiltinSkills()
      
      expect(skills.has("page-designer")).toBe(true)
      expect(skills.has("antd-design-spec")).toBe(true)
    })
  })

  describe("activation", () => {
    it("should load page-designer skill", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      
      const result = skills.load("page-designer")
      
      expect(result).toBe(true)
      expect(skills.activeSkillId.value).toBe("page-designer")
    })

    it("should load antd-design-spec skill", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      
      const result = skills.load("antd-design-spec")
      
      expect(result).toBe(true)
      expect(skills.activeSkillId.value).toBe("antd-design-spec")
    })

    it("should return false for unknown skill", () => {
      const skills = useAiSkills()
      
      const result = skills.load("unknown-skill")
      
      expect(result).toBe(false)
    })

    it("should unload skill", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("page-designer")
      
      skills.unload()
      
      expect(skills.activeSkillId.value).toBeNull()
    })

    it("should unregister active skill and clear active", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("page-designer")
      
      skills.unregister("page-designer")
      
      expect(skills.activeSkillId.value).toBeNull()
    })
  })

  describe("skill info", () => {
    it("should get system prompt from page-designer", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("page-designer")
      
      const prompt = skills.getSystemPrompt()
      
      expect(prompt).toBeTruthy()
      expect(prompt).toContain("JsonVue")
    })

    it("should get system prompt from antd-design-spec", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("antd-design-spec")
      
      const prompt = skills.getSystemPrompt()
      
      expect(prompt).toBeTruthy()
      expect(prompt).toContain("Ant Design")
    })

    it("should get tool names from active skill", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("page-designer")
      
      const toolNames = skills.getToolNames()
      
      expect(toolNames).toContain("apply_schema")
      expect(toolNames).toContain("validate_form")
      expect(toolNames).toContain("get_supported_components")
      expect(toolNames).toContain("get_current_design")
      expect(toolNames).toContain("submit_design_to_session")
    })

    it("should get examples from page-designer", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("page-designer")
      
      const examples = skills.getExamples()
      
      expect(examples.length).toBeGreaterThan(0)
      expect(examples[0].input).toBeTruthy()
      expect(examples[0].output).toBeTruthy()
    })

    it("should return empty arrays when no active skill", () => {
      const skills = useAiSkills()
      
      expect(skills.getToolNames()).toEqual([])
      expect(skills.getExamples()).toEqual([])
    })
  })

  describe("computed properties", () => {
    it("should provide skillList with 2 skills", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      
      const list = skills.skillList.value
      
      expect(list.length).toBe(2)
      expect(list.find(s => s.id === "page-designer")).toBeTruthy()
      expect(list.find(s => s.id === "antd-design-spec")).toBeTruthy()
    })

    it("should provide activeSkill", () => {
      const skills = useAiSkills()
      skills.loadBuiltinSkills()
      skills.load("page-designer")
      
      expect(skills.activeSkill.value?.id).toBe("page-designer")
    })
  })
})