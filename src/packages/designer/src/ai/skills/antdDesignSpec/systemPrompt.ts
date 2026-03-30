import { DESIGN_VALUES } from './references/designValues'
import { VISUAL_DESIGN } from './references/visualDesign'
import { INTERACTION_DESIGN } from './references/interactionDesign'
import { COMPONENTS } from './references/components'
import { PAGE_TEMPLATES } from './references/pageTemplates'

export const ANTD_DESIGN_SPEC_PROMPT = `# Ant Design Specification Skill

Enterprise-level frontend design specification derived from Ant Design. Provides systematic guidance for designing consistent, professional web applications.

## When to Apply

### Must Use

This skill must be invoked when:

- Designing enterprise web applications (dashboards, admin panels, management systems)
- Creating or reviewing UI based on Ant Design
- Establishing design systems or component libraries
- Making decisions about layout, color, typography, or spacing
- Designing form pages, detail pages, or data lists
- Implementing navigation structures or feedback mechanisms

### Recommended

This skill is recommended when:

- Starting a new enterprise web project
- Conducting UI/UX reviews for consistency
- Optimizing existing interfaces for better usability
- Creating page templates or design patterns

### Skip

This skill is not needed when:

- Pure backend or API development
- Mobile-native applications (use ui-ux-pro-max instead)
- Consumer-facing marketing websites (unless enterprise-focused)

---

## Design Values

Ant Design is built on four core values that guide all design decisions:

| Value | Description | Key Principles |
|-------|-------------|----------------|
| **Natural** | Design should feel natural and intuitive | Perceptual naturalness, Behavioral naturalness |
| **Certainty** | Interfaces should be predictable and consistent | Designer certainty, User certainty |
| **Meaningfulness** | Design should serve a clear purpose | Result meaning, Process meaning |
| **Growth** | Design should evolve with users | Value connection, Human-machine symbiosis |

${DESIGN_VALUES}

---

## Visual Design System

${VISUAL_DESIGN}

---

## Interaction Principles

### Core Principles (Priority Order)

| Principle | Purpose | Key Patterns |
|-----------|---------|--------------|
| **Stay on Page** | Avoid context switching | Overlays, embedded layers, progressive disclosure |
| **Simplify Interaction** | Reduce effort | Real-time tools, hover tools, toggle tools |
| **Use Transitions** | Maintain context | Slide, carousel, folding |
| **Provide Invitations** | Increase discoverability | Static invitations, dynamic invitations |
| **Immediate Reaction** | Confirm actions | Auto-complete, real-time search, progress indication |

${INTERACTION_DESIGN}

---

## Component Guidelines

${COMPONENTS}

---

## Page Templates

${PAGE_TEMPLATES}

---

## Quick Reference

### Design Decision Checklist

**Before Starting**:
- [ ] Define product type (portal, management, tool, etc.)
- [ ] Identify user roles and tasks
- [ ] Establish design values priorities

**Visual Design**:
- [ ] Canvas: 1440px
- [ ] Spacing follows 8px grid
- [ ] Colors from Ant Design palette
- [ ] Base font: 14px / 22px line-height
- [ ] Shadows match elevation level

**Interaction Design**:
- [ ] Avoid unnecessary page jumps
- [ ] Provide clear feedback for all actions
- [ ] Use transitions for context preservation
- [ ] Make affordances visible

**Component Selection**:
- [ ] Choose based on data type and user task
- [ ] Maintain consistency across similar contexts
- [ ] Follow Ant Design component guidelines

**Accessibility**:
- [ ] Contrast ratio ≥4.5:1 for text
- [ ] All interactive elements keyboard-accessible
- [ ] Provide alternative for color-only indicators

### Common Mistakes to Avoid

| Category | Avoid |
|----------|-------|
| **Layout** | Random spacing, inconsistent margins |
| **Color** | Over-use of colors, insufficient contrast |
| **Typography** | Too many font sizes, hard-coded colors |
| **Interaction** | Unnecessary confirmations, missing feedback |
| **Navigation** | Too many levels, hidden current location |
| **Forms** | No validation feedback, unclear labels |

---

## Guardrails

- Always follow the four design values: Natural, Certainty, Meaningfulness, Growth
- Maintain consistency across the product
- Use Ant Design components and patterns as the foundation
- Consider accessibility in all design decisions
- Design for the primary use case, but handle edge cases gracefully
- Test designs with real content and data`

export { DESIGN_VALUES, VISUAL_DESIGN, INTERACTION_DESIGN, COMPONENTS, PAGE_TEMPLATES }