#!/usr/bin/env node
/**
 * JSON Schema Validator for @json-engine/vue-json
 *
 * Validates that a JSON schema conforms to the core-engine design specification.
 *
 * Usage: node validate-schema.mjs <path-to-schema.json>
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ─── Color output ───────────────────────────────────────────────
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let errors = [];
let warnings = [];
let passCount = 0;

function error(path, msg) {
  errors.push({ path, msg });
}

function warn(path, msg) {
  warnings.push({ path, msg });
}

function pass(msg) {
  passCount++;
}

// ─── Type guards ────────────────────────────────────────────────
function isObj(v) { return typeof v === 'object' && v !== null && !Array.isArray(v); }
function isStr(v) { return typeof v === 'string'; }
function isBool(v) { return typeof v === 'boolean'; }
function isNum(v) { return typeof v === 'number'; }

function isRefValue(v) {
  return isObj(v) && '$ref' in v && isStr(v.$ref);
}

function isExprValue(v) {
  return isObj(v) && '$expr' in v && isStr(v.$expr);
}

function isFnValue(v) {
  if (!isObj(v) || !('$fn' in v)) return false;
  const fn = v.$fn;
  if (isStr(fn)) return true;
  if (isObj(fn)) return isStr(fn.body);
  return false;
}

function isScopeValue(v) {
  return isObj(v) && '$scope' in v && isStr(v.$scope);
}

function isDynamicValue(v) {
  return isRefValue(v) || isExprValue(v) || isFnValue(v) || isScopeValue(v);
}

// ─── Validators ─────────────────────────────────────────────────

function validateRefValue(v, path) {
  if (!isRefValue(v)) return;
  const ref = v.$ref;
  const dotIndex = ref.indexOf('.');
  if (dotIndex < 0) {
    error(path, `$ref "${ref}" 缺少点号分隔符，格式应为 "prefix.variable"`);
    return;
  }
  const prefix = ref.substring(0, dotIndex);
  const validPrefixes = ['state', 'props', 'computed'];
  if (!validPrefixes.includes(prefix)) {
    error(path, `$ref 前缀 "${prefix}" 无效，仅支持: ${validPrefixes.join(', ')}`);
  } else {
    pass(`$ref prefix "${prefix}" valid`);
  }
}

function validateExprValue(v, path) {
  if (!isExprValue(v)) return;
  if (!v.$expr || v.$expr.trim() === '') {
    error(path, '$expr body 不能为空');
  } else {
    pass('$expr body non-empty');
  }
}

function validateFnValue(v, path) {
  if (!isFnValue(v)) return;
  const fn = v.$fn;
  if (isObj(fn)) {
    if (!isStr(fn.body)) {
      error(path, '$fn.body 必须为字符串');
    } else {
      pass('$fn.body is string');
    }
    if ('params' in fn) {
      if (!isObj(fn.params) && !Array.isArray(fn.params)) {
        error(path, '$fn.params 必须为对象或数组');
      } else {
        pass('$fn.params valid');
      }
    }
  } else if (isStr(fn)) {
    if (!fn.trim()) {
      error(path, '$fn body 不能为空');
    } else {
      pass('$fn body non-empty');
    }
  }
}

function validateScopeValue(v, path) {
  if (!isScopeValue(v)) return;
  const scope = v.$scope;
  const dotIndex = scope.indexOf('.');
  if (dotIndex < 0) {
    error(path, `$scope "${scope}" 缺少点号分隔符`);
    return;
  }
  const scopeName = scope.substring(0, dotIndex);
  const validScopes = ['core', 'goal'];
  if (!validScopes.includes(scopeName)) {
    warn(path, `$scope 名称 "${scopeName}" 不在默认列表中 [${validScopes.join(', ')}]，可能为自定义`);
  } else {
    pass('$scope name valid');
  }
}

function validateDynamicValue(v, path) {
  if (!isDynamicValue(v)) return;
  if (isRefValue(v)) validateRefValue(v, path);
  if (isExprValue(v)) validateExprValue(v, path);
  if (isFnValue(v)) validateFnValue(v, path);
  if (isScopeValue(v)) validateScopeValue(v, path);
}

function validateStateDef(key, def, path) {
  if (!isObj(def)) {
    error(path, `state.${key} 必须为对象`);
    return;
  }

  const validTypes = ['ref', 'reactive', 'shallowRef', 'shallowReactive', 'toRef', 'toRefs', 'readonly'];
  if (!def.type) {
    error(path, `state.${key} 缺少 type 字段`);
  } else if (!validTypes.includes(def.type)) {
    error(path, `state.${key}.type "${def.type}" 无效，可选值: ${validTypes.join(', ')}`);
  } else {
    pass(`state.${key}.type "${def.type}" valid`);
  }

  if (['ref', 'reactive', 'shallowRef', 'shallowReactive'].includes(def.type)) {
    if (!('initial' in def)) {
      warn(path, `state.${key} (${def.type}) 缺少 initial 值`);
    }
    if (['reactive', 'shallowReactive'].includes(def.type) && def.initial !== undefined) {
      if (!isObj(def.initial) && !isDynamicValue(def.initial)) {
        warn(path, `state.${key} (${def.type}) 的 initial 应为对象类型`);
      }
    }
  }

  if (['toRef', 'toRefs'].includes(def.type)) {
    if (!def.source) {
      error(path, `state.${key} (${def.type}) 缺少 source 字段`);
    }
    if (def.type === 'toRef' && !def.key) {
      error(path, `state.${key} (toRef) 缺少 key 字段`);
    }
  }

  if (def.type === 'readonly' && !def.source) {
    error(path, `state.${key} (readonly) 缺少 source 字段`);
  }
}

function validateComputedDef(key, def, path) {
  if (!isObj(def)) {
    error(path, `computed.${key} 必须为对象`);
    return;
  }
  if (!def.get) {
    error(path, `computed.${key} 缺少 get`);
  } else {
    if (!isFnValue(def.get)) {
      error(path, `computed.${key}.get 必须为 $fn 格式`);
    } else {
      validateFnValue(def.get, `computed.${key}.get`);
      pass(`computed.${key}.get valid`);
    }
  }
  if (def.set) {
    if (!isFnValue(def.set)) {
      error(path, `computed.${key}.set 必须为 $fn 格式`);
    } else {
      validateFnValue(def.set, `computed.${key}.set`);
      pass(`computed.${key}.set valid`);
    }
  }
}

function validateMethodsDef(key, def, path) {
  if (!isFnValue(def)) {
    error(path, `methods.${key} 必须为 $fn 格式`);
  } else {
    validateFnValue(def, `methods.${key}`);
    pass(`methods.${key} valid`);
  }
}

function validateWatchDef(key, def, path) {
  if (!isObj(def)) {
    error(path, `watch.${key} 必须为对象`);
    return;
  }
  if (!def.source) {
    error(path, `watch.${key} 缺少 source`);
  } else if (!isExprValue(def.source)) {
    error(path, `watch.${key}.source 必须为 $expr 格式`);
  } else {
    validateExprValue(def.source, `watch.${key}.source`);
    pass(`watch.${key}.source valid`);
  }
  if (!def.handler) {
    error(path, `watch.${key} 缺少 handler`);
  } else if (!isFnValue(def.handler)) {
    error(path, `watch.${key}.handler 必须为 $fn 格式`);
  } else {
    validateFnValue(def.handler, `watch.${key}.handler`);
    pass(`watch.${key}.handler valid`);
  }
  if (def.type && !['watch', 'effect'].includes(def.type)) {
    error(path, `watch.${key}.type "${def.type}" 无效，可选值: watch, effect`);
  }
  if (def.flush && !['pre', 'post', 'sync'].includes(def.flush)) {
    error(path, `watch.${key}.flush "${def.flush}" 无效，可选值: pre, post, sync`);
  }
}

function validateLifecycleDef(hookName, def, path) {
  const validHooks = ['onMounted', 'onUnmounted', 'onUpdated', 'onBeforeMount', 'onBeforeUnmount', 'onBeforeUpdate', 'onErrorCaptured', 'onActivated', 'onDeactivated'];
  if (!validHooks.includes(hookName)) {
    warn(path, `lifecycle.${hookName} 不是标准 Vue 生命周期钩子`);
    return;
  }
  if (Array.isArray(def)) {
    def.forEach((item, i) => {
      if (!isFnValue(item)) {
        error(path, `lifecycle.${hookName}[${i}] 必须为 $fn 格式`);
      } else {
        validateFnValue(item, `lifecycle.${hookName}[${i}]`);
      }
    });
  } else if (!isFnValue(def)) {
    error(path, `lifecycle.${hookName} 必须为 $fn 格式或 $fn[] 数组`);
  } else {
    validateFnValue(def, `lifecycle.${hookName}`);
    pass(`lifecycle.${hookName} valid`);
  }
}

function validateVNode(node, path) {
  if (!isObj(node)) {
    error(path, 'VNode 必须为对象');
    return;
  }

  if (isDynamicValue(node)) {
    validateDynamicValue(node, path);
    return;
  }

  if (!node.type) {
    error(path, 'VNode 缺少 type 字段');
    return;
  }

  if (!isStr(node.type)) {
    error(path, `VNode.type 必须为字符串，当前为 ${typeof node.type}`);
    return;
  }

  pass(`VNode.type "${node.type}" valid`);

  if (node.props && isObj(node.props)) {
    for (const [propKey, propVal] of Object.entries(node.props)) {
      if (isDynamicValue(propVal)) {
        validateDynamicValue(propVal, `${path}.props.${propKey}`);
      }
    }
  }

  if (node.directives && isObj(node.directives)) {
    validateDirectives(node.directives, `${path}.directives`);
  }

  if (node.children !== undefined) {
    validateChildren(node.children, `${path}.children`);
  }
}

function validateDirectives(dirs, path) {
  if ('vIf' in dirs) {
    if (!isExprValue(dirs.vIf)) {
      error(path, 'vIf 必须为 $expr 格式');
    } else {
      validateExprValue(dirs.vIf, `${path}.vIf`);
      pass('vIf valid');
    }
  }

  if ('vElseIf' in dirs) {
    if (!isExprValue(dirs.vElseIf)) {
      error(path, 'vElseIf 必须为 $expr 格式');
    } else {
      validateExprValue(dirs.vElseIf, `${path}.vElseIf`);
      pass('vElseIf valid');
    }
  }

  if ('vElse' in dirs) {
    if (!isBool(dirs.vElse)) {
      error(path, 'vElse 必须为布尔值 true');
    } else {
      pass('vElse valid');
    }
  }

  if ('vFor' in dirs && dirs.vFor) {
    const vFor = dirs.vFor;
    if (!vFor.source) {
      error(path, 'vFor 缺少 source');
    } else if (!isExprValue(vFor.source)) {
      error(path, 'vFor.source 必须为 $expr 格式');
    } else {
      pass('vFor.source valid');
    }
    if (!vFor.alias || !isStr(vFor.alias)) {
      error(path, 'vFor.alias 必须为非空字符串');
    } else {
      pass('vFor.alias valid');
    }
  }

  if ('vModel' in dirs && dirs.vModel) {
    const models = Array.isArray(dirs.vModel) ? dirs.vModel : [dirs.vModel];
    models.forEach((m, i) => {
      const p = Array.isArray(dirs.vModel) ? `${path}.vModel[${i}]` : `${path}.vModel`;
      if (!m.prop) {
        error(p, 'vModel 缺少 prop');
      } else if (!isRefValue(m.prop) && !isObj(m.prop)) {
        error(p, 'vModel.prop 必须为 StateRef 或 PropsRef（$ref 格式）');
      } else if (isRefValue(m.prop)) {
        validateRefValue(m.prop, `${p}.prop`);
        pass(`${p}.prop valid`);
      }
    });
  }

  if ('vOn' in dirs && dirs.vOn) {
    if (!isObj(dirs.vOn)) {
      error(path, 'vOn 必须为对象');
    } else {
      for (const [event, handler] of Object.entries(dirs.vOn)) {
        if (!isFnValue(handler)) {
          error(path, `vOn.${event} 必须为 $fn 格式`);
        } else {
          validateFnValue(handler, `${path}.vOn.${event}`);
          pass(`vOn.${event} valid`);
        }
      }
    }
  }

  if ('vBind' in dirs && dirs.vBind) {
    if (!isObj(dirs.vBind)) {
      error(path, 'vBind 必须为对象');
    } else {
      for (const [prop, expr] of Object.entries(dirs.vBind)) {
        if (!isExprValue(expr)) {
          error(path, `vBind.${prop} 必须为 $expr 格式`);
        } else {
          pass(`vBind.${prop} valid`);
        }
      }
    }
  }

  if ('vShow' in dirs) {
    if (!isExprValue(dirs.vShow)) {
      error(path, 'vShow 必须为 $expr 格式');
    } else {
      pass('vShow valid');
    }
  }

  if ('vHtml' in dirs) {
    if (!isExprValue(dirs.vHtml)) {
      error(path, 'vHtml 必须为 $expr 格式');
    } else {
      pass('vHtml valid');
    }
  }

  if ('vText' in dirs) {
    if (!isExprValue(dirs.vText)) {
      error(path, 'vText 必须为 $expr 格式');
    } else {
      pass('vText valid');
    }
  }

  if ('vSlot' in dirs && dirs.vSlot) {
    if (!isObj(dirs.vSlot)) {
      error(path, 'vSlot 必须为对象');
    } else {
      if (dirs.vSlot.name !== undefined && !isStr(dirs.vSlot.name) && !isExprValue(dirs.vSlot.name)) {
        error(path, 'vSlot.name 必须为字符串或 $expr');
      } else {
        pass('vSlot valid');
      }
    }
  }

  if ('vOnce' in dirs) {
    if (!isBool(dirs.vOnce)) {
      error(path, 'vOnce 必须为布尔值');
    } else {
      pass('vOnce valid');
    }
  }
}

function validateChildren(children, path) {
  if (typeof children === 'string' || typeof children === 'number') {
    pass(`${path} is literal`);
    return;
  }

  if (isDynamicValue(children)) {
    validateDynamicValue(children, path);
    return;
  }

  if (Array.isArray(children)) {
    children.forEach((child, i) => {
      validateChildren(child, `${path}[${i}]`);
    });
    return;
  }

  if (isObj(children)) {
    validateVNode(children, path);
  }
}

function validateRender(render, path) {
  if (!isObj(render)) {
    error(path, 'render 必须为对象');
    return;
  }

  const validTypes = ['template', 'function'];
  if (!render.type) {
    error(path, 'render 缺少 type 字段');
  } else if (!validTypes.includes(render.type)) {
    error(path, `render.type "${render.type}" 无效，可选值: ${validTypes.join(', ')}`);
  } else {
    pass(`render.type "${render.type}" valid`);
  }

  if (render.content === undefined) {
    error(path, 'render 缺少 content 字段');
  } else if (render.type === 'template') {
    validateVNode(render.content, `${path}.content`);
  } else if (render.type === 'function') {
    if (!isFnValue(render.content)) {
      error(path, 'render.content (function) 必须为 $fn 格式');
    } else {
      validateFnValue(render.content, `${path}.content`);
      pass('render.content valid');
    }
  }
}

function validateSchema(schema) {
  if (!isObj(schema)) {
    error('root', 'Schema 必须为 JSON 对象');
    return { errors, warnings, passCount };
  }

  if (!schema.name) {
    error('root', '缺少 name 字段');
  } else if (!isStr(schema.name) || schema.name.trim() === '') {
    error('root', 'name 必须为非空字符串');
  } else {
    pass('name valid');
  }

  if (!schema.render) {
    error('root', '缺少 render 字段（必填）');
  } else {
    validateRender(schema.render, 'render');
  }

  if (schema.state && isObj(schema.state)) {
    for (const [key, def] of Object.entries(schema.state)) {
      validateStateDef(key, def, `state.${key}`);
    }
  }

  if (schema.computed && isObj(schema.computed)) {
    for (const [key, def] of Object.entries(schema.computed)) {
      validateComputedDef(key, def, `computed.${key}`);
    }
  }

  if (schema.methods && isObj(schema.methods)) {
    for (const [key, def] of Object.entries(schema.methods)) {
      validateMethodsDef(key, def, `methods.${key}`);
    }
  }

  if (schema.watch && isObj(schema.watch)) {
    for (const [key, def] of Object.entries(schema.watch)) {
      validateWatchDef(key, def, `watch.${key}`);
    }
  }

  if (schema.lifecycle && isObj(schema.lifecycle)) {
    for (const [key, def] of Object.entries(schema.lifecycle)) {
      validateLifecycleDef(key, def, `lifecycle.${key}`);
    }
  }

  if (schema.props && isObj(schema.props)) {
    for (const [key, def] of Object.entries(schema.props)) {
      if (!isObj(def)) {
        error(`props.${key}`, 'prop 定义必须为对象');
      } else {
        if (!def.type) {
          warn(`props.${key}`, 'prop 缺少 type 字段');
        }
        if (def.validator && !isFnValue(def.validator)) {
          error(`props.${key}.validator`, 'validator 必须为 $fn 格式');
        }
        pass(`props.${key} valid`);
      }
    }
  }

  if (schema.emits && isObj(schema.emits)) {
    for (const [key, def] of Object.entries(schema.emits)) {
      if (isObj(def) && def.validator && !isFnValue(def.validator)) {
        error(`emits.${key}.validator`, 'validator 必须为 $fn 格式');
      }
      pass(`emits.${key} valid`);
    }
  }

  if (schema.components && isObj(schema.components)) {
    for (const [key, def] of Object.entries(schema.components)) {
      if (!isObj(def)) {
        error(`components.${key}`, '组件定义必须为对象');
      } else {
        if (!def.type) {
          error(`components.${key}`, '缺少 type 字段 (local/async)');
        } else if (!['local', 'async'].includes(def.type)) {
          error(`components.${key}.type`, `"${def.type}" 无效，可选值: local, async`);
        }
        if (!def.source) {
          error(`components.${key}`, '缺少 source 字段');
        }
        pass(`components.${key} valid`);
      }
    }
  }

  if (schema.styles && isObj(schema.styles)) {
    if (!schema.styles.css || !isStr(schema.styles.css)) {
      error('styles', 'styles.css 必须为非空字符串');
    } else {
      pass('styles valid');
    }
  }

  return { errors, warnings, passCount };
}

// ─── Main ───────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(`${BOLD}用法:${RESET} node validate-schema.mjs <schema.json>`);
  console.error(`  验证 JSON schema 是否符合 @json-engine/core-engine 设计规范`);
  process.exit(1);
}

const filePath = resolve(args[0]);
let schema;
try {
  const content = readFileSync(filePath, 'utf-8');
  schema = JSON.parse(content);
} catch (e) {
  console.error(`${RED}${BOLD}读取文件失败:${RESET} ${e.message}`);
  process.exit(1);
}

const result = validateSchema(schema);

// ─── Report ─────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}═══ JSON Schema 验证报告 ═══${RESET}\n`);
console.log(`文件: ${filePath}\n`);

if (result.passCount > 0) {
  console.log(`${GREEN}✓ ${result.passCount} 项检查通过${RESET}`);
}

if (result.warnings.length > 0) {
  console.log(`\n${YELLOW}${BOLD}⚠ 警告 (${result.warnings.length}):${RESET}`);
  for (const w of result.warnings) {
    console.log(`  ${YELLOW}⚠${RESET} [${w.path}] ${w.msg}`);
  }
}

if (result.errors.length > 0) {
  console.log(`\n${RED}${BOLD}✗ 错误 (${result.errors.length}):${RESET}`);
  for (const e of result.errors) {
    console.log(`  ${RED}✗${RESET} [${e.path}] ${e.msg}`);
  }
}

console.log(`\n${BOLD}─────────────────────────${RESET}`);
if (result.errors.length === 0) {
  console.log(`${GREEN}${BOLD}✓ 验证通过${RESET} — Schema 符合 core-engine 设计规范`);
} else {
  console.log(`${RED}${BOLD}✗ 验证失败${RESET} — 发现 ${result.errors.length} 个错误`);
}
console.log(`${BOLD}─────────────────────────${RESET}\n`);

process.exit(result.errors.length > 0 ? 1 : 0);
