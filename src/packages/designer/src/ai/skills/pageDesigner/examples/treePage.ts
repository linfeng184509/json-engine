import type { SkillExample } from '../types'

const TREE_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个部门管理页面，左侧显示部门树，右侧显示部门详情",
  pageType: 'tree',
  description: '树形结构页面，左侧树右侧详情 - core-engine 格式',
  output: {
    name: "DepartmentsPage",
    state: {
      departments: { type: 'reactive', initial: [] },
      selectedDepartment: { type: 'ref', initial: null },
      expandedKeys: { type: 'reactive', initial: [] },
      modalVisible: { type: 'ref', initial: false },
      editingId: { type: 'ref', initial: null },
      form: { type: 'reactive', initial: { name: '', code: '', parentId: null } }
    },
    methods: {
      fetchDepartments: { type: 'function', params: '{{{}}}', body: '{{ $http.get("/departments").then(res => { ref_state_departments = res; }) }}' },
      selectDepartment: { type: 'function', params: '{{{}}}', body: '{{ ref_state_selectedDepartment = $event?.data || null }}' },
      openCreateModal: { type: 'function', params: '{{{}}}', body: '{{ ref_state_editingId = null; ref_state_form = { name: "", code: "", parentId: ref_state_selectedDepartment?.id || null }; ref_state_modalVisible = true }}' },
      openEditModal: { type: 'function', params: '{{{}}}', body: '{{ const dept = ref_state_selectedDepartment; if(!dept) return; ref_state_editingId = dept.id; ref_state_form = { name: dept.name, code: dept.code, parentId: dept.parentId }; ref_state_modalVisible = true }}' },
      handleModalOk: { type: 'function', params: '{{{}}}', body: '{{ if(!ref_state_form.name) { $message.error("请输入部门名称"); return; } if(!ref_state_form.code) { $message.error("请输入部门编码"); return; } (ref_state_editingId ? $http.put("/departments/" + ref_state_editingId, ref_state_form) : $http.post("/departments", ref_state_form)).then(() => { $message.success("保存成功"); ref_state_modalVisible = false; $methods.fetchDepartments(); }).catch(err => { $message.error(err.response?.data?.message || "保存失败"); }) }}' },
      handleDelete: { type: 'function', params: '{{{}}}', body: '{{ const dept = ref_state_selectedDepartment; if(!dept) return; $modal.confirm({ title: "确认删除", content: "确定要删除部门「" + dept.name + "」吗？", onOk: () => $http.delete("/departments/" + dept.id).then(() => { $message.success("删除成功"); ref_state_selectedDepartment = null; $methods.fetchDepartments(); }) }) }}' },
      closeModal: { type: 'function', params: '{{{}}}', body: '{{ ref_state_modalVisible = false }}' }
    },
    render: {
      type: "div",
      props: { style: { display: "flex", height: "100vh" } },
      children: [
        {
          type: "div",
          props: { style: { width: "280px", borderRight: "1px solid #eee", padding: "16px" } },
          children: [
            { type: "h3", children: "部门列表" },
            {
              type: "ATree",
              props: {
                treeData: { type: 'expression', body: '{{ (function() { const build = (parentId) => ref_state_departments.filter(d => d.parentId === parentId).map(d => ({ key: d.id, title: d.name, data: d, children: build(d.id) })); return build(null); })() }}' },
                selectedKeys: { type: 'expression', body: '{{ ref_state_selectedDepartment ? [ref_state_selectedDepartment.id] : [] }}' },
                expandedKeys: { type: 'expression', body: '{{ ref_state_departments.map(d => d.id) }}' },
                showLine: true,
                onSelect: { type: 'expression', body: '{{ keys.length > 0 && $methods.selectDepartment(info.node) }}' }
              }
            }
          ]
        },
        {
          type: "div",
          props: { style: { flex: 1, padding: "16px" } },
          children: [
            {
              type: "div",
              props: { style: { marginBottom: "16px" } },
              children: [
                { type: "AButton", props: { type: "primary", onClick: { type: 'expression', body: '{{ $methods.openCreateModal() }}' } }, children: "新增部门" },
                { type: "AButton", props: { style: { marginLeft: "8px" }, disabled: { type: 'expression', body: '{{ !ref_state_selectedDepartment }}' }, onClick: { type: 'expression', body: '{{ $methods.openEditModal() }}' } }, children: "编辑" },
                { type: "AButton", props: { style: { marginLeft: "8px" }, danger: true, disabled: { type: 'expression', body: '{{ !ref_state_selectedDepartment }}' }, onClick: { type: 'expression', body: '{{ $methods.handleDelete() }}' } }, children: "删除" }
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
                    { type: "ADescriptionsItem", props: { label: "部门名称" }, children: "{{{ ref_state_selectedDepartment?.name || '-' }}}" },
                    { type: "ADescriptionsItem", props: { label: "部门编码" }, children: "{{{ ref_state_selectedDepartment?.code || '-' }}}" }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "AModal",
          props: { 
            title: { type: 'expression', body: '{{ ref_state_editingId ? "编辑部门" : "新增部门" }}' },
            open: { type: 'expression', body: '{{ ref_state_modalVisible }}' },
            onOk: { type: 'expression', body: '{{ $methods.handleModalOk() }}' },
            onCancel: { type: 'expression', body: '{{ $methods.closeModal() }}' }
          },
          children: [
            {
              type: "AForm",
              props: { layout: "vertical" },
              children: [
                { 
                  type: "AFormItem", 
                  props: { label: "部门名称", name: "name", required: true }, 
                  children: [{ 
                    type: "AInput", 
                    directives: {
                      vModel: {
                        prop: { type: 'state', body: '{{ref_state_form_name}}' },
                        event: 'update:value'
                      }
                    },
                    props: { placeholder: "请输入部门名称" } 
                  }] 
                },
                { 
                  type: "AFormItem", 
                  props: { label: "部门编码", name: "code", required: true }, 
                  children: [{ 
                    type: "AInput", 
                    directives: {
                      vModel: {
                        prop: { type: 'state', body: '{{ref_state_form_code}}' },
                        event: 'update:value'
                      }
                    },
                    props: { placeholder: "请输入部门编码" } 
                  }] 
                },
                { 
                  type: "AFormItem", 
                  props: { label: "上级部门", name: "parentId" }, 
                  children: [{ 
                    type: "ASelect", 
                    directives: {
                      vModel: {
                        prop: { type: 'state', body: '{{ref_state_form_parentId}}' },
                        event: 'update:value'
                      }
                    },
                    props: { 
                      placeholder: "选择上级部门",
                      style: { width: "100%" },
                      allowClear: true,
                      options: { type: 'expression', body: '{{ ref_state_departments.filter(d => d.id !== ref_state_editingId).map(d => ({ label: d.name, value: d.id })) }}' }
                    } 
                  }] 
                }
              ]
            }
          ]
        }
      ]
    }
  }
}

export default TREE_PAGE_EXAMPLE