## Context

**Current State**:
- vue-json supports basic v-model (modelValue only)
- plugin-antd registers 52+ antd components but no icons
- applyVSlot exists in directive-runtime.ts but is never called
- CoreScope has `_antd` with message/notification but no modal.confirm API

**Constraints**:
- Must maintain backward compatibility with existing schemas
- Must not increase bundle size significantly (icon registration should be optional)
- Must follow existing vue-json patterns and conventions

**Stakeholders**:
- vue-json consumers (JSON Schema authors)
- plugin-antd users
- antd-demo-playground project (downstream)

## Goals / Non-Goals

**Goals**:
- Enable v-model with argument binding (v-model:open, v-model:checked, v-model:value)
- Register @ant-design/icons-vue icons as global components
- Integrate vSlot rendering in render-factory
- Extend _antd scope with Modal.confirm, Form.useForm APIs
- Maintain backward compatibility

**Non-Goals**:
- Full antd component customization via JSON
- Dynamic icon loading (lazy loading optimization)
- Complex slot nesting with multiple levels
- Form.useForm complete feature parity (simplified implementation)

## Decisions

### Decision 1: v-model arg field approach

**Chosen**: Add `arg` field to vModel directive definition, derive event name as `update:${arg}`

**Alternatives Considered**:
- A: Add separate `propName` and `eventName` fields → Rejected: More verbose, less intuitive
- B: Parse from prop reference string → Rejected: Complex parsing, error-prone
- C: Use existing `event` field for both → Rejected: Confusing semantics

**Rationale**: `arg` mirrors Vue's v-model:arg syntax, making schema intuitive. Event name derived automatically: `update:${arg}`.

### Decision 2: Icon registration strategy

**Chosen**: Optional via `includeIcons: boolean` config, register all icons when enabled

**Alternatives Considered**:
- A: Always register → Rejected: Increases bundle size ~100KB
- B: Lazy load icons → Rejected: Complex implementation, async loading issues
- C: Register only used icons → Rejected: Requires schema analysis at build time

**Rationale**: Optional config gives control over bundle size. All icons registered when enabled ensures all demos work without per-icon configuration.

### Decision 3: vSlot integration point

**Chosen**: Integrate in render-factory.ts `resolveNodeChildren` function

**Alternatives Considered**:
- A: Create separate slot-factory.ts → Rejected: Over-engineering, applyVSlot already exists
- B: Handle in VNodeDefinition parsing → Rejected: Parsing stage doesn't have render context
- C: Post-process rendered VNode → Rejected: VNode structure immutable after render

**Rationale**: resolveNodeChildren has context and children access, natural place to transform children into slot function.

### Decision 4: API scope structure

**Chosen**: Nest APIs under `_antd`: `{ message, notification, modal: { confirm, info, ... }, form }`

**Alternatives Considered**:
- A: Add directly to CoreScope as `_message`, `_modal`, etc. → Rejected: Namespace pollution
- B: Use `_antd.message`, `_antd.modal.confirm` → Chosen: Clear namespace hierarchy
- C: Import in each schema → Rejected: Repetitive, violates DRY

**Rationale**: Namespace hierarchy prevents scope pollution, mirrors antd import structure.

## Risks / Trade-offs

### Risk 1: v-model backward compatibility
**Risk**: Existing schemas using vModel might break if arg field is required
**Mitigation**: arg is optional, default to modelValue when undefined. Test all existing schemas.

### Risk 2: Icon bundle size
**Risk**: includeIcons: true adds ~100KB to bundle
**Mitigation**: Document bundle size impact, recommend includeIcons: false for production apps.

### Risk 3: Slot props context complexity
**Risk**: Slot props injection may conflict with existing state variables
**Mitigation**: Slot props prefixed or scoped separately, use temporary context extension.

### Risk 4: Modal.confirm cleanup
**Risk**: Modal.confirm returns destroy function, may leak if not handled
**Mitigation**: Document destroy function usage, provide cleanup pattern in examples.

## Implementation Phases

1. **Phase 1 (P0)**: v-model arg support
   - Modify types/schema.ts: VNodeDirectives.vModel type
   - Modify runtime/directive-runtime.ts: applyVModel logic
   - Add tests for v-model:open, v-model:checked, v-model:value

2. **Phase 2 (P0)**: Icon registration
   - Create plugin-antd/src/iconComponents.ts
   - Modify plugin-antd/src/plugin.ts: onInstall logic
   - Add icon component tests

3. **Phase 3 (P1)**: vSlot integration
   - Modify runtime/render-factory.ts: resolveNodeChildren
   - Test slot props passing (Table bodyCell)

4. **Phase 4 (P2)**: API scope extension
   - Modify plugin-antd/src/plugin.ts: scopeExtensions
   - Test Modal.confirm, message.success

## Open Questions

1. Should Form.useForm be fully supported or just basic validation? → **Resolved**: Basic support, full implementation deferred.
2. How to handle icon TypeScript types? → **Deferred**: Add .d.ts declaration in separate task.