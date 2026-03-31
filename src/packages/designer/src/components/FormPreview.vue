<template>
  <div 
    class="form-preview"
    ref="previewRef"
    @wheel="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <div class="form-preview-loading" v-if="initError">
      <div class="error-message">{{ initError }}</div>
    </div>
    <div class="form-preview-body" :style="bodyStyle" v-else>
      <div class="form-preview-card" :style="cardStyle">
        <component :is="previewComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, onMounted, type Component } from 'vue'
import {
  createComponent,
  getPluginRegistry,
  createCoreScope,
  setCoreScope,
  loadAndInstallPlugins,
  registerGlobalComponents,
  getGlobalComponents,
} from '@json-engine/vue-json'
import { antdPlugin } from '@json-engine/plugin-antd'
import * as Antd from 'ant-design-vue'
import type { DesignNode } from '../types'
import { generateVueJsonSchema } from '../utils/schemaGenerator'

const props = defineProps<{
  tree: DesignNode
  viewportWidth?: number
  viewportHeight?: number
  scale?: number
  panX?: number
  panY?: number
}>()

const emit = defineEmits<{
  'pan-start': [e: MouseEvent]
  'pan-move': [e: MouseEvent]
  'pan-end': []
}>()

const previewRef = ref<HTMLElement | null>(null)
const isPanning = ref(false)
const initError = ref<string | null>(null)
const previewComponent = shallowRef<Component | null>(null)
const isInitialized = ref(false)

const bodyStyle = computed(() => ({
  transform: `scale(${props.scale || 1}) translate(${props.panX || 0}px, ${props.panY || 0}px)`,
  transformOrigin: 'center center',
  cursor: isPanning.value ? 'grabbing' : 'grab',
  willChange: 'transform',
  transition: 'transform 0.1s ease-out'
}))

const cardStyle = computed(() => ({
  width: `${props.viewportWidth || 720}px`,
  height: `${props.viewportHeight || 600}px`
}))

function onWheel(e: WheelEvent) {
  if (e.ctrlKey) {
    e.preventDefault()
  }
}

function onMouseDown(e: MouseEvent) {
  if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('form-preview-body')) {
    isPanning.value = true
    emit('pan-start', e)
  }
}

function onMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    emit('pan-move', e)
  }
}

function onMouseUp() {
  if (isPanning.value) {
    isPanning.value = false
    emit('pan-end')
  }
}

