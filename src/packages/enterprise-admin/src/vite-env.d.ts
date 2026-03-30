/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module '*.json' {
  const content: unknown;
  export default content;
}

interface RouteConfig {
  path: string;
  name?: string;
  component?: string;
  redirect?: string;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    permissions?: string[];
  };
  children?: RouteConfig[];
}

declare global {
  interface Window {
    __APP_ROUTES__?: RouteConfig[];
  }
}