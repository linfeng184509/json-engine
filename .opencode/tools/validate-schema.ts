import { tool } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"

// ─── Type guards ────────────────────────────────────────────────
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}
function isStr(v: unknown): v is string {
  return typeof v === "string"
}
function isBool(v: unknown): v is boolean {
  return typeof v === "boolean"
}

interface Issue {
  path: string
  msg: string
  severity: "error" | "warn"
}

// ─── DSL value type checks ──────────────────────────────────────
function isRefValue(v: unknown): v is { $ref: string } {
  return isObj(v) && "$ref" in v && isStr(v.$ref)
}

function isExprValue(v: unknown): v is { $expr: string } {
  return isObj(v) && "$expr" in v && isStr(v.$expr)
}

function isFnValue(v: unknown): v is { $fn: string | { params?: unknown; body: string } } {
  if (!isObj(v) || !("$fn" in v)) return false
  const fn = v.$fn
  if (isStr(fn)) return true
  if (isObj(fn)) return "body" in fn && isStr(fn.body)
  return false
}

function isScopeValue(v: unknown): v is { $scope: string } {
  return isObj(v) && "$scope" in v && isStr(v.$scope)
}

function isDynamicValue(v: unknown): boolean {
  return isRefValue(v) || isExprValue(v) || isFnValue(v) || isScopeValue(v)
}

// ─── Validators ─────────────────────────────────────────────────
function validateRefValue(v: { $ref: string }, path: string, issues: Issue[]) {
  const dotIndex = v.$ref.indexOf(".")
  if (dotIndex < 0) {
    issues.push({ path, msg: `$ref "${v.$ref}" missing dot separator, expected "prefix.variable"`, severity: "error" })
    return
  }
  const prefix = v.$ref.substring(0, dotIndex)
  const valid = ["state", "props", "computed"]
  if (!valid.includes(prefix)) {
    issues.push({ path, msg: `$ref prefix "${prefix}" invalid, expected: ${valid.join(", ")}`, severity: "error" })
  }
}

function validateExprValue(v: { $expr: string }, path: string, issues: Issue[]) {
  if (!v.$expr.trim()) {
    issues.push({ path, msg: "$expr body cannot be empty", severity: "error" })
  }
}

function validateFnValue(v: { $fn: unknown }, path: string, issues: Issue[]) {
  const fn = v.$fn
  if (isObj(fn)) {
    if (!isStr(fn.body)) {
      issues.push({ path, msg: "$fn.body must be a string", severity: "error" })
    }
    if ("params" in fn && !isObj(fn.params) && !Array.isArray(fn.params)) {
      issues.push({ path, msg: "$fn.params must be an object or array", severity: "error" })
    }
  } else if (isStr(fn) && !fn.trim()) {
    issues.push({ path, msg: "$fn body cannot be empty", severity: "error" })
  }
}

function validateScopeValue(v: { $scope: string }, path: string, issues: Issue[]) {
  const dotIndex = v.$scope.indexOf(".")
  if (dotIndex < 0) {
    issues.push({ path, msg: `$scope "${v.$scope}" missing dot separator`, severity: "error" })
  }
}

function validateDynamicValue(v: unknown, path: string, issues: Issue[]) {
  if (isRefValue(v)) validateRefValue(v, path, issues)
  if (isExprValue(v)) validateExprValue(v, path, issues)
  if (isFnValue(v)) validateFnValue(v, path, issues)
  if (isScopeValue(v)) validateScopeValue(v, path, issues)
}

// ─── Section validators ─────────────────────────────────────────
function validateState(key: string, def: unknown, issues: Issue[]) {
  const p = `state.${key}`
  if (!isObj(def)) {
    issues.push({ path: p, msg: "state definition must be an object", severity: "error" })
    return
  }
  const validTypes = ["ref", "reactive", "shallowRef", "shallowReactive", "toRef", "toRefs", "readonly"]
  if (!def.type) {
    issues.push({ path: p, msg: "missing type field", severity: "error" })
  } else if (!validTypes.includes(def.type as string)) {
    issues.push({ path: `${p}.type`, msg: `"${def.type}" invalid, expected: ${validTypes.join(", ")}`, severity: "error" })
  }
  if (["reactive", "shallowReactive"].includes(def.type as string) && def.initial !== undefined && !isObj(def.initial) && !isDynamicValue(def.initial)) {
    issues.push({ path: `${p}.initial`, msg: "initial value should be an object for reactive types", severity: "warn" })
  }
  if (["toRef", "toRefs"].includes(def.type as string) && !def.source) {
    issues.push({ path: p, msg: `missing source field for ${def.type}`, severity: "error" })
  }
  if (def.type === "toRef" && !def.key) {
    issues.push({ path: p, msg: "toRef requires a key field", severity: "error" })
  }
  if (def.type === "readonly" && !def.source) {
    issues.push({ path: p, msg: "readonly requires a source field", severity: "error" })
  }
}

