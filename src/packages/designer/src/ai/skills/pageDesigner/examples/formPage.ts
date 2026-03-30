import type { SkillExample } from '../types'

const FORM_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个用户注册表单，包含用户名、邮箱、密码、确认密码字段",
  pageType: 'form',
  description: '表单页面，包含表单验证、提交处理',
  output: {
    name: "RegisterFormPage",
    state: {
      form: { username: "", email: "", password: "", confirmPassword: "" },
      submitting: false
    },
    methods: {
      setUsername: "$state.form.username = $event.target.value",
      setEmail: "$state.form.email = $event.target.value",
      setPassword: "$state.form.password = $event.target.value",
      setConfirmPassword: "$state.form.confirmPassword = $event.target.value",
      handleSubmit: "if(!$state.form.username) { $message.error('请输入用户名'); return; } if(!$state.form.email) { $message.error('请输入邮箱'); return; } if(!$state.form.password) { $message.error('请输入密码'); return; } if($state.form.password.length < 6) { $message.error('密码至少6位'); return; } if($state.form.password !== $state.form.confirmPassword) { $message.error('两次密码不一致'); return; } $state.submitting = true; $http.post('/register', $state.form).then(() => { $message.success('注册成功'); $router.push('/login'); }).catch(err => { $message.error(err.response?.data?.message || '注册失败'); }).finally(() => { $state.submitting = false; })",
      goLogin: "$router.push('/login')"
    },
    render: {
      type: "div",
      props: { class: "register-page", style: { maxWidth: "400px", margin: "50px auto" } },
      children: [
        { type: "h1", props: { style: { textAlign: "center" } }, children: "用户注册" },
        {
          type: "AForm",
          props: { layout: "vertical" },
          children: [
            {
              type: "AFormItem",
              props: { label: "用户名", required: true },
              children: [{ type: "AInput", props: { value: "$state.form.username", onInput: "$methods.setUsername($event)", placeholder: "请输入用户名" } }]
            },
            {
              type: "AFormItem",
              props: { label: "邮箱", required: true },
              children: [{ type: "AInput", props: { value: "$state.form.email", onInput: "$methods.setEmail($event)", placeholder: "请输入邮箱", type: "email" } }]
            },
            {
              type: "AFormItem",
              props: { label: "密码", required: true },
              children: [{ type: "AInputPassword", props: { value: "$state.form.password", onInput: "$methods.setPassword($event)", placeholder: "请输入密码（至少6位）" } }]
            },
            {
              type: "AFormItem",
              props: { label: "确认密码", required: true },
              children: [{ type: "AInputPassword", props: { value: "$state.form.confirmPassword", onInput: "$methods.setConfirmPassword($event)", placeholder: "请再次输入密码" } }]
            },
            {
              type: "AFormItem",
              children: [
                { type: "AButton", props: { type: "primary", block: true, loading: "$state.submitting", onClick: "$methods.handleSubmit()" }, children: "注册" }
              ]
            },
            {
              type: "div",
              props: { style: { textAlign: "center" } },
              children: [
                { type: "span", children: "已有账号？" },
                { type: "AButton", props: { type: "link", onClick: "$methods.goLogin()" }, children: "立即登录" }
              ]
            }
          ]
        }
      ]
    }
  }
}

export default FORM_PAGE_EXAMPLE