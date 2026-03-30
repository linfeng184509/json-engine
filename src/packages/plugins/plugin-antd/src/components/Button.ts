import { h } from 'vue';
import type { VNode } from 'vue';

export interface ButtonProps {
  type?: 'primary' | 'default' | 'dashed' | 'danger' | 'link';
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  loading?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  children?: VNode[];
}

export function createAButton(props: ButtonProps): VNode {
  return h('button', {
    type: props.htmlType || 'button',
    class: ['ant-btn', `ant-btn-${props.type || 'default'}`, props.size ? `ant-btn-${props.size}` : ''],
    disabled: props.disabled,
  }, props.children);
}
