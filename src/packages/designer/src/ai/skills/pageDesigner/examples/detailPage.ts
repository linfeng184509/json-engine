import type { SkillExample } from '../types'

const DETAIL_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个客户详情页，显示客户基本信息和相关订单列表",
  pageType: 'detail',
  description: '详情页面，包含描述列表、标签页、相关数据表格 - core-engine 格式',
  output: {
    name: "CustomerDetailPage",
    state: {
      customer: { type: 'ref', initial: null },
      orders: { type: 'ref', initial: [] },
      loading: { type: 'ref', initial: false },
      activeTab: { type: 'ref', initial: "info" }
    },
    methods: {
      fetchCustomer: { type: 'function', params: '{{{}}}', body: '{{ref_state_loading = true; $http.get("/customers/" + $route.params.id).then(res => { ref_state_customer = res; }).finally(() => { ref_state_loading = false; })}}' },
      fetchOrders: { type: 'function', params: '{{{}}}', body: '{{$http.get("/orders", { params: { customerId: $route.params.id } }).then(res => { ref_state_orders = res; })}}' },
      goBack: { type: 'function', params: '{{{}}}', body: '{{$router.back();}}' },
      editCustomer: { type: 'function', params: '{{{}}}', body: '{{$router.push("/customers/" + $route.params.id + "/edit");}}' }
    },
    render: {
      type: "div",
      props: { class: "customer-detail-page" },
      children: [
        {
          type: "div",
          props: { class: "page-header" },
          children: [
            { type: "AButton", props: { onClick: "$methods.goBack()" }, children: "返回" },
            { type: "h1", props: { style: { margin: "0 16px" } }, children: "客户详情" },
            { type: "AButton", props: { type: "primary", style: "margin-left: auto" }, children: "编辑" }
          ]
        },
        {
          type: "ASpin",
          props: { spinning: { type: 'state', body: '{{ref_state_loading}}' } },
          children: [
            {
              type: "ACard",
              children: [
                {
                  type: "ADescriptions",
                  props: { column: 2, bordered: true }
                }
              ]
            },
            {
              type: "ATabs",
              props: { activeKey: { type: 'state', body: '{{ref_state_activeTab}}' } },
              children: [
                {
                  type: "ATabPane",
                  props: { key: "orders", tab: "订单记录" },
                  children: [
                    {
                      type: "ATable",
                      props: {
                        dataSource: { type: 'state', body: '{{ref_state_orders}}' },
                        rowKey: "id",
                        pagination: { pageSize: 10 }
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
