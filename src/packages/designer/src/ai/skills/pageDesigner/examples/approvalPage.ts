import type { SkillExample } from '../types'

const APPROVAL_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个采购订单审批页面，显示订单详情和审批记录，支持通过/拒绝操作",
  pageType: 'approval',
  description: '审批流程页面，包含订单详情、审批记录、操作按钮 - core-engine 格式',
  output: {
    name: "PurchaseOrderApprovalPage",
    state: {
      order: { type: 'ref', initial: null },
      reviewLog: { type: 'reactive', initial: [] },
      loading: { type: 'ref', initial: false },
      actionLoading: { type: 'ref', initial: false },
      rejectModalVisible: { type: 'ref', initial: false },
      rejectReason: { type: 'ref', initial: "" }
    },
    methods: {
      fetchOrder: { type: 'function', params: '{{{}}}', body: '{{ ref_state_loading = true; $http.get("/purchase-orders/" + $route.params.id).then(res => { ref_state_order = res.order; ref_state_reviewLog = res.reviewLog || []; }).finally(() => { ref_state_loading = false; }) }}' },
      handleApprove: { type: 'function', params: '{{{}}}', body: '{{ ref_state_actionLoading = true; $http.post("/purchase-orders/" + ref_state_order.id + "/approve").then(() => { $message.success("审批通过"); $methods.fetchOrder(); }).catch(err => { $message.error(err.response?.data?.message || "审批失败"); }).finally(() => { ref_state_actionLoading = false; }) }}' },
      openRejectModal: { type: 'function', params: '{{{}}}', body: '{{ ref_state_rejectReason = ""; ref_state_rejectModalVisible = true }}' },
      handleReject: { type: 'function', params: '{{{}}}', body: '{{ if(!ref_state_rejectReason) { $message.error("请输入拒绝原因"); return; } ref_state_actionLoading = true; $http.post("/purchase-orders/" + ref_state_order.id + "/reject", { reason: ref_state_rejectReason }).then(() => { $message.success("已拒绝"); ref_state_rejectModalVisible = false; $methods.fetchOrder(); }).catch(err => { $message.error(err.response?.data?.message || "操作失败"); }).finally(() => { ref_state_actionLoading = false; }) }}' },
      goBack: { type: 'function', params: '{{{}}}', body: '{{ $router.back() }}' }
    },
    render: {
      type: "div",
      props: { style: { padding: "24px" } },
      children: [
        {
          type: "div",
          props: { style: { display: "flex", alignItems: "center", marginBottom: "16px" } },
          children: [
            { type: "AButton", props: { onClick: { type: 'expression', body: '{{ $methods.goBack() }}' } }, children: "返回" },
            { type: "h1", props: { style: { margin: "0 16px" } }, children: "{{{ ref_state_order?.orderNo }}}" },
            { 
              type: "ATag", 
              props: { 
                color: { type: 'expression', body: '{{ ref_state_order?.status === \'approved\' ? \'green\' : ref_state_order?.status === \'rejected\' ? \'red\' : \'orange\' }}' }
              }, 
              children: '{{{ ref_state_order?.status === \'approved\' ? \'已通过\' : ref_state_order?.status === \'rejected\' ? \'已拒绝\' : \'待审批\' }}}' 
            }
          ]
        },
        {
          type: "ASpin",
          props: { spinning: { type: 'expression', body: '{{ ref_state_loading }}' } },
          children: [
            {
              type: "ACard",
              props: { title: "订单信息" },
              children: [
                {
                  type: "ADescriptions",
                  props: { column: 2, bordered: true },
                  children: [
                    { type: "ADescriptionsItem", props: { label: "供应商" }, children: "{{{ ref_state_order?.supplierName }}}" },
                    { type: "ADescriptionsItem", props: { label: "总金额" }, children: '¥{{{ ref_state_order?.totalAmount }}}' },
                    { type: "ADescriptionsItem", props: { label: "总数量" }, children: "{{{ ref_state_order?.totalQty }}}" },
                    { type: "ADescriptionsItem", props: { label: "期望日期" }, children: '{{{ ref_state_order?.expectedDate || "-" }}}' },
                    { type: "ADescriptionsItem", props: { label: "备注", span: 2 }, children: '{{{ ref_state_order?.remark || "-" }}}' }
                  ]
                }
              ]
            },
            {
              type: "ACard",
              props: { title: "商品明细", style: { marginTop: "16px" } },
              children: [
                {
                  type: "ATable",
                  props: {
                    columns: { type: 'expression', body: '{{ [{ title: "商品", dataIndex: "productName" }, { title: "数量", dataIndex: "qty", width: 80 }, { title: "单价", dataIndex: "price", width: 100 }, { title: "金额", dataIndex: "amount", width: 120 }] }}' },
                    dataSource: { type: 'expression', body: '{{ ref_state_order?.items }}' },
                    rowKey: "productId",
                    pagination: false,
                    size: "small"
                  }
                }
              ]
            },
            {
              type: "ACard",
              props: { title: "审批记录", style: { marginTop: "16px" } },
              children: [
                {
                  type: "ATimeline",
                  props: {
                    items: { type: 'expression', body: '{{ ref_state_reviewLog.map(log => ({ color: log.action === \'create\' ? \'blue\' : log.action === \'submit\' ? \'cyan\' : log.action === \'approve\' ? \'green\' : \'red\', children: log.operator + " " + log.note + " - " + new Date(log.time).toLocaleString(\'zh-CN\') })) }}' }
                  }
                }
              ]
            },
            {
              type: "div",
              props: { style: { marginTop: "16px", textAlign: "right" } },
              children: [
                { type: "AButton", props: { type: "primary", loading: { type: 'expression', body: '{{ ref_state_actionLoading }}' }, disabled: { type: 'expression', body: '{{ ref_state_order?.status !== "pending" }}' }, onClick: { type: 'expression', body: '{{ $methods.handleApprove() }}' } }, children: "通过" },
                { type: "AButton", props: { style: { marginLeft: "8px" }, danger: true, disabled: { type: 'expression', body: '{{ ref_state_order?.status !== "pending" }}' }, onClick: { type: 'expression', body: '{{ $methods.openRejectModal() }}' } }, children: "拒绝" }
              ]
            }
          ]
        },
        {
          type: "AModal",
          props: { 
            title: "拒绝原因", 
            open: { type: 'expression', body: '{{ ref_state_rejectModalVisible }}' }, 
            onOk: { type: 'expression', body: '{{ $methods.handleReject() }}' }, 
            onCancel: { type: 'expression', body: '{{ ref_state_rejectModalVisible = false }}' }, 
            confirmLoading: { type: 'expression', body: '{{ ref_state_actionLoading }}' } 
          },
          children: [
            { 
              type: "ATextArea", 
              directives: {
                vModel: {
                  prop: { type: 'state', body: '{{ref_state_rejectReason}}' },
                  event: 'update:value'
                }
              },
              props: { rows: 4, placeholder: "请输入拒绝原因" } 
            }
          ]
        }
      ]
    }
  }
}

export default APPROVAL_PAGE_EXAMPLE