async function initializePlugins() {
  try {
    const registry = getPluginRegistry()
    
    if (!registry.getPlugin('@json-engine/plugin-antd')) {
      registry.register(antdPlugin)
    }
    
    const pluginLoaders: Record<string, () => Promise<unknown>> = {
      '@json-engine/plugin-antd': async () => antdPlugin,
    }
    
    await loadAndInstallPlugins(
      [{ name: '@json-engine/plugin-antd', version: '0.0.1' }],
      { antd: { theme: { primaryColor: '#1890ff' } } },
      pluginLoaders as Record<string, () => Promise<import('@json-engine/vue-json').VueJsonPlugin>>
    )
    
    const scopeExtensions = registry.getScopeExtensions()
    const coreScope = createCoreScope()
    Object.assign(coreScope, scopeExtensions)
    setCoreScope(coreScope)
    
    registerGlobalComponents({
      AForm: Antd.Form,
      AFormItem: Antd.FormItem,
      AInput: Antd.Input,
      AInputPassword: Antd.InputPassword,
      AInputGroup: Antd.InputGroup,
      AInputNumber: Antd.InputNumber,
      ASelect: Antd.Select,
      ASelectOption: Antd.SelectOption,
      ARadio: Antd.Radio,
      ARadioGroup: Antd.RadioGroup,
      ACheckbox: Antd.Checkbox,
      ACheckboxGroup: Antd.CheckboxGroup,
      ASwitch: Antd.Switch,
      ACascader: Antd.Cascader,
      ATreeSelect: Antd.TreeSelect,
      ADatePicker: Antd.DatePicker,
      ARangePicker: Antd.RangePicker,
      ATimePicker: Antd.TimePicker,
      AUpload: Antd.Upload,
      ADivider: Antd.Divider,
      ARate: Antd.Rate,
      ASlider: Antd.Slider,
      ATransfer: Antd.Transfer,
      ATable: Antd.Table,
      ATree: Antd.Tree,
      ATreeNode: Antd.TreeNode,
      ATreeSelect: Antd.TreeSelect,
      ATreeSelectNode: Antd.TreeSelectNode,
      AList: Antd.List,
      AListItem: Antd.List.Item,
      AListItemMeta: Antd.List.Item.Meta,
      ADescriptions: Antd.Descriptions,
      ADescriptionsItem: Antd.Descriptions.Item,
      AStatistic: Antd.Statistic,
      ATimeline: Antd.Timeline,
      ATimelineItem: Antd.Timeline.Item,
      ATag: Antd.Tag,
      ABadge: Antd.Badge,
      AButton: Antd.Button,
      AModal: Antd.Modal,
      ADrawer: Antd.Drawer,
      APopconfirm: Antd.Popconfirm,
      APagination: Antd.Pagination,
      ASteps: Antd.Steps,
      AStep: Antd.Steps.Step,
      AAlert: Antd.Alert,
      ASpin: Antd.Spin,
      AResult: Antd.Result,
      ACard: Antd.Card,
      ATabs: Antd.Tabs,
      ATabPane: Antd.Tabs.TabPane,
      ARow: Antd.Row,
      ACol: Antd.Col,
      ALayout: Antd.Layout,
      ALayoutHeader: Antd.Layout.Header,
      ALayoutFooter: Antd.Layout.Footer,
      ALayoutSider: Antd.Layout.Sider,
      ALayoutContent: Antd.Layout.Content,
      ASpace: Antd.Space,
      AAvatar: Antd.Avatar,
      ABackTop: Antd.BackTop,
      ABreadcrumb: Antd.Breadcrumb,
      ABreadcrumbItem: Antd.Breadcrumb.Item,
      ACalendar: Antd.Calendar,
      ACarousel: Antd.Carousel,
      ACollapse: Antd.Collapse,
      ACollapsePanel: Antd.Collapse.Panel,
      AConfigProvider: Antd.ConfigProvider,
      ADropdown: Antd.Dropdown,
      ADropdownButton: Antd.Dropdown.Button,
      AEmpty: Antd.Empty,
      AImage: Antd.Image,
      AImagePreviewGroup: Antd.ImagePreviewGroup,
      AAnchor: Antd.Anchor,
      AAnchorLink: Antd.Anchor.Link,
      AButtonGroup: Antd.Button.Group,
      AMenu: Antd.Menu,
      AMenuItem: Antd.Menu.Item,
      ASubMenu: Antd.Menu.SubMenu,
      AProgress: Antd.Progress,
      ASkeleton: Antd.Skeleton,
      AAutoComplete: Antd.AutoComplete,
      AMentions: Antd.Mentions,
    })
    
    isInitialized.value = true
  } catch (error) {
    initError.value = error instanceof Error ? error.message : 'Failed to initialize plugins'
    console.error('[FormPreview] Plugin initialization failed:', error)
  }
}

function updatePreviewComponent() {
  if (!isInitialized.value || !props.tree) {
    return
  }
  
  try {
    const schema = generateVueJsonSchema(props.tree)
    const globalComponents = getGlobalComponents()
    previewComponent.value = createComponent(schema, {
      cache: false,
      injectStyles: true,
      extraComponents: globalComponents,
    })
  } catch (error) {
    console.error('[FormPreview] Component creation failed:', error)
  }
}

onMounted(async () => {
  await initializePlugins()
  updatePreviewComponent()
})
</script>

<style scoped>
.form-preview { position: absolute; inset: 0; overflow: auto; background: #f0f2f5; }
.form-preview-loading { display: flex; align-items: center; justify-content: center; height: 100%; }
.error-message { padding: 16px; background: #fff1f0; border: 1px solid #ffccc7; border-radius: 4px; color: #ff4d4f; }
.form-preview-body { min-width: min-content; min-height: 100%; padding: 16px; display: flex; justify-content: center; align-items: flex-start; box-sizing: border-box; }
.form-preview-card { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.12); box-sizing: border-box; flex-shrink: 0; overflow: auto; }
</style>
