---
name: antd-design-spec
description: "Enterprise-level frontend design specification based on Ant Design. Covers design values, visual systems (layout, color, typography, shadow, icon), interaction principles, component guidelines, and page templates. Use when designing or implementing UI for enterprise web applications, dashboards, admin panels, or any Ant Design-based project."
license: MIT
compatibility: Ant Design 4.x/5.x, React, Vue
metadata:
  author: Ant Design Team
  version: "1.0"
---

# Ant Design Specification Skill

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
| **Natural** | Design should feel natural and intuitive | Perceptual naturalness (visual elements follow natural laws), Behavioral naturalness (proactive services reduce user effort) |
| **Certainty** | Interfaces should be predictable and consistent | Designer certainty (restrained, object-oriented, modular), User certainty (consistent look and interaction across products) |
| **Meaningfulness** | Design should serve a clear purpose | Result meaning (clear goals, immediate feedback), Process meaning (appropriate challenge, focused flow) |
| **Growth** | Design should evolve with users | Value connection (discover product value), Human-machine symbiosis (grow together) |

### Design Value Application

```
┌─────────────────────────────────────────────────────────┐
│                  Design Value Decision Tree              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Is this design natural?                               │
│   ├── Does it follow natural visual patterns?           │
│   └── Does it reduce cognitive load?                    │
│                                                         │
│   Is this design certain?                               │
│   ├── Are design elements consistent?                   │
│   └── Can users predict behavior?                       │
│                                                         │
│   Does this design have meaning?                        │
│   ├── Is the goal clear?                                │
│   └── Is feedback immediate?                            │
│                                                         │
│   Can this design grow?                                 │
│   ├── Is value discoverable?                            │
│   └── Can it adapt to user needs?                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Visual Design System

### 1. Layout System

| Element | Specification | Notes |
|---------|---------------|-------|
| **Canvas Size** | 1440px (unified) | Standard for enterprise products |
| **Grid Unit** | 8px base | All spacing follows 8x multiplier |
| **Grid System** | 24 columns | Gutter fixed, column width fluid |
| **Common Spacing** | 8px / 16px / 24px | Small / Medium / Large |

**Layout Formula**: `spacing = 8 + 8 × n` (where n >= 0)

**Adaptive Layout Types**:
- **Left-Right Layout**: Fixed sidebar, fluid content area
- **Top-Bottom Layout**: Fluid content with min margin constraints

### 2. Color System

| Category | Count | Usage |
|----------|-------|-------|
| **Primary Colors** | 12 main colors | Brand and emphasis |
| **Derived Colors** | 120 total | Extended palette |
| **Neutral Colors** | 13 shades (white to black) | Text, borders, backgrounds |
| **Functional Colors** | 4 types | Success (green), Error (red), Warning (yellow), Info (blue) |

**Brand Color Selection**: Choose the 6th color from the palette (e.g., `#1677ff` for blue)

**Color Application Principles**:
- Restrained use - color for information, guidance, and feedback
- Maintain consistency across the product
- Consider accessibility (WCAG 2.0 standards)

### 3. Typography System

| Property | Value | Notes |
|----------|-------|-------|
| **Base Font Size** | 14px | Optimal for monitor reading |
| **Base Line Height** | 22px | Paired with 14px font |
| **Font Scale** | 10 levels (12-38px) | Derived from musical scales |
| **Font Weights** | 400 (regular), 500 (medium), 600 (semibold) | Restrained use |

**Font Family**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
  'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