function validateComputed(key: string, def: unknown, issues: Issue[]) {
  const p = `computed.${key}`
  if (!isObj(def)) {
    issues.push({ path: p, msg: "computed definition must be an object", severity: "error" })
    return
  }
  if (!def.get) {
    issues.push({ path: p, msg: "missing get", severity: "error" })
  } else if (!isFnValue(def.get)) {
    issues.push({ path: `${p}.get`, msg: "must be $fn format", severity: "error" })
  } else {
    validateFnValue(def.get, `${p}.get`, issues)
  }
  if (def.set && !isFnValue(def.set)) {
    issues.push({ path: `${p}.set`, msg: "must be $fn format", severity: "error" })
  }
}

function validateMethods(key: string, def: unknown, issues: Issue[]) {
  const p = `methods.${key}`
  if (!isFnValue(def)) {
    issues.push({ path: p, msg: "must be $fn format", severity: "error" })
  }
}

function validateWatch(key: string, def: unknown, issues: Issue[]) {
  const p = `watch.${key}`
  if (!isObj(def)) {
    issues.push({ path: p, msg: "watch definition must be an object", severity: "error" })
    return
  }
  if (!def.source) {
    issues.push({ path: p, msg: "missing source", severity: "error" })
  } else if (!isExprValue(def.source)) {
    issues.push({ path: `${p}.source`, msg: "must be $expr format", severity: "error" })
  }
  if (!def.handler) {
    issues.push({ path: p, msg: "missing handler", severity: "error" })
  } else if (!isFnValue(def.handler)) {
    issues.push({ path: `${p}.handler`, msg: "must be $fn format", severity: "error" })
  }
}

function validateLifecycle(hook: string, def: unknown, issues: Issue[]) {
  const p = `lifecycle.${hook}`
  const validHooks = ["onMounted", "onUnmounted", "onUpdated", "onBeforeMount", "onBeforeUnmount", "onBeforeUpdate", "onErrorCaptured", "onActivated", "onDeactivated"]
  if (!validHooks.includes(hook)) {
    issues.push({ path: p, msg: `"${hook}" is not a standard Vue lifecycle hook`, severity: "warn" })
    return
  }
  if (Array.isArray(def)) {
    def.forEach((item, i) => {
      if (!isFnValue(item)) issues.push({ path: `${p}[${i}]`, msg: "must be $fn format", severity: "error" })
    })
  } else if (!isFnValue(def)) {
    issues.push({ path: p, msg: "must be $fn format or $fn[] array", severity: "error" })
  }
}

