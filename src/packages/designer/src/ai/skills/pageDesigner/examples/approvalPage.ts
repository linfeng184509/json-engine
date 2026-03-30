import type { SkillExample } from '../types'

const APPROVAL_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个采购订单审批页面，显示订单详情和审批记录，支持通过/拒绝操作",
  pageType: 'approval',
  description: '审批流程页面，包含订单详情、审批记录、操作按钮',
  output: {
    name: "PurchaseOrderApprovalPage",
    state: {
      order: null,
      reviewLog: [],
      loading: false,
      actionLoading: false,
      rejectModalVisible: false,
      rejectReason: ""
    },
    computed: {
      statusTag: {
        get: "$state.order?.status === 'approved' ? { color: 'green', text: '已通过' } : $state.order?.status === 'rejected' ? { color: 'red', text: '已拒绝' } : { color: 'orange', text: '待审批' }"
      },
      canApprove: {
        get: "$state.order?.status === 'pending'"
      }
    },
    methods: {
      fetchOrder: "$state.loading = true; $http.get('/purchase-orders/' + $route.params.id).then(res => { $state.order = res.order; $state.reviewLog = res.reviewLog || []; }).finally(() => { $state.loading = false; })",
      handleApprove: "$state.actionLoading = true; $http.post('/purchase-orders/' + $state.order.id + '/approve').then(() => { $message.success('审批通过'); $methods.fetchOrder(); }).catch(err => { $message.error(err.response?.data?.message || '审批失败'); }).finally(() => { $state.actionLoading = false; })",
      openRejectModal: "$state.rejectReason = ''; $state.rejectModalVisible = true",
      handleReject: "if(!$state.rejectReason) { $message.error('请输入拒绝原因'); return; } $state.actionLoading = true; $http.post('/purchase-orders/' + $state.order.id + '/reject', { reason: $state.rejectReason }).then(() => { $message.success('已拒绝'); $state.rejectModalVisible = false; $methods.fetchOrder(); }).catch(err => { $message.error(err.response?.data?.message || '操作失败'); }).finally(() => { $state.actionLoading = false; })",
      goBack: "$router.back()"
    },
    lifecycle: {
      mounted: "$methods.fetchOrder()"
    },
    render: {
      type: "div",
      props: { class: "approval-page" },
      children: [
        {
          type: "div",
          props: { class: "page-header", style: { display: "flex", alignItems: "center", marginBottom: "16px" } },
          children: [
            { type: "AButton", props: { onClick: "$methods.goBack()" }, children: "返回" },
            { type: "h1", props: { style: { margin: "0 16px" } }, children: "{{ $state.order?.orderNo }}" },
            { type: "ATag", props: { color: "$state.statusTag.color" }, children: "{{ $state.statusTag.text }}" }
          ]
        },
        {
          type: "ASpin",
          props: { spinning: "$state.loading" },
          children: [
            {
              type: "ACard",
              props: { title: "订单信息" },
              children: [
                {
                  type: "ADescriptions",
                  props: { column: 2, bordered: true },
                  children: [
                    { type: "ADescriptionsItem", props: { label: "供应商" }, children: "{{ $state.order?.supplierName }}" },
                    { type: "ADescriptionsItem", props: { label: "总金额" }, children: "¥{{ $state.order?.totalAmount }}" },
                    { type: "ADescriptionsItem", props: { label: "总数量" }, children: "{{ $state.order?.totalQty }}" },
                    { type: "ADescriptionsItem", props: { label: "期望日期" }, children: "{{ $state.order?.expectedDate || '-' }}" },
                    { type: "ADescriptionsItem", props: { label: "备注", span: 2 }, children: "{{ $state.order?.remark || '-' }}" }
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
                    columns: "[{ title: '商品', dataIndex: 'productName' }, { title: '数量', dataIndex: 'qty', width: 80 }, { title: '单价', dataIndex: 'price', width: 100 }, { title: '金额', dataIndex: 'amount', width: 120 }]",
                    dataSource: "$state.order?.items",
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
                    items: "$state.reviewLog.map(log => ({ color: log.action === 'create' ? 'blue' : log.action === 'submit' ? 'cyan' : log.action === 'approve' ? 'green' : 'red', children: log.operator + ' ' + log.note + ' - ' + new Date(log.time).toLocaleString('zh-CN') }))"
                  }
                }
              ]
            },
            {
              type: "div",
              props: { style: { marginTop: "16px", textAlign: "right" } },
              children: [
                { type: "AButton", props: { type: "primary", loading: "$state.actionLoading", disabled: "!$state.canApprove", onClick: "$methods.handleApprove()" }, children: "通过" },
                { type: "AButton", props: { style: "margin-left: 8px", danger: true, disabled: "!$state.canApprove", onClick: "$methods.openRejectModal()" }, children: "拒绝" }
              ]
            }
          ]
        },
        {
          type: "AModal",
          props: { title: "拒绝原因", open: "$state.rejectModalVisible", onOk: "$methods.handleReject()", onCancel: "$state.rejectModalVisible = false", confirmLoading: "$state.actionLoading" },
          children: [
            { type: "ATextArea", props: { value: "$state.rejectReason", onInput: "$state.rejectReason = $event.target.value", rows: 4, placeholder: "请输入拒绝原因" } }
          ]
        }
      ]
    }
  }
}

export default APPROVAL_PAGE_EXAMPLE