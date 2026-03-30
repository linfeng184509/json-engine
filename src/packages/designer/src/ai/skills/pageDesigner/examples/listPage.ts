import type { SkillExample } from '../types'

const LIST_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个商品管理列表页，支持新增、编辑、删除、搜索功能",
  pageType: 'list',
  description: '列表管理页面，包含表格、筛选、新增/编辑弹窗',
  output: {
    name: "ProductsPage",
    state: {
      products: [],
      loading: false,
      pagination: { current: 1, pageSize: 10, total: 0 },
      keyword: "",
      modalVisible: false,
      editingId: null,
      form: { name: "", sku: "", category: "", price: 0, unit: "个", description: "" }
    },
    computed: {
      tableColumns: {
        get: "[{ title: '编号', dataIndex: 'id', key: 'id', width: 80 }, { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 150 }, { title: '商品名称', dataIndex: 'name', key: 'name' }, { title: '分类', dataIndex: 'category', key: 'category', width: 100 }, { title: '单价', dataIndex: 'price', key: 'price', width: 100 }, { title: '操作', key: 'action', width: 150 }]"
      },
      modalTitle: {
        get: "$state.editingId ? '编辑商品' : '新增商品'"
      }
    },
    methods: {
      fetchProducts: "$state.loading = true; $http.get('/products', { params: { page: $state.pagination.current, pageSize: $state.pagination.pageSize, keyword: $state.keyword } }).then(res => { $state.products = res.list; $state.pagination.total = res.total; }).finally(() => { $state.loading = false; })",
      handleSearch: "$state.pagination.current = 1; $methods.fetchProducts()",
      openCreateModal: "$state.editingId = null; $state.form = { name: '', sku: '', category: '', price: 0, unit: '个', description: '' }; $state.modalVisible = true",
      openEditModal: "const item = $args[0]; $state.editingId = item.id; $state.form = { name: item.name, sku: item.sku, category: item.category, price: item.price, unit: item.unit, description: item.description }; $state.modalVisible = true",
      handleModalOk: "if(!$state.form.name) { $message.error('请输入商品名称'); return; } if(!$state.form.sku) { $message.error('请输入SKU'); return; } ($state.editingId ? $http.put('/products/' + $state.editingId, $state.form) : $http.post('/products', $state.form)).then(() => { $message.success('保存成功'); $state.modalVisible = false; $methods.fetchProducts(); }).catch(err => { $message.error(err.response?.data?.message || '保存失败'); })",
      handleModalCancel: "$state.modalVisible = false",
      handleDelete: "const item = $args[0]; $modal.confirm({ title: '确认删除', content: '确定要删除商品「' + item.name + '」吗？', onOk: () => $http.delete('/products/' + item.id).then(() => { $message.success('删除成功'); $methods.fetchProducts(); }).catch(err => { $message.error(err.response?.data?.message || '删除失败'); }) })",
      setFormName: "$state.form.name = $event.target.value",
      setFormSku: "$state.form.sku = $event.target.value",
      setFormPrice: "$state.form.price = $event",
      setFormDescription: "$state.form.description = $event.target.value"
    },
    lifecycle: {
      mounted: "$methods.fetchProducts()"
    },
    render: {
      type: "div",
      children: [
        {
          type: "div",
          props: { style: { display: "flex", justifyContent: "space-between", marginBottom: "16px" } },
          children: [
            {
              type: "AInputSearch",
              props: {
                placeholder: "搜索商品名称或SKU",
                style: "width: 300px",
                onSearch: "$methods.handleSearch()"
              }
            },
            {
              type: "AButton",
              props: { type: "primary", onClick: "$methods.openCreateModal()" },
              children: "新增商品"
            }
          ]
        },
        {
          type: "ATable",
          props: {
            columns: "$state.tableColumns",
            dataSource: "$state.products",
            loading: "$state.loading",
            pagination: "{ current: $state.pagination.current, pageSize: $state.pagination.pageSize, total: $state.pagination.total, onChange: (page) => { $state.pagination.current = page; $methods.fetchProducts(); } }",
            rowKey: "id"
          }
        },
        {
          type: "AModal",
          props: {
            title: "$state.modalTitle",
            open: "$state.modalVisible",
            onOk: "$methods.handleModalOk()",
            onCancel: "$methods.handleModalCancel()"
          },
          children: [
            {
              type: "AForm",
              props: { layout: "vertical" },
              children: [
                {
                  type: "AFormItem",
                  props: { label: "商品名称", required: true },
                  children: [{ type: "AInput", props: { value: "$state.form.name", onInput: "$methods.setFormName($event)" } }]
                },
                {
                  type: "AFormItem",
                  props: { label: "SKU", required: true },
                  children: [{ type: "AInput", props: { value: "$state.form.sku", onInput: "$methods.setFormSku($event)" } }]
                },
                {
                  type: "AFormItem",
                  props: { label: "单价" },
                  children: [{ type: "AInputNumber", props: { value: "$state.form.price", onChange: "$methods.setFormPrice($event)", min: 0, style: "width: 100%" } }]
                },
                {
                  type: "AFormItem",
                  props: { label: "描述" },
                  children: [{ type: "ATextArea", props: { value: "$state.form.description", onInput: "$methods.setFormDescription($event)", rows: 3 } }]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}

export default LIST_PAGE_EXAMPLE