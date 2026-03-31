import type { Component } from 'vue'
import * as Antd from 'ant-design-vue'

interface AntdComponentDefinition {
  name: string
  component: Component
  subComponents?: AntdComponentDefinition[]
}

const basicComponents: AntdComponentDefinition[] = [
  { name: 'AForm', component: Antd.Form },
  { name: 'AFormItem', component: Antd.FormItem },
  { name: 'AInput', component: Antd.Input },
  { name: 'AInputPassword', component: Antd.Input.Password },
  { name: 'AInputGroup', component: Antd.Input.Group },
  { name: 'AInputNumber', component: Antd.InputNumber },
  { name: 'ATextArea', component: Antd.Input.TextArea },
  {
    name: 'ASelect',
    component: Antd.Select,
    subComponents: [
      { name: 'ASelectOption', component: Antd.SelectOption },
      { name: 'ASelectOptGroup', component: Antd.SelectOptGroup },
    ],
  },
  { name: 'ARadio', component: Antd.Radio },
  { name: 'ARadioGroup', component: Antd.Radio.Group },
  { name: 'ACheckbox', component: Antd.Checkbox },
  { name: 'ACheckboxGroup', component: Antd.Checkbox.Group },
  { name: 'ASwitch', component: Antd.Switch },
  { name: 'ASlider', component: Antd.Slider },
  { name: 'ARate', component: Antd.Rate },
  { name: 'ACascader', component: Antd.Cascader },
  { name: 'ADatePicker', component: Antd.DatePicker },
  { name: 'ARangePicker', component: Antd.RangePicker },
  { name: 'ATimePicker', component: Antd.TimePicker },
  { name: 'AUpload', component: Antd.Upload },
  { name: 'ATransfer', component: Antd.Transfer },
  { name: 'ATable', component: Antd.Table },
  {
    name: 'ATree',
    component: Antd.Tree,
    subComponents: [{ name: 'ATreeNode', component: Antd.TreeNode }],
  },
  {
    name: 'ATreeSelect',
    component: Antd.TreeSelect,
    subComponents: [{ name: 'ATreeSelectNode', component: Antd.TreeSelectNode }],
  },
  {
    name: 'AList',
    component: Antd.List,
    subComponents: [
      { name: 'AListItem', component: Antd.List.Item },
      { name: 'AListItemMeta', component: Antd.List.Item.Meta },
    ],
  },
  { name: 'ACard', component: Antd.Card },
  {
    name: 'ADescriptions',
    component: Antd.Descriptions,
    subComponents: [{ name: 'ADescriptionsItem', component: Antd.Descriptions.Item }],
  },
  { name: 'AStatistic', component: Antd.Statistic },
  {
    name: 'ATimeline',
    component: Antd.Timeline,
    subComponents: [{ name: 'ATimelineItem', component: Antd.Timeline.Item }],
  },
  { name: 'ATag', component: Antd.Tag },
  { name: 'ABadge', component: Antd.Badge },
  { name: 'AAvatar', component: Antd.Avatar },
  {
    name: 'AButton',
    component: Antd.Button,
    subComponents: [{ name: 'AButtonGroup', component: Antd.Button.Group }],
  },
  {
    name: 'ATabs',
    component: Antd.Tabs,
    subComponents: [{ name: 'ATabPane', component: Antd.Tabs.TabPane }],
  },
  {
    name: 'AMenu',
    component: Antd.Menu,
    subComponents: [
      { name: 'AMenuItem', component: Antd.Menu.Item },
      { name: 'ASubMenu', component: Antd.Menu.SubMenu },
      { name: 'AMenuItemGroup', component: Antd.Menu.ItemGroup },
    ],
  },
  {
    name: 'ABreadcrumb',
    component: Antd.Breadcrumb,
    subComponents: [{ name: 'ABreadcrumbItem', component: Antd.Breadcrumb.Item }],
  },
  { name: 'APagination', component: Antd.Pagination },
  {
    name: 'ASteps',
    component: Antd.Steps,
    subComponents: [{ name: 'AStep', component: Antd.Steps.Step }],
  },
  { name: 'AAlert', component: Antd.Alert },
  { name: 'AModal', component: Antd.Modal },
  { name: 'ADrawer', component: Antd.Drawer },
  { name: 'AProgress', component: Antd.Progress },
  { name: 'ASpin', component: Antd.Spin },
  { name: 'ASkeleton', component: Antd.Skeleton },
  { name: 'AResult', component: Antd.Result },
  { name: 'APopconfirm', component: Antd.Popconfirm },
  {
    name: 'ALayout',
    component: Antd.Layout,
    subComponents: [
      { name: 'ALayoutHeader', component: Antd.Layout.Header },
      { name: 'ALayoutFooter', component: Antd.Layout.Footer },
      { name: 'ALayoutSider', component: Antd.Layout.Sider },
      { name: 'ALayoutContent', component: Antd.Layout.Content },
    ],
  },
  { name: 'ARow', component: Antd.Row },
  { name: 'ACol', component: Antd.Col },
  { name: 'ASpace', component: Antd.Space },
  { name: 'ADivider', component: Antd.Divider },
  { name: 'AConfigProvider', component: Antd.ConfigProvider },
  {
    name: 'ADropdown',
    component: Antd.Dropdown,
    subComponents: [{ name: 'ADropdownButton', component: Antd.Dropdown.Button }],
  },
  { name: 'AEmpty', component: Antd.Empty },
  {
    name: 'AImage',
    component: Antd.Image,
    subComponents: [{ name: 'AImagePreviewGroup', component: Antd.ImagePreviewGroup }],
  },
  {
    name: 'AAnchor',
    component: Antd.Anchor,
    subComponents: [{ name: 'AAnchorLink', component: Antd.Anchor.Link }],
  },
  { name: 'ABackTop', component: Antd.BackTop },
  { name: 'ACalendar', component: Antd.Calendar },
  { name: 'ACarousel', component: Antd.Carousel },
  {
    name: 'ACollapse',
    component: Antd.Collapse,
    subComponents: [{ name: 'ACollapsePanel', component: Antd.Collapse.Panel }],
  },
  { name: 'AAutoComplete', component: Antd.AutoComplete },
  { name: 'AMentions', component: Antd.Mentions },
]

