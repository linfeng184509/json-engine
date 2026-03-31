import type { SkillExample } from '../types'

const LIST_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个商品管理列表页，支持新增、编辑、删除、搜索功能",
  pageType: 'list',
  description: '列表管理页面，包含表格、筛选、新增/编辑弹窗 - core-engine 格式',
  output: {
    name: "ProductsPage",
    state: {
      products: { type: 'ref', initial: [] },
      loading: { type: 'ref', initial: false },
      pagination: { type: 'reactive', initial: { current: 1, pageSize: 10, total: 0 } },
      keyword: { type: 'ref', initial: '' },
      modalVisible: { type: 'ref', initial: false },
      editingId: { type: 'ref', initial: null },
      form: { type: 'reactive', initial: { name: '', sku: '', category: '', price: 0, unit: '个', description: '' } }
    },
    methods: {
      fetchProducts: { type: 'function', params: '{{{}}}', body: '{{ref_state_loading = true; $http.get("/products", { params: { page: ref_state_pagination_current, pageSize: ref_state_pagination_pageSize, keyword: ref_state_keyword } }).then(res => { ref_state_products = res.list; ref_state_pagination_total = res.total; }).finally(() => { ref_state_loading = false; })}}' },
      handleSearch: { type: 'function', params: '{{{}}}', body: '{{ref_state_pagination_current = 1; ref_methods_fetchProducts();}}' },
      openCreateModal: { type: 'function', params: '{{{}}}', body: '{{ref_state_editingId = null; ref_state_form = { name: "", sku: "", category: "", price: 0, unit: "个", description: "" }; ref_state_modalVisible = true;}}' },
      openEditModal: { type: 'function', params: '{{{item}}}', body: '{{ref_state_editingId = item.id; ref_state_form = { name: item.name, sku: item.sku, category: item.category, price: item.price, unit: item.unit, description: item.description }; ref_state_modalVisible = true;}}' },
      handleModalOk: { type: 'function', params: '{{{}}}', body: '{{if(!ref_state_form_name) { $message.error("请输入商品名称"); return; } if(!ref_state_form_sku) { $message.error("请输入SKU"); return; } (ref_state_editingId ? $http.put("/products/" + ref_state_editingId, ref_state_form) : $http.post("/products", ref_state_form)).then(() => { $message.success("保存成功"); ref_state_modalVisible = false; ref_methods_fetchProducts(); }).catch(err => { $message.error(err.response?.data?.message || "保存失败"); });}}' },
      handleModalCancel: { type: 'function', params: '{{{}}}', body: '{{ref_state_modalVisible = false;}}' },
      handleDelete: { type: 'function', params: '{{{item}}}', body: '{{$modal.confirm({ title: "确认删除", content: "确定要删除商品「" + item.name + "」吗？", onOk: () => $http.delete("/products/" + item.id).then(() => { $message.success("删除成功"); ref_methods_fetchProducts(); }).catch(err => { $message.error(err.response?.data?.message || "删除失败"); }) });}}' },
      setFormName: { type: 'function', params: '{{{value}}}', body: '{{ref_state_form_name = value;}}' },
      setFormSku: { type: 'function', params: '{{{value}}}', body: '{{ref_state_form_sku = value;}}' },
      setFormPrice: { type: 'function', params: '{{{value}}}', body: '{{ref_state_form_price = value;}}' },
      setFormDescription: { type: 'function', params: '{{{value}}}', body: '{{ref_state_form_description = value;}}' }
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
                value: { type: 'state', body: '{{ref_state_keyword}}' }
              }
            },
            {
              type: "AButton",
              props: { type: "primary" },
              children: "新增商品"
            }
          ]
        },
        {
          type: "ATable",
          props: {
            loading: { type: 'state', body: '{{ref_state_loading}}' },
            rowKey: "id"
          }
        },
        {
          type: "AModal",
          props: {
            open: { type: 'state', body: '{{ref_state_modalVisible}}' }
          }
        }
      ]
    }
  }
}

export default LIST_PAGE_EXAMPLE
