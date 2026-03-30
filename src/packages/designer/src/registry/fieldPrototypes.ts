import type { FieldPrototype } from '../types'

const basicPropEditors = [
  { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
  { name: 'placeholder', label: '占位提示', setter: 'string', group: 'basic', placeholder: '请输入...' },
  { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
  { name: 'size', label: '尺寸', setter: 'select', group: 'layout', options: [
    { label: '默认', value: 'middle' },
    { label: '大', value: 'large' },
    { label: '小', value: 'small' }
  ]},
  { name: 'allowClear', label: '允许清除', setter: 'boolean', group: 'basic', default: false }
]

const validationEditors = [
  { name: 'required', label: '必填', setter: 'boolean', group: 'validation', default: false },
  { name: 'rules', label: '校验规则', setter: 'json', group: 'validation', placeholder: '[]' }
]

export const defaultPrototypes: FieldPrototype[] = [
  {
    type: 'AForm', label: '表单', icon: '📋', category: 'layout', isContainer: true, locked: true,
    defaultProps: { layout: 'vertical' },
    propEditors: [
      { name: 'layout', label: '布局方式', setter: 'select', group: 'layout', options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
        { label: '内联', value: 'inline' }
      ]},
      { name: 'labelCol', label: '标签宽度', setter: 'json', group: 'layout', placeholder: '{ span: 6 }' },
      { name: 'wrapperCol', label: '内容宽度', setter: 'json', group: 'layout', placeholder: '{ span: 18 }' },
      { name: 'size', label: '组件尺寸', setter: 'select', group: 'layout', options: [
        { label: '默认', value: 'middle' },
        { label: '大', value: 'large' },
        { label: '小', value: 'small' }
      ]}
    ]
  },
  {
    type: 'AFormItem', label: '表单项', icon: '📦', category: 'layout', isContainer: true,
    defaultProps: { label: '字段标签', name: '' },
    propEditors: [
      { name: 'label', label: '标签文本', setter: 'string', group: 'basic', placeholder: '字段标签' },
      { name: 'name', label: '字段名', setter: 'string', group: 'basic', placeholder: 'fieldName' },
      { name: 'required', label: '必填', setter: 'boolean', group: 'validation', default: false },
      { name: 'rules', label: '校验规则', setter: 'json', group: 'validation', placeholder: '[]' },
      { name: 'extra', label: '提示信息', setter: 'string', group: 'basic', placeholder: '请输入...' },
      { name: 'colon', label: '显示冒号', setter: 'boolean', group: 'layout', default: true }
    ]
  },
  {
    type: 'AInput', label: '输入框', icon: '✏️', category: 'basic', wrapIn: 'AFormItem',
    defaultProps: { placeholder: '请输入' },
    propEditors: [
      ...basicPropEditors,
      { name: 'maxlength', label: '最大长度', setter: 'number', group: 'basic' },
      { name: 'showCount', label: '显示字数', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'AInputPassword', label: '密码框', icon: '🔒', category: 'basic', wrapIn: 'AFormItem',
    defaultProps: { placeholder: '请输入密码' },
    propEditors: [
      ...basicPropEditors,
      { name: 'visibilityToggle', label: '显示切换按钮', setter: 'boolean', group: 'basic', default: true },
      ...validationEditors
    ]
  },
  {
    type: 'ATextArea', label: '文本域', icon: '📝', category: 'basic', wrapIn: 'AFormItem',
    defaultProps: { placeholder: '请输入', rows: 4 },
    propEditors: [
      ...basicPropEditors,
      { name: 'rows', label: '行数', setter: 'number', group: 'basic', default: 4 },
      { name: 'maxlength', label: '最大长度', setter: 'number', group: 'basic' },
      { name: 'showCount', label: '显示字数', setter: 'boolean', group: 'basic', default: false },
      { name: 'autoSize', label: '自适应高度', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'AInputNumber', label: '数字输入框', icon: '🔢', category: 'basic', wrapIn: 'AFormItem',
    defaultProps: { placeholder: '请输入', style: 'width: 100%' },
    propEditors: [
      ...basicPropEditors,
      { name: 'min', label: '最小值', setter: 'number', group: 'basic' },
      { name: 'max', label: '最大值', setter: 'number', group: 'basic' },
      { name: 'step', label: '步长', setter: 'number', group: 'basic', default: 1 },
      ...validationEditors
    ]
  },
  {
    type: 'ASelect', label: '下拉选择', icon: '🔽', category: 'selection', wrapIn: 'AFormItem', isContainer: true,
    defaultProps: { placeholder: '请选择', style: 'width: 100%' },
    propEditors: [
      ...basicPropEditors,
      { name: 'mode', label: '模式', setter: 'select', group: 'basic', options: [
        { label: '单选', value: undefined },
        { label: '多选', value: 'multiple' }
      ]},
      { name: 'options', label: '选项数据', setter: 'json', group: 'basic', placeholder: '[{ label: "选项1", value: "1" }]' },
      ...validationEditors
    ]
  },
  {
    type: 'ARadioGroup', label: '单选组', icon: '🔘', category: 'selection', wrapIn: 'AFormItem', isContainer: true,
    defaultProps: {},
    propEditors: [
      { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'options', label: '选项数据', setter: 'json', group: 'basic', placeholder: '[{ label: "选项1", value: "1" }]' },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'ACheckboxGroup', label: '多选组', icon: '☑️', category: 'selection', wrapIn: 'AFormItem', isContainer: true,
    defaultProps: {},
    propEditors: [
      { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'options', label: '选项数据', setter: 'json', group: 'basic', placeholder: '[{ label: "选项1", value: "1" }]' },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'ASwitch', label: '开关', icon: '🔀', category: 'selection', wrapIn: 'AFormItem',
    propEditors: [
      { name: 'v-model:checked', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      { name: 'checkedChildren', label: '选中文案', setter: 'string', group: 'basic', placeholder: '开' },
      { name: 'unCheckedChildren', label: '未选文案', setter: 'string', group: 'basic', placeholder: '关' }
    ]
  },
  {
    type: 'ADatePicker', label: '日期选择', icon: '📅', category: 'date', wrapIn: 'AFormItem',
    defaultProps: { style: 'width: 100%' },
    propEditors: [
      { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'placeholder', label: '占位提示', setter: 'string', group: 'basic', placeholder: '请选择日期' },
      { name: 'format', label: '日期格式', setter: 'string', group: 'basic', placeholder: 'YYYY-MM-DD' },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      { name: 'allowClear', label: '允许清除', setter: 'boolean', group: 'basic', default: true },
      { name: 'showTime', label: '显示时间', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'ATimePicker', label: '时间选择', icon: '⏰', category: 'date', wrapIn: 'AFormItem',
    defaultProps: { style: 'width: 100%' },
    propEditors: [
      { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'placeholder', label: '占位提示', setter: 'string', group: 'basic', placeholder: '请选择时间' },
      { name: 'format', label: '时间格式', setter: 'string', group: 'basic', placeholder: 'HH:mm:ss' },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      { name: 'allowClear', label: '允许清除', setter: 'boolean', group: 'basic', default: true },
      ...validationEditors
    ]
  },
  {
    type: 'ACascader', label: '级联选择', icon: '🌳', category: 'advanced', wrapIn: 'AFormItem',
    defaultProps: { placeholder: '请选择', style: 'width: 100%' },
    propEditors: [
      ...basicPropEditors,
      { name: 'options', label: '选项数据', setter: 'json', group: 'basic', placeholder: '[{ label: "选项", value: "1" }]' },
      { name: 'multiple', label: '多选', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'AUpload', label: '上传', icon: '📤', category: 'advanced', wrapIn: 'AFormItem',
    propEditors: [
      { name: 'action', label: '上传地址', setter: 'string', group: 'basic', placeholder: '/api/upload' },
      { name: 'name', label: '文件字段名', setter: 'string', group: 'basic', placeholder: 'file' },
      { name: 'multiple', label: '多文件', setter: 'boolean', group: 'basic', default: false },
      { name: 'accept', label: '文件类型', setter: 'string', group: 'basic', placeholder: '.jpg,.png,.pdf' },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false }
    ]
  },
  {
    type: 'ARate', label: '评分', icon: '⭐', category: 'advanced', wrapIn: 'AFormItem',
    propEditors: [
      { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'count', label: '总数', setter: 'number', group: 'basic', default: 5 },
      { name: 'allowHalf', label: '允许半星', setter: 'boolean', group: 'basic', default: false },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'ASlider', label: '滑动条', icon: '🎚️', category: 'advanced', wrapIn: 'AFormItem',
    propEditors: [
      { name: 'v-model:value', label: '绑定字段', setter: 'expression', group: 'basic', placeholder: '$state.formData.fieldName' },
      { name: 'min', label: '最小值', setter: 'number', group: 'basic', default: 0 },
      { name: 'max', label: '最大值', setter: 'number', group: 'basic', default: 100 },
      { name: 'step', label: '步长', setter: 'number', group: 'basic', default: 1 },
      { name: 'range', label: '双滑块', setter: 'boolean', group: 'basic', default: false },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false },
      ...validationEditors
    ]
  },
  {
    type: 'ATransfer', label: '穿梭框', icon: '↔️', category: 'advanced', wrapIn: 'AFormItem',
    propEditors: [
      { name: 'v-model:targetKeys', label: '目标数据', setter: 'expression', group: 'basic', placeholder: '$state.formData.selected' },
      { name: 'dataSource', label: '数据源', setter: 'json', group: 'basic', placeholder: '[{ key: "1", title: "选项1" }]' },
      { name: 'titles', label: '标题', setter: 'json', group: 'basic', placeholder: '["源列表", "目标列表"]' },
      { name: 'showSearch', label: '显示搜索', setter: 'boolean', group: 'basic', default: false },
      { name: 'disabled', label: '禁用', setter: 'boolean', group: 'basic', default: false }
    ]
  }
]