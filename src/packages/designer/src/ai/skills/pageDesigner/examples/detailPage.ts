import type { SkillExample } from '../types'

const DETAIL_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个客户详情页，显示客户基本信息和相关订单列表",
  pageType: 'detail',
  description: '详情页面，包含描述列表、标签页、相关数据表格',
  output: {
    name: "CustomerDetailPage",
    state: {
      customer: null,
      orders: [],
      loading: false,
      activeTab: "info"
    },
    computed: {
      statusTag: {
        get: "$state.customer?.status === 'active' ? { color: 'green', text: '启用' } : { color: 'default', text: '停用' }"
      },
      orderColumns: {
        get: "[{ title: '订单号', dataIndex: 'orderNo' }, { title: '金额', dataIndex: 'amount', width: 120 }, { title: '状态', dataIndex: 'status', width: 100 }, { title: '创建时间', dataIndex: 'createdAt', width: 180 }]"
      }
    },
    methods: {
      fetchCustomer: "$state.loading = true; $http.get('/customers/' + $route.params.id).then(res => { $state.customer = res; }).finally(() => { $state.loading = false; })",
      fetchOrders: "$http.get('/orders', { params: { customerId: $route.params.id } }).then(res => { $state.orders = res; })",
      goBack: "$router.back()",
      editCustomer: "$router.push('/customers/' + $route.params.id + '/edit')"
    },
    lifecycle: {
      mounted: "$methods.fetchCustomer(); $methods.fetchOrders()"
    },
    render: {
      type: "div",
      props: { class: "customer-detail-page" },
      children: [
        {
          type: "div",
          props: { class: "page-header" },
          children: [
            { type: "AButton", props: { onClick: "$methods.goBack()" }, "children": "返回" },
            { type: "h1", props: { style: { margin: "0 16px" } }, children: "{{ $state.customer?.name }}" },
            { type: "ATag", props: { color: "$state.statusTag.color" }, children: "{{ $state.statusTag.text }}" },
            { type: "AButton", props: { type: "primary", style: "margin-left: auto", onClick: "$methods.editCustomer()" }, children: "编辑" }
          ]
        },
        {
          type: "ASpin",
          props: { spinning: "$state.loading" },
          children: [
            {
              type: "ACard",
              children: [
                {
                  type: "ADescriptions",
                  props: { column: 2, bordered: true },
                  children: [
                    { type: "ADescriptionsItem", props: { label: "客户编码" }, children: "{{ $state.customer?.code }}" },
                    { type: "ADescriptionsItem", props: { label: "联系人" }, children: "{{ $state.customer?.contact || '-' }}" },
                    { type: "ADescriptionsItem", props: { label: "电话" }, children: "{{ $state.customer?.phone || '-' }}" },
                    { type: "ADescriptionsItem", props: { label: "邮箱" }, children: "{{ $state.customer?.email || '-' }}" },
                    { type: "ADescriptionsItem", props: { label: "地址", span: 2 }, children: "{{ $state.customer?.address || '-' }}" }
                  ]
                }
              ]
            },
            {
              type: "ATabs",
              props: { activeKey: "$state.activeTab", onChange: "$state.activeTab = $args[0]" },
              children: [
                {
                  type: "ATabPane",
                  props: { key: "orders", tab: "订单记录" },
                  children: [
                    {
                      type: "ATable",
                      props: {
                        columns: "$state.orderColumns",
                        dataSource: "$state.orders",
                        rowKey: "id",
                        pagination: "{ pageSize: 10 }"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}

export default DETAIL_PAGE_EXAMPLE