// ─── VNode validators ───────────────────────────────────────────
function validateDirectives(dirs: Record<string, unknown>, path: string, issues: Issue[]) {
  if ("vIf" in dirs && !isExprValue(dirs.vIf)) {
    issues.push({ path: `${path}.vIf`, msg: "must be $expr format", severity: "error" })
  }
  if ("vElseIf" in dirs && !isExprValue(dirs.vElseIf)) {
    issues.push({ path: `${path}.vElseIf`, msg: "must be $expr format", severity: "error" })
  }
  if ("vElse" in dirs && !isBool(dirs.vElse)) {
    issues.push({ path: `${path}.vElse`, msg: "must be boolean true", severity: "error" })
  }
  if ("vFor" in dirs && dirs.vFor) {
    const vf = dirs.vFor as Record<string, unknown>
    if (!vf.source || !isExprValue(vf.source)) {
      issues.push({ path: `${path}.vFor.source`, msg: "must be $expr format", severity: "error" })
    }
    if (!vf.alias || !isStr(vf.alias)) {
      issues.push({ path: `${path}.vFor.alias`, msg: "must be a non-empty string", severity: "error" })
    }
  }
  if ("vModel" in dirs && dirs.vModel) {
    const models = Array.isArray(dirs.vModel) ? dirs.vModel : [dirs.vModel]
    models.forEach((m: Record<string, unknown>, i: number) => {
      const mp = Array.isArray(dirs.vModel) ? `${path}.vModel[${i}]` : `${path}.vModel`
      if (!m.prop || !isRefValue(m.prop)) {
        issues.push({ path: `${mp}.prop`, msg: "must be $ref format (StateRef or PropsRef)", severity: "error" })
      }
    })
  }
  if ("vOn" in dirs && dirs.vOn) {
    if (!isObj(dirs.vOn)) {
      issues.push({ path: `${path}.vOn`, msg: "must be an object", severity: "error" })
    } else {
      for (const [evt, handler] of Object.entries(dirs.vOn as Record<string, unknown>)) {
        if (!isFnValue(handler)) {
          issues.push({ path: `${path}.vOn.${evt}`, msg: "must be $fn format", severity: "error" })
        }
      }
    }
  }
  if ("vBind" in dirs && dirs.vBind) {
    if (!isObj(dirs.vBind)) {
      issues.push({ path: `${path}.vBind`, msg: "must be an object", severity: "error" })
    } else {
      for (const [prop, val] of Object.entries(dirs.vBind as Record<string, unknown>)) {
        if (!isExprValue(val)) {
          issues.push({ path: `${path}.vBind.${prop}`, msg: "must be $expr format", severity: "error" })
        }
      }
    }
  }
  if ("vShow" in dirs && !isExprValue(dirs.vShow)) {
    issues.push({ path: `${path}.vShow`, msg: "must be $expr format", severity: "error" })
  }
  if ("vHtml" in dirs && !isExprValue(dirs.vHtml)) {
    issues.push({ path: `${path}.vHtml`, msg: "must be $expr format", severity: "error" })
  }
  if ("vText" in dirs && !isExprValue(dirs.vText)) {
    issues.push({ path: `${path}.vText`, msg: "must be $expr format", severity: "error" })
  }
  if ("vSlot" in dirs && dirs.vSlot && !isObj(dirs.vSlot)) {
    issues.push({ path: `${path}.vSlot`, msg: "must be an object", severity: "error" })
  }
  if ("vOnce" in dirs && !isBool(dirs.vOnce)) {
    issues.push({ path: `${path}.vOnce`, msg: "must be boolean", severity: "error" })
  }
}

function validateVNode(node: unknown, path: string, issues: Issue[]) {
  if (!isObj(node)) {
    issues.push({ path, msg: "VNode must be an object", severity: "error" })
    return
  }
  if (isDynamicValue(node)) {
    validateDynamicValue(node, path, issues)
    return
  }
  if (!node.type) {
    issues.push({ path, msg: "VNode missing type field", severity: "error" })
    return
  }
  if (!isStr(node.type)) {
    issues.push({ path: `${path}.type`, msg: "must be a string", severity: "error" })
    return
  }
  if (node.props && isObj(node.props)) {
    for (const [k, v] of Object.entries(node.props)) {
      if (isDynamicValue(v)) validateDynamicValue(v, `${path}.props.${k}`, issues)
    }
  }
  if (node.directives && isObj(node.directives)) {
    validateDirectives(node.directives as Record<string, unknown>, `${path}.directives`, issues)
  }
  if (node.children !== undefined) {
    validateChildren(node.children, `${path}.children`, issues)
  }
}

function validateChildren(children: unknown, path: string, issues: Issue[]) {
  if (isStr(children) || typeof children === "number") return
  if (isDynamicValue(children)) {
    validateDynamicValue(children, path, issues)
    return
  }
  if (Array.isArray(children)) {
    children.forEach((c, i) => validateChildren(c, `${path}[${i}]`, issues))
    return
  }
  if (isObj(children)) {
    validateVNode(children, path, issues)
  }
}