export function getAntdComponents(): Record<string, Component> {
  const result: Record<string, Component> = {}

  function flatten(defs: AntdComponentDefinition[]) {
    for (const def of defs) {
      result[def.name] = def.component
      if (def.subComponents) {
        flatten(def.subComponents)
      }
    }
  }

  flatten(basicComponents)
  return result
}

export function getAntdComponentCategories() {
  return {
    form: [
      'AForm',
      'AFormItem',
      'AInput',
      'AInputPassword',
      'AInputNumber',
      'ATextArea',
      'ASelect',
      'ARadioGroup',
      'ACheckboxGroup',
      'ASwitch',
      'ASlider',
      'ARate',
      'ACascader',
      'ADatePicker',
      'ATimePicker',
      'AUpload',
      'ATransfer',
    ],
    display: [
      'ATable',
      'ATree',
      'ATreeSelect',
      'AList',
      'ACard',
      'ADescriptions',
      'AStatistic',
      'ATimeline',
      'ATag',
      'ABadge',
      'AAvatar',
    ],
    navigation: [
      'AButton',
      'AButtonGroup',
      'ATabs',
      'AMenu',
      'ABreadcrumb',
      'APagination',
      'ASteps',
    ],
    feedback: [
      'AAlert',
      'AModal',
      'ADrawer',
      'AProgress',
      'ASpin',
      'ASkeleton',
      'AResult',
      'APopconfirm',
    ],
    layout: ['ALayout', 'ARow', 'ACol', 'ASpace', 'ADivider'],
  }
}