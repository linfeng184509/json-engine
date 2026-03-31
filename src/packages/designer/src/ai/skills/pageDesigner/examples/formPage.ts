import type { SkillExample } from '../types'

const FORM_PAGE_EXAMPLE: SkillExample = {
  input: "创建一个用户注册表单，包含用户名、邮箱、密码、确认密码字段",
  pageType: 'form',
  description: '表单页面，包含表单验证、提交处理 - core-engine 格式',
  output: {
    name: "RegisterFormPage",
    state: {
      form: { type: 'reactive', initial: { username: '', email: '', password: '', confirmPassword: '' } },
      submitting: { type: 'ref', initial: false }
    },
    methods: {
      setUsername: { type: 'function', params: '{{{}}}', body: '{{ref_state_form_username = $event}}' },
      setEmail: { type: 'function', params: '{{{}}}', body: '{{ref_state_form_email = $event}}' },
      setPassword: { type: 'function', params: '{{{}}}', body: '{{ref_state_form_password = $event}}' },
      setConfirmPassword: { type: 'function', params: '{{{}}}', body: '{{ref_state_form_confirmPassword = $event}}' },
      handleSubmit: { type: 'function', params: '{{{}}}', body: '{{if(!ref_state_form_username) { $message.error(\"请输入用户名\"); return; } if(!ref_state_form_email) { $message.error(\"请输入邮箱\"); return; } if(!ref_state_form_password) { $message.error(\"请输入密码\"); return; } if(ref_state_form_password.length < 6) { $message.error(\"密码至少6位\"); return; } if(ref_state_form_password !== ref_state_form_confirmPassword) { $message.error(\"两次密码不一致\"); return; } ref_state_submitloading = true; $http.post(\"/register\", ref_state_form).then(() => { $message.success(\"注册成功\"); $router.push(\"/login\"); }).catch(err => { $message.error(err.response?.data?.message || \"注册失败\"); }).finally(() => { ref_state_submitloading = false; })}}' },
      goLogin: { type: 'function', params: '{{{}}}', body: '{{$router.push(\"/login\")}}' }
    },
    render: {
      type: "div",
      props: { style: { maxWidth: "400px", margin: "50px auto" } },
      children: [
        { type: "h1", props: { style: { textAlign: "center" } }, children: "用户注册" },
        {
          type: "AForm",
          props: { layout: "vertical" },
          children: [
            {
              type: "AFormItem",
              props: { label: "用户名", name: "username" },
              children: [{
                type: "AInput",
                directives: {
                  vModel: {
                    prop: { type: 'state', body: '{{ref_state_form_username}}' },
                    event: 'update:value'
                  }
                },
                props: { placeholder: "请输入用户名" }
              }]
            },
            {
              type: "AFormItem",
              props: { label: "邮箱", name: "email" },
              children: [{
                type: "AInput",
                directives: {
                  vModel: {
                    prop: { type: 'state', body: '{{ref_state_form_email}}' },
                    event: 'update:value'
                  }
                },
                props: { placeholder: "请输入邮箱", type: "email" }
              }]
            },
            {
              type: "AFormItem",
              props: { label: "密码", name: "password" },
              children: [{
                type: "AInputPassword",
                directives: {
                  vModel: {
                    prop: { type: 'state', body: '{{ref_state_form_password}}' },
                    event: 'update:value'
                  }
                },
                props: { placeholder: "请输入密码（至少6位）" }
              }]
            },
            {
              type: "AFormItem",
              props: { label: "确认密码", name: "confirmPassword" },
              children: [{
                type: "AInputPassword",
                directives: {
                  vModel: {
                    prop: { type: 'state', body: '{{ref_state_form_confirmPassword}}' },
                    event: 'update:value'
                  }
                },
                props: { placeholder: "请再次输入密码" }
              }]
            },
            {
              type: "AFormItem",
              children: [
                {
                  type: "AButton",
                  directives: {
                    vModel: {
                      prop: { type: 'state', body: '{{ref_state_submitloading}}' },
                      event: 'update:value'
                    }
                  },
                  props: { type: "primary", block: true },
                  children: "注册"
                }
              ]
            },
            {
              type: "div",
              props: { style: { textAlign: "center" } },
              children: [
                { type: "span", children: "已有账号？" },
                {
                  type: "AButton",
                  props: { type: "link" },
                  children: "立即登录"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}

export default FORM_PAGE_EXAMPLE