function validateRender(render: unknown, issues: Issue[]) {
  if (!isObj(render)) {
    issues.push({ path: "render", msg: "must be an object", severity: "error" })
    return
  }
  const validTypes = ["template", "function"]
  if (!render.type) {
    issues.push({ path: "render", msg: "missing type field", severity: "error" })
  } else if (!validTypes.includes(render.type as string)) {
    issues.push({ path: "render.type", msg: `"${render.type}" invalid, expected: ${validTypes.join(", ")}`, severity: "error" })
  }
  if (render.content === undefined) {
    issues.push({ path: "render", msg: "missing content field", severity: "error" })
  } else if (render.type === "template") {
    validateVNode(render.content, "render.content", issues)
  } else if (render.type === "function") {
    if (!isFnValue(render.content)) {
      issues.push({ path: "render.content", msg: "must be $fn format", severity: "error" })
    }
  }
}

// ─── Main schema validator ──────────────────────────────────────
function validateSchema(schema: unknown): Issue[] {
  const issues: Issue[] = []

  if (!isObj(schema)) {
    issues.push({ path: "root", msg: "Schema must be a JSON object", severity: "error" })
    return issues
  }

  if (!schema.name || !isStr(schema.name) || !schema.name.trim()) {
    issues.push({ path: "root", msg: "name must be a non-empty string", severity: "error" })
  }
  if (!schema.render) {
    issues.push({ path: "root", msg: "render is required", severity: "error" })
  } else {
    validateRender(schema.render, issues)
  }

  if (schema.state && isObj(schema.state)) {
    for (const [k, v] of Object.entries(schema.state)) validateState(k, v, issues)
  }
  if (schema.computed && isObj(schema.computed)) {
    for (const [k, v] of Object.entries(schema.computed)) validateComputed(k, v, issues)
  }
  if (schema.methods && isObj(schema.methods)) {
    for (const [k, v] of Object.entries(schema.methods)) validateMethods(k, v, issues)
  }
  if (schema.watch && isObj(schema.watch)) {
    for (const [k, v] of Object.entries(schema.watch)) validateWatch(k, v, issues)
  }
  if (schema.lifecycle && isObj(schema.lifecycle)) {
    for (const [k, v] of Object.entries(schema.lifecycle)) validateLifecycle(k, v, issues)
  }
  if (schema.components && isObj(schema.components)) {
    for (const [k, v] of Object.entries(schema.components)) {
      const p = `components.${k}`
      if (!isObj(v)) {
        issues.push({ path: p, msg: "component definition must be an object", severity: "error" })
      } else {
        if (!v.type || !["local", "async"].includes(v.type as string)) {
          issues.push({ path: `${p}.type`, msg: `"${v.type}" invalid, expected: local, async`, severity: "error" })
        }
        if (!v.source) {
          issues.push({ path: p, msg: "missing source field", severity: "error" })
        }
      }
    }
  }

  return issues
}

// ─── OpenCode Tool ──────────────────────────────────────────────
export default tool({
  description: "Validate a vue-json schema file against @json-engine/core-engine design specification. Checks DSL value types ($ref, $expr, $fn, $scope), component structure, VNode definitions, directive formats, and all validation rules.",
  parameters: {
    file_path: {
      type: "string",
      description: "Path to the JSON schema file to validate (relative to project root or absolute)",
    },
  },
  async execute({ file_path }, ctx) {
    const resolved = resolve(ctx.directory, file_path)

    if (!existsSync(resolved)) {
      return `ERROR: File not found: ${resolved}`
    }

    let schema: unknown
    try {
      schema = JSON.parse(readFileSync(resolved, "utf-8"))
    } catch (e: unknown) {
      return `ERROR: Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}`
    }

    const issues = validateSchema(schema)
    const errors = issues.filter((i) => i.severity === "error")
    const warns = issues.filter((i) => i.severity === "warn")

    let output = `Validation: ${resolved}\n${"=".repeat(60)}\n\n`

    if (warns.length > 0) {
      output += `WARNINGS (${warns.length}):\n`
      for (const w of warns) output += `  ⚠ [${w.path}] ${w.msg}\n`
      output += "\n"
    }

    if (errors.length > 0) {
      output += `ERRORS (${errors.length}):\n`
      for (const e of errors) output += `  ✗ [${e.path}] ${e.msg}\n`
      output += "\n"
    }

    output += "-".repeat(60) + "\n"
    if (errors.length === 0) {
      output += `✓ PASS — Schema conforms to core-engine specification (${issues.length} issue(s) total)\n`
    } else {
      output += `✗ FAIL — ${errors.length} error(s) found\n`
    }

    return output
  },
})
