import type { SkillExample } from '../types'

const DASHBOARD_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个销售仪表盘，显示今日销售额、订单数、客户数等统计指标",
  pageType: 'dashboard',
  description: '仪表盘页面，包含统计卡片和图表 - core-engine 格式',
  output: {
    name: "SalesDashboard",
    state: {
      stats: { type: 'reactive', initial: { todaySales: 0, todayOrders: 0, todayCustomers: 0, monthSales: 0 } },
      chartData: { type: 'reactive', initial: [] },
      loading: { type: 'ref', initial: false }
    },
    methods: {
      fetchStats: { type: 'function', params: '{{{}}}', body: '{{ ref_state_loading = true; $http.get("/dashboard/stats").then(res => { ref_state_stats = res; }).finally(() => { ref_state_loading = false; }) }}' },
      fetchChartData: { type: 'function', params: '{{{}}}', body: '{{ $http.get("/dashboard/chart").then(res => { ref_state_chartData = res; }) }}' }
    },
    render: {
      type: "div",
      props: { style: { padding: "24px" } },
      children: [
        { type: "h1", props: { style: { marginBottom: "24px" } }, children: "销售仪表盘" },
        {
          type: "ARow",
          props: { gutter: 16 },
          children: [
            {
              type: "ACol",
              props: { span: 6 },
              children: [
                {
                  type: "ACard",
                  children: [
                    { type: "AStatistic", props: { title: "今日销售额", value: { type: 'expression', body: '{{ ref_state_stats.todaySales }}' }, prefix: "¥", precision: 2 } }
                  ]
                }
              ]
            },
            {
              type: "ACol",
              props: { span: 6 },
              children: [
                {
                  type: "ACard",
                  children: [
                    { type: "AStatistic", props: { title: "今日订单数", value: { type: 'expression', body: '{{ ref_state_stats.todayOrders }}' }, suffix: "单" } }
                  ]
                }
              ]
            },
            {
              type: "ACol",
              props: { span: 6 },
              children: [
                {
                  type: "ACard",
                  children: [
                    { type: "AStatistic", props: { title: "今日客户数", value: { type: 'expression', body: '{{ ref_state_stats.todayCustomers }}' }, suffix: "人" } }
                  ]
                }
              ]
            },
            {
              type: "ACol",
              props: { span: 6 },
              children: [
                {
                  type: "ACard",
                  children: [
                    { type: "AStatistic", props: { title: "本月销售额", value: { type: 'expression', body: '{{ ref_state_stats.monthSales }}' }, prefix: "¥", precision: 2 } }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "ACard",
          props: { title: "销售趋势", style: { marginTop: "16px" } },
          children: [
            { type: "div", props: { ref: "chart", style: { height: "300px" } } }
          ]
        }
      ]
    }
  }
}

export default DASHBOARD_PAGE_EXAMPLE