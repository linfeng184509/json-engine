import { ref, computed } from "vue"
import type { AiSkill, SkillExample } from "../types"
import { PAGE_DESIGNER_SYSTEM_PROMPT } from "./skills/pageDesigner/systemPrompt"
import { PAGE_DESIGNER_EXAMPLES } from "./skills/pageDesigner/examples"
import { ANTD_DESIGN_SPEC_SKILL } from "./skills/antdDesignSpec"

const PAGE_DESIGNER_SKILL: AiSkill = {
  id: "page-designer",
  name: "页面设计",
  description: "生成和优化 JsonVue 前端页面配置，支持列表管理、详情展示、表单录入、树形结构、仪表盘、审批流程等页面类型",
  systemPrompt: PAGE_DESIGNER_SYSTEM_PROMPT,
  tools: [
    "get_supported_components",
    "get_current_design",
    "submit_design_to_session",
    "apply_schema",
    "validate_form"
  ],
  examples: PAGE_DESIGNER_EXAMPLES
}

export const BUILTIN_SKILLS: AiSkill[] = [PAGE_DESIGNER_SKILL, ANTD_DESIGN_SPEC_SKILL]

export function useAiSkills() {
  const skills = ref<Map<string, AiSkill>>(new Map())
  const activeSkillId = ref<string | null>(null)

  const skillList = computed(() => Array.from(skills.value.values()))

  const activeSkill = computed(() => {
    if (!activeSkillId.value) return null
    return skills.value.get(activeSkillId.value) || null
  })

  function register(skill: AiSkill): void {
    skills.value.set(skill.id, skill)
  }

  function unregister(skillId: string): void {
    if (activeSkillId.value === skillId) {
      activeSkillId.value = null
    }
    skills.value.delete(skillId)
  }

  function has(skillId: string): boolean {
    return skills.value.has(skillId)
  }

  function get(skillId: string): AiSkill | undefined {
    return skills.value.get(skillId)
  }

  function load(skillId: string): boolean {
    if (skills.value.has(skillId)) {
      activeSkillId.value = skillId
      return true
    }
    return false
  }

  function unload(): void {
    activeSkillId.value = null
  }

  function getSystemPrompt(): string | undefined {
    return activeSkill.value?.systemPrompt
  }

  function getToolNames(): string[] {
    return activeSkill.value?.tools || []
  }

  function getExamples(): SkillExample[] {
    return activeSkill.value?.examples || []
  }

  function loadBuiltinSkills(): void {
    for (const skill of BUILTIN_SKILLS) {
      register(skill)
    }
  }

  function clear(): void {
    skills.value.clear()
    activeSkillId.value = null
  }

  return {
    skills,
    skillList,
    activeSkillId,
    activeSkill,
    register,
    unregister,
    has,
    get,
    load,
    unload,
    getSystemPrompt,
    getToolNames,
    getExamples,
    loadBuiltinSkills,
    clear
  }
}

export { PAGE_DESIGNER_SKILL, ANTD_DESIGN_SPEC_SKILL }