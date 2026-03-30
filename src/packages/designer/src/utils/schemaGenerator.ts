import type { DesignNode, ApiEndpoint, DataSourceRef } from '../types'
import type {
  VueJsonSchema,
  VNodeDefinition,
  VNodeChildren,
  StateDefinition,
  MethodsDefinition,
  FunctionValue,
  StateRef,
  PropertyValue,
  StateItemDefinition,
} from '@json-engine/vue-json/types'
import { collectVModelPaths } from './treeOperations'

function toFunctionValue(expression: string): FunctionValue {
  return {
    _type: 'function',
    params: {},
    body: `{{${expression}}}`,
  } as unknown as FunctionValue
}

function designNodeToVNode(
  node: DesignNode,
  methods: MethodsDefinition,
  collectedStateFields: Set<string>
): VNodeDefinition {
  const vnode: VNodeDefinition = { type: node.type }
  const props: Record<string, PropertyValue> = {}
  const directives: VNodeDefinition['directives'] = {}

  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      if (key.startsWith('v-model:')) {
        const modelProp = key.replace('v-model:', '')
        const statePath = value as string
        const stateVar = statePath.replace('formData.', 'formData_').replace(/\./g, '_')
        
        directives.vModel = {
          prop: { _type: 'reference', prefix: 'state', variable: stateVar } as StateRef,
          event: modelProp === 'value' ? 'update:value' : `update:${modelProp}`,
        }
        
        collectedStateFields.add(stateVar)
      } else if (key === 'options' && Array.isArray(value)) {
        props[key] = value as unknown as PropertyValue
      } else if (value !== undefined && value !== null) {
        props[key] = value as unknown as PropertyValue
      }
    }
  }

  if (node.style && Object.keys(node.style).length > 0) {
    props.style = node.style as unknown as PropertyValue
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
        directives.vOn[directiveName] = toFunctionValue(`methods.${methodName}()`)
      }
    }
  }

  if (node.dataSource?.apiId) {
    const ds = node.dataSource
    const stateVar = `ds_${ds.apiId}`
    collectedStateFields.add(stateVar)
    
    const loadMethod = `loadData_${ds.apiId}`
    const apiCall = ds.autoLoad !== false 
      ? `$_[core]_api.get('/api/${ds.apiId}')`
      : `$_[core]_api.post('/api/${ds.apiId}')`
    
    methods[loadMethod] = {
      _type: 'function',
      params: {},
      body: `{{${apiCall}.then(function(d){ref_state_${stateVar}=d})}}`,
    } as unknown as FunctionValue
  }

  if (Object.keys(props).length > 0) {
    vnode.props = props
  }

  if (Object.keys(directives).length > 0) {
    vnode.directives = directives
  }

  if (node.children?.length) {
    vnode.children = node.children.map(c => 
      designNodeToVNode(c, methods, collectedStateFields)
    ) as VNodeChildren
  }

  if (node.slots) {
    for (const [, nodes] of Object.entries(node.slots)) {
      if (nodes.length === 1) {
        const slotContent = designNodeToVNode(nodes[0], methods, collectedStateFields)
        if (!vnode.children) vnode.children = []
        ;(vnode.children as VNodeDefinition[]).push({
          type: 'div',
          props: {},
          children: [slotContent],
        } as unknown as VNodeDefinition)
      } else if (nodes.length > 1) {
        const slotChildren = nodes.map(n => designNodeToVNode(n, methods, collectedStateFields))
        const slotContent: VNodeDefinition = {
          type: 'div',
          props: {},
          children: slotChildren,
        }
        if (!vnode.children) vnode.children = []
        ;(vnode.children as VNodeDefinition[]).push(slotContent)
      }
    }
  }

  return vnode
}

function collectStateFields(tree: DesignNode, fields: Set<string>): void {
  if (tree.props) {
    for (const [key, value] of Object.entries(tree.props)) {
      if (key.startsWith('v-model:') && typeof value === 'string') {
        const stateVar = value.replace('formData.', 'formData_').replace(/\./g, '_')
        fields.add(stateVar)
      }
    }
  }
  
  if (tree.dataSource?.apiId) {
    fields.add(`ds_${tree.dataSource.apiId}`)
  }
  
  if (tree.children) {
    for (const child of tree.children) {
      collectStateFields(child, fields)
    }
  }
  
  if (tree.slots) {
    for (const nodes of Object.values(tree.slots)) {
      for (const node of nodes) {
        collectStateFields(node, fields)
      }
    }
  }
}

export function generateVueJsonSchema(
  tree: DesignNode,
  formName?: string,
  apiList?: ApiEndpoint[]
): VueJsonSchema {
  const methods: MethodsDefinition = {}
  const state: StateDefinition = {}
  const collectedFields = new Set<string>()
  
  const vnode = designNodeToVNode(tree, methods, collectedFields)
  
  collectStateFields(tree, collectedFields)
  
  for (const field of collectedFields) {
    if (!state[field]) {
      if (field.startsWith('ds_')) {
        state[field] = { type: 'ref', initial: null } as unknown as StateItemDefinition
      } else {
        state[field] = { type: 'ref', initial: '' } as unknown as StateItemDefinition
      }
    }
  }
  
  const vModelPaths = collectVModelPaths(tree)
  for (const p of vModelPaths) {
    const stateVar = p.replace('formData.', 'formData_').replace(/\./g, '_')
    if (!state[stateVar]) {
      state[stateVar] = { type: 'ref', initial: '' } as unknown as StateItemDefinition
    }
  }
  
  if (vModelPaths.length > 0) {
    state.formData = { type: 'reactive', initial: {} } as unknown as StateItemDefinition
  }
  
  const schema: VueJsonSchema = {
    name: formName || 'DesignedForm',
    render: { type: 'template', content: vnode },
  }
  
  if (Object.keys(state).length > 0) {
    schema.state = state
  }
  
  if (Object.keys(methods).length > 0) {
    schema.methods = methods
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
        if (!schema.methods) schema.methods = {}
        schema.methods[initMethod] = {
          _type: 'function',
          params: {},
          body: `{{$_[core]_api.${ref.autoLoad !== false ? 'get' : 'post'}('${api.url}').then(function(d){ref_state_ds_${apiId}=d})}}`,
        } as unknown as FunctionValue
        
        if (!schema.lifecycle) schema.lifecycle = {}
        schema.lifecycle.onMounted = {
          _type: 'function',
          params: {},
          body: `{{methods.${initMethod}()}}`,
        } as unknown as FunctionValue
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