```

**Typography Guidelines**:
- Use 3-5 font sizes maximum per system
- Maintain AAA contrast ratio (7:1+) for text
- Use tabular-nums for numerical data

### 4. Shadow System

| Level | Usage | Characteristics |
|-------|-------|-----------------|
| **Level 0** | Elements on surface | No shadow (input, etc.) |
| **Level 1** | Hover states | Subtle lift effect |
| **Level 2** | Dropdowns, popovers | Following elements |
| **Level 3** | Modals, dialogs | Independent floating elements |

**Shadow Direction**:
- Down: Standard components
- Up: Bottom navigation, toolbars
- Left: Right sidebar, drawers
- Right: Left sidebar, drawers

### 5. Icon System

**Design Specifications**:
- Artboard: 1024 × 1024px
- Bleed: 64px margin
- Stroke widths: 56 / 64 / 72 / 80px (8x rule)
- Corner radius: 8 / 16 / 32px
- Common angle: ~76°

**Icon Design Principles**:
1. **Accurate**: Correct shapes, clear meaning
2. **Simple**: Minimal decoration
3. **Rhythmic**: Order in composition
4. **Pleasant**: Appropriate emotional touch

---

## Design Principles

### Priority Order

| Priority | Principle | Application |
|----------|-----------|-------------|
| 1 | **Proximity** | Related items closer together |
| 2 | **Alignment** | Consistent visual starting points |
| 3 | **Contrast** | Strong differentiation for hierarchy |
| 4 | **Repetition** | Consistent elements reduce learning cost |

### 1. Proximity (亲密性)

**Vertical Spacing**:
- Small: 8px
- Medium: 16px
- Large: 24px

**Horizontal Spacing**: Use grid system for flexibility

**Principle**: Higher关联度 = Closer distance

### 2. Alignment (对齐)

| Type | Application |
|------|-------------|
| **Text Alignment** | Left-aligned for Western languages, unified visual starting point |
| **Form Alignment** | Colon-aligned (right-aligned labels) for efficient scanning |
| **Number Alignment** | Right-aligned for quick value comparison |

### 3. Contrast (对比)

**Types**:
- **Primary-Secondary**: Highlight main actions
- **Hierarchy**: Differentiate total vs. parts
- **State**: Static (color dots) vs. Dynamic (hover effects)

**Rule**: Contrast must be STRONG - do not be timid.

### 4. Repetition (重复)

**Repeatable Elements**:
- Line styles
- Color schemes
- Design patterns
- Spacing rules
- Typography styles

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

### 1. Stay on Page (足不出户)

**Pattern Types**:
- **Overlay**: Modals, popovers, tooltips (avoid page refresh)
- **Embedded Layer**: Expandable rows, tabs (keep context)
- **Virtual Page**: Single-page applications

**When to Avoid Page Jump**:
- Simple confirmations → Use Popconfirm
- Quick edits → Use inline editing
- Detail views → Use drawers for moderate content

### 2. Simplify Interaction (简化交互)

**Fitts's Law Application**: Shorter distance + Larger target = Easier operation

| Pattern | When to Use |
|---------|-------------|
| **Real-time Visible Tools** | Important, frequently used actions |
| **Hover-reveal Tools** | Secondary actions that would clutter |
| **Toggle-display Tools** | Mode-specific actions |

**Hot Area Expansion**: Click area > Visual area (especially for mobile)

### 3. Use Transitions (巧用过渡)

**Transition Types**:
- **Slide In/Out**: Build virtual space
- **Carousel**: Extend virtual space
- **Folding**: Preserve context while expanding

**Change Communication**:
- Object added → Highlight briefly
- Object removed → Fade out
- Object changed → Flash highlight

### 4. Provide Invitations (提供邀请)

| Type | Examples |
|------|----------|
| **Static Invitations** | Text prompts, blank slate hints, unfinished state indicators |
| **Dynamic Invitations** | Hover reveals, inferred suggestions, "see more" prompts |

**Tour/Onboarding**: Use sparingly for truly new features

### 5. Immediate Reaction (即时反应)

**Query Patterns**:
- Auto-complete (determined categories)
- Real-time search (as-you-type results)

**Feedback Patterns**:
- Real-time preview (validate before submit)
- Progress indication (loading states)
- Click/tap feedback

---

## Component Guidelines

### Navigation Components

| Component | Usage | Constraints |
|-----------|-------|-------------|
| **Top Navigation** | Portal/front-stage apps | 2-7 items, 4-15 chars each |
| **Side Navigation** | Management/admin apps | Unlimited items, expandable |
| **Breadcrumb** | Show location | Max 5 levels, hide if nav is clear |
| **Tabs** | Content switching | 2-6 chars per label |
| **Steps** | Process guidance | Max 5 steps recommended |
| **Pagination** | Data navigation | Show quick-jump for >5 pages |

### Feedback Components

| Component | Type | Usage |
|-----------|------|-------|
| **Alert** | Static | Non-blocking persistent messages |
| **Notification** | Floating | Important global notifications |
| **Badge** | Indicator | Unread count, status dot |
| **Tooltip** | Hover | Simple descriptions |
| **Popover** | Hover/Click | Rich content with actions |
| **Message** | Auto-dismiss | Success/operation feedback (3s) |
| **Modal** | Blocking | Important confirmations |
| **Popconfirm** | Lightweight | Quick confirmations near element |

**Feedback Timing**:
- Loading > 2s → Show progress
- Important failure → Use Modal (not Message)
- Simple success → Use Message (auto-dismiss)

### Data Entry Components

| Component | When to Use |
|-----------|-------------|
| **Input** | Short single-line text |
| **Textarea** | Long multi-line text |
| **Radio** | 2-5 mutually exclusive options |
| **Checkbox** | Multiple selections, status toggle |
| **Switch** | Single on/off toggle (immediate effect) |
| **Select/Dropdown** | >5 options |
| **Slider** | Range values, intensity settings |
| **Transfer** | Move items between two lists |
| **DatePicker** | Date/range selection |
| **Upload** | File input |

### Data Display Components

| Component | Best For |
|-----------|----------|
| **Table** | Structured data, comparison, analysis |
| **List** | Scannable content, limited space |
| **Card Grid** | Visual emphasis, equal importance items |
| **Collapse** | Grouped information, FAQ |
| **Tree** | Hierarchical data, navigation |
| **Timeline** | Chronological events, history |

### Button Guidelines

**Types by Emphasis**:
1. **Primary Button** - One per section, main action
2. **Default Button** - Safe choice, secondary actions
3. **Text Button** - Weak emphasis, table operations
4. **Icon Button** - Space-efficient, must have tooltip
5. **Dashed Button** - Add new items
6. **Danger Button** - Destructive actions
7. **Ghost Button** - On complex/colored backgrounds

**Button Placement**:
- **Follow Content**: In user's reading path
- **Toolbar**: Right-aligned, control specific content
- **Footer**: For detail pages with flow actions (approve/reject)

**Button Order** (Left to Right):
1. Recommended/primary action
2. Secondary actions
3. Destructive actions (last)

**Button Text**: Must use verbs (e.g., "Publish", "Delete")

---

## Page Templates

### Form Pages

| Template | When to Use | Layout |
|----------|-------------|--------|
| **Basic Form** | Simple, few fields | Single column, one card |
| **Step Form** | Linear multi-step process | Steps + form sections |
| **Grouped Form** | Many fields, categorizable | Multiple cards/groups |
| **Editable List** | Dynamic field sets | Table or card list with add/remove |

**Form Layout Decision**:
```
┌─────────────────────────────────────────────────────────┐
│                    Form Layout Selection                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Fields < 7?                                           │
│   └── YES → Basic form (single section)                 │
│                                                         │
│   Fields 7-15?                                          │
│   └── YES → Weak grouping or card grouping              │
│                                                         │
│   Fields > 15?                                          │
│   └── YES → Card grouping or tab grouping               │
│                                                         │
│   Linear process?                                       │
│   └── YES → Step form                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Detail Pages

