import type { SkillExample } from '../types'

const TREE_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个部门管理页面，左侧显示部门树，右侧显示部门详情",
  pageType: 'tree',
  description: '树形结构页面，左侧树右侧详情',
  output: {
    name: "DepartmentsPage",
    state: {
      departments: [],
      selectedDepartment: null,
      expandedKeys: [],
      modalVisible: false,
      editingId: null,
      form: { name: "", code: "", parentId: null }
    },
    computed: {
      treeData: {
        get: "(function() { const build = (parentId) => $state.departments.filter(d => d.parentId === parentId).map(d => ({ key: d.id, title: d.name, data: d, children: build(d.id) })); return build(null); })()"
      },
      expandedKeysList: {
        get: "$state.departments.map(d => d.id)"
      },
      modalTitle: {
        get: "$state.editingId ? '编辑部门' : '新增部门'"
      },
      rootDepartments: {
        get: "$state.departments.filter(d => !d.parentId)"
      }
    },
    methods: {
      fetchDepartments: "$http.get('/departments').then(res => { $state.departments = res; })",
      selectDepartment: "$state.selectedDepartment = $args[0]?.data || null",
      openCreateModal: "$state.editingId = null; $state.form = { name: '', code: '', parentId: $state.selectedDepartment?.id || null }; $state.modalVisible = true",
      openEditModal: "const dept = $state.selectedDepartment; if(!dept) return; $state.editingId = dept.id; $state.form = { name: dept.name, code: dept.code, parentId: dept.parentId }; $state.modalVisible = true",
      handleModalOk: "if(!$state.form.name) { $message.error('请输入部门名称'); return; } if(!$state.form.code) { $message.error('请输入部门编码'); return; } ($state.editingId ? $http.put('/departments/' + $state.editingId, $state.form) : $http.post('/departments', $state.form)).then(() => { $message.success('保存成功'); $state.modalVisible = false; $methods.fetchDepartments(); }).catch(err => { $message.error(err.response?.data?.message || '保存失败'); })",
      handleDelete: "const dept = $state.selectedDepartment; if(!dept) return; $modal.confirm({ title: '确认删除', content: '确定要删除部门「' + dept.name + '」吗？', onOk: () => $http.delete('/departments/' + dept.id).then(() => { $message.success('删除成功'); $state.selectedDepartment = null; $methods.fetchDepartments(); }) })",
      closeModal: "$state.modalVisible = false"
    },
    lifecycle: {
      mounted: "$methods.fetchDepartments()"
    },
    render: {
      type: "div",
      props: { class: "departments-container", style: { display: "flex", height: "100vh" } },
      children: [
        {
          type: "div",
          props: { class: "tree-panel", style: { width: "280px", borderRight: "1px solid #eee", padding: "16px" } },
          children: [
            { type: "h3", children: "部门列表" },
            {
              type: "ATree",
              props: {
                treeData: "$state.treeData",
                selectedKeys: "$state.selectedDepartment ? [$state.selectedDepartment.id] : []",
                expandedKeys: "$state.expandedKeysList",
                showLine: true,
                onSelect: "(keys, info) => { if(keys.length > 0) $methods.selectDepartment(info.node); }"
              }
            }
          ]
        },
        {
          type: "div",
          props: { class: "detail-panel", style: { flex: 1, padding: "16px" } },
          children: [
            {
              type: "div",
              props: { style: { marginBottom: "16px" } },
              children: [
                { type: "AButton", props: { type: "primary", onClick: "$methods.openCreateModal()" }, children: "新增部门" },
                { type: "AButton", props: { style: "margin-left: 8px", disabled: "!$state.selectedDepartment", onClick: "$methods.openEditModal()" }, children: "编辑" },
                { type: "AButton", props: { style: "margin-left: 8px", danger: true, disabled: "!$state.selectedDepartment", onClick: "$methods.handleDelete()" }, children: "删除" }
              ]
            },
            {
              type: "ACard",
              props: { title: "部门详情" },
              children: [
                {
                  type: "ADescriptions",
                  props: { column: 1, bordered: true },
                  children: [
                    { type: "ADescriptionsItem", props: { label: "部门名称" }, children: "{{ $state.selectedDepartment?.name || '-' }}" },
                    { type: "ADescriptionsItem", props: { label: "部门编码" }, children: "{{ $state.selectedDepartment?.code || '-' }}" }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "AModal",
          props: { title: "$state.modalTitle", open: "$state.modalVisible", onOk: "$methods.handleModalOk()", onCancel: "$methods.closeModal()" },
          children: [
            {
              type: "AForm",
              props: { layout: "vertical" },
              children: [
                { type: "AFormItem", props: { label: "部门名称", required: true }, children: [{ type: "AInput", props: { value: "$state.form.name", onInput: "$state.form.name = $event.target.value" } }] },
                { type: "AFormItem", props: { label: "部门编码", required: true }, children: [{ type: "AInput", props: { value: "$state.form.code", onInput: "$state.form.code = $event.target.value" } }] },
                { type: "AFormItem", props: { label: "上级部门" }, children: [{ type: "ASelect", props: { value: "$state.form.parentId", onChange: "$state.form.parentId = $args[0]", options: "$state.rootDepartments.filter(d => d.id !== $state.editingId).map(d => ({ label: d.name, value: d.id }))", allowClear: true, placeholder: "选择上级部门", style: "width: 100%" } }] }
              ]
            }
          ]
        }
      ]
    }
  }
}

export default TREE_PAGE_EXAMPLE