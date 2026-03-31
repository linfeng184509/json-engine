import type { DesignNode, ApiEndpoint, DataSourceRef } from '../types'
import type { VueJsonSchema } from '@json-engine/vue-json'

function toFunctionValue(expression: string): { type: 'function'; params: string; body: string } {
  return {
    type: 'function',
    params: '{{{}}}',
    body: `{{${expression}}}`,
  }
}

function toStringValue(value: unknown): { type: 'string'; body: string } {
  return {
    type: 'string',
    body: `'${String(value)}'`,
  }
}

function designNodeToVNode(
  node: DesignNode,
  methods: Record<string, { type: 'function'; params: string; body: string }>,
  stateRefs: Set<string>
): Record<string, unknown> {
  const vnode: Record<string, unknown> = { type: node.type }
  const props: Record<string, unknown> = {}
  const directives: Record<string, unknown> = {}

  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      if (key.startsWith('v-model:')) {
        const modelProp = key.replace('v-model:', '')
        const statePath = value as string
        const refExpr = statePath.replace('$state.', 'ref_state_')

        directives.vModel = {
          prop: { type: 'state', body: `{{${refExpr}}}` },
          event: modelProp === 'value' ? 'update:value' : `update:${modelProp}`,
        }

        stateRefs.add(refExpr)
      } else if (key === 'options' && Array.isArray(value)) {
        props[key] = value
      } else if (typeof value === 'string') {
        props[key] = toStringValue(value)
      } else if (typeof value === 'number') {
        props[key] = { type: 'number', body: String(value) }
      } else if (typeof value === 'boolean') {
        props[key] = { type: 'boolean', body: String(value) }
      } else if (value !== undefined && value !== null) {
        props[key] = value
      }
    }
  }

  if (node.style && Object.keys(node.style).length > 0) {
    props.style = node.style
  }

  if (node.events) {
    for (const [eventName, handler] of Object.entries(node.events)) {
      if (handler) {
        const methodName = `handle_${eventName.replace(/^on/, '')}`
        methods[methodName] = toFunctionValue(handler)

        const directiveName = eventName === 'onClick' ? 'click'
          : eventName === 'onChange' ? 'change'
          : eventName === 'onInput' ? 'input'
          : eventName === 'onSubmit' ? 'submit'
          : eventName === 'onFocus' ? 'focus'
          : eventName === 'onBlur' ? 'blur'
          : eventName === 'onKeydown' ? 'keydown'
          : eventName === 'onKeyup' ? 'keyup'
          : eventName

        directives.vOn = directives.vOn || {}
        ;(directives.vOn as Record<string, unknown>)[directiveName] = toFunctionValue(`methods.${methodName}()`)
      }
    }
  }

  if (node.dataSource?.apiId) {
    const ds = node.dataSource
    const stateVar = `ref_state_ds_${ds.apiId}`
    stateRefs.add(stateVar)

    const loadMethod = `loadData_${ds.apiId}`
    const apiCall = ds.autoLoad !== false
      ? `$_[core]_api.get('/api/${ds.apiId}')`
      : `$_[core]_api.post('/api/${ds.apiId}')`

    methods[loadMethod] = toFunctionValue(`${apiCall}.then(function(d){${stateVar}=d})`)
  }

  if (Object.keys(props).length > 0) {
    vnode.props = props
  }

  if (Object.keys(directives).length > 0) {
    vnode.directives = directives
  }

  if (node.children?.length) {
    vnode.children = node.children.map(c =>
      designNodeToVNode(c, methods, stateRefs)
    )
  }

  if (node.slots) {
    for (const [, nodes] of Object.entries(node.slots)) {
      if (nodes.length === 1) {
        const slotContent = designNodeToVNode(nodes[0], methods, stateRefs)
        if (!vnode.children) vnode.children = []
        vnode.children.push({
          type: 'div',
          props: {},
          children: [slotContent],
        })
      } else if (nodes.length > 1) {
        const slotChildren = nodes.map(n => designNodeToVNode(n, methods, stateRefs))
        if (!vnode.children) vnode.children = []
        vnode.children.push({
          type: 'div',
          props: {},
          children: slotChildren,
        })
      }
    }
  }

  return vnode
}