| Template | When to Use |
|----------|-------------|
| **Basic Detail** | Simple, low complexity info |
| **Advanced Detail** | Large content, high complexity |
| **Document Detail** | Approval workflows |

**Section Separation Methods**:
- Non-full-width divider: Related content groups
- Full-width divider: Major sections
- Card: Independent topics
- Tabs: Top-level organization (by version, intent, stage)

### Data Lists

| Type | Strength | When to Use |
|------|----------|-------------|
| **Table** | Scanning, comparison, analysis | Structured data, many columns |
| **List** | Scanning, quick overview | Limited space, mobile-friendly |
| **Card Grid** | Visual, equal emphasis | Visual content, discovery |

**List Toolbar**: Consolidate search, filter, view options, actions

**Empty State**: Always provide guidance when no data

### Empty States

**Types**:
- **First-time User**: Guide with actions
- **Completed/Cleared**: Celebration or acknowledgment
- **No Data**: Explanation + suggested action

**Elements**:
1. Illustration (optional)
2. Clear message explaining the state
3. Suggested action (optional)

### Error Pages

| Code | Meaning | Action |
|------|---------|--------|
| **404** | Not found | Return to home/search |
| **403** | Forbidden | Request access/login |
| **500** | Server error | Retry, contact support |

**Error Page Elements**:
1. Illustration (add lightness)
2. Error code (if applicable)
3. Clear description
4. Suggested action

---

## Motion Design

### Motion Principles

| Principle | Description |
|-----------|-------------|
| **Natural** | Follow natural movement laws, maintain visual continuity |
| **Efficient** | Minimize transition time, quick completion |
| **Restrained** | Meaningful motion only, avoid decoration |

### Motion Timing

| Type | Duration |
|------|----------|
| Micro-interactions | 150-300ms |
| Complex transitions | ≤400ms |
| Avoid | >500ms |

### Motion Easing

- **Enter**: ease-out
- **Exit**: ease-in (faster than enter)
- **Natural feel**: Spring/physics-based curves

---

## Copywriting Guidelines

### Language Principles

1. **User Perspective**: "You can..." not "We provide..."
2. **Concise**: Omit unnecessary words
3. **Familiar Terms**: Avoid jargon for general users
4. **Consistent**: Same term for same concept
5. **Important First**: Key information at the beginning

### Tone

- Use "You" and "I" (avoid "You" - too formal/distant)
- Be friendly and respectful
- Avoid extreme expressions
- Don't blame users for errors

### Punctuation

- Omit unnecessary periods in labels, titles, table cells
- Use periods for multi-sentence content
- Use exclamation marks sparingly (greetings, congratulations only)

### Numbers

- Use Arabic numerals for data
- Add space between numbers and Chinese characters

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

## References

For detailed information on specific topics:

- **Design Values**: `references/design-values.md`
- **Visual Design**: `references/visual-design.md`
- **Interaction Design**: `references/interaction-design.md`
- **Components**: `references/components.md`
- **Page Templates**: `references/page-templates.md`

---

## Guardrails

- Always follow the four design values: Natural, Certainty, Meaningfulness, Growth
- Maintain consistency across the product
- Use Ant Design components and patterns as the foundation
- Consider accessibility in all design decisions
- Design for the primary use case, but handle edge cases gracefully
- Test designs with real content and data