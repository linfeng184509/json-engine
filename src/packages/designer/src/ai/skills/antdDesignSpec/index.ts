import type { AiSkill } from '../../types'
import { ANTD_DESIGN_SPEC_PROMPT } from './systemPrompt'

export const ANTD_DESIGN_SPEC_SKILL: AiSkill = {
  id: "antd-design-spec",
  name: "Ant Design 设计规范",
  description: "企业级前端设计规范，涵盖设计价值观、视觉系统、交互原则、组件指南和页面模板。用于设计审查、规范指导和 UI 优化。",
  systemPrompt: ANTD_DESIGN_SPEC_PROMPT,
  tools: [
    "get_supported_components",
    "get_current_design",
    "apply_schema",
    "validate_form"
  ],
  examples: []
}

export { ANTD_DESIGN_SPEC_PROMPT }