function collectStateRefs(tree: DesignNode, refs: Set<string>): void {
  if (tree.props) {
    for (const [key, value] of Object.entries(tree.props)) {
      if (key.startsWith('v-model:') && typeof value === 'string') {
        const refExpr = value.replace('$state.', 'ref_state_')
        refs.add(refExpr)
      }
    }
  }

  if (tree.dataSource?.apiId) {
    refs.add(`ref_state_ds_${tree.dataSource.apiId}`)
  }

  if (tree.children) {
    for (const child of tree.children) {
      collectStateRefs(child, refs)
    }
  }

  if (tree.slots) {
    for (const nodes of Object.values(tree.slots)) {
      for (const node of nodes) {
        collectStateRefs(node, refs)
      }
    }
  }
}

export function generateVueJsonSchema(
  tree: DesignNode,
  formName?: string,
  apiList?: ApiEndpoint[]
): VueJsonSchema {
  const methods: Record<string, { type: 'function'; params: string; body: string }> = {}
  const state: Record<string, { type: string; initial?: unknown }> = {}
  const stateRefs = new Set<string>()

  const vnode = designNodeToVNode(tree, methods, stateRefs)

  collectStateRefs(tree, stateRefs)

  for (const ref of stateRefs) {
    if (ref.startsWith('ref_state_ds_')) {
      const varName = ref.replace('ref_state_ds_', '')
      if (!state[varName]) {
        state[varName] = { type: 'ref', initial: null }
      }
    } else {
      const varName = ref.replace('ref_state_', '')
      const dotIndex = varName.indexOf('.')
      if (dotIndex > 0) {
        const baseName = varName.substring(0, dotIndex)
        const pathParts = varName.substring(dotIndex + 1).split('.')
        if (!state[baseName]) {
          state[baseName] = { type: 'reactive', initial: {} }
        }
        const initial = (state[baseName] as { type: string; initial: Record<string, unknown> }).initial
        let current = initial
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {}
          }
          current = current[pathParts[i]] as Record<string, unknown>
        }
        if (!(pathParts[pathParts.length - 1] in current)) {
          current[pathParts[pathParts.length - 1]] = ''
        }
      } else {
        if (!state[varName]) {
          state[varName] = { type: 'ref', initial: '' }
        }
      }
    }
  }

  const schema: VueJsonSchema = {
    name: formName || 'DesignedForm',
    render: { type: 'template', content: vnode as VueJsonSchema['render'] extends { content: infer C } ? C : never },
  }

  if (Object.keys(state).length > 0) {
    schema.state = state as VueJsonSchema['state']
  }

  if (Object.keys(methods).length > 0) {
    schema.methods = methods as VueJsonSchema['methods']
  }

  const apiRefs = new Map<string, DataSourceRef>()
  function collectApis(t: DesignNode): void {
    if (t.dataSource?.apiId) apiRefs.set(t.dataSource.apiId, t.dataSource)
    if (t.children) for (const c of t.children) collectApis(c)
    if (t.slots) for (const ns of Object.values(t.slots)) for (const c of ns) collectApis(c)
  }
  collectApis(tree)

  if (apiRefs.size > 0 && apiList?.length) {
    for (const [apiId, ref] of apiRefs) {
      const api = apiList.find(a => a.id === apiId)
      if (api) {
        const initMethod = `initData_${apiId}`
        if (!schema.methods) schema.methods = {} as VueJsonSchema['methods']
        ;(schema.methods as Record<string, unknown>)[initMethod] = toFunctionValue(
          `$_[core]_api.${ref.autoLoad !== false ? 'get' : 'post'}('${api.url}').then(function(d){ref_state_ds_${apiId}=d})`
        )

        if (!schema.lifecycle) schema.lifecycle = {} as VueJsonSchema['lifecycle']
        ;(schema.lifecycle as Record<string, unknown>).onMounted = toFunctionValue(`methods.${initMethod}()`)
      }
    }
  }

  return schema
}

export function generateJsonVueDef(
  tree: DesignNode,
  formName?: string,
  apiList?: ApiEndpoint[]
): VueJsonSchema {
  return generateVueJsonSchema(tree, formName, apiList)
}
