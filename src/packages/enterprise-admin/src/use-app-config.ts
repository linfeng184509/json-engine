import type { Component } from 'vue';
import {
  resolveImports,
  createRouter,
  setupUIComponents,
} from '@json-engine/vue-json';
import type {
  VueJsonAppSchema,
  Router,
  RouterConfig,
  RouteConfig,
  UIComponentConfig,
  UIConfig,
} from '@json-engine/vue-json';

export interface AppConfig {
  schema: VueJsonAppSchema;
  components: Record<string, Component>;
  router: Router;
  routes: RouteConfig[];
}

interface ComponentConfig {
  name: string;
  component: string;
}

let appConfigInstance: AppConfig | null = null;

export async function loadAppConfig(schemaPath: string): Promise<AppConfig> {
  if (appConfigInstance) {
    return appConfigInstance;
  }

  const rawSchema = await fetchAppSchema(schemaPath);
  const schema = await resolveImports(rawSchema as Record<string, unknown>) as VueJsonAppSchema;

  const componentConfigs = (schema.ui?.components as ComponentConfig[] | undefined) || [];
  const components = await loadUIComponents(componentConfigs);
  registerUIComponents(schema.ui, components);

  const router = createRouterFromConfig(schema.router);

  appConfigInstance = {
    schema,
    components,
    router,
    routes: flattenRoutes(schema.router?.routes || []),
  };

  return appConfigInstance;
}

export function getAppConfig(): AppConfig | null {
  return appConfigInstance;
}

async function fetchAppSchema(path: string): Promise<VueJsonAppSchema> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load app schema: ${response.status}`);
  }
  return response.json() as Promise<VueJsonAppSchema>;
}

async function loadUIComponents(configs: ComponentConfig[]): Promise<Record<string, Component>> {
  const components: Record<string, Component> = {};
  
  const antdComponents = await import('ant-design-vue') as Record<string, unknown>;

  for (const cfg of configs) {
    try {
      const componentPath = cfg.component;
      
      if (componentPath.startsWith('ant-design-vue')) {
        const componentName = extractAntdComponentName(componentPath);
        if (componentName && antdComponents[componentName]) {
          components[cfg.name] = antdComponents[componentName] as Component;
        } else if (componentName) {
          console.warn(`Ant Design component "${componentName}" not found`);
        }
      } else {
        const module = await import(/* @vite-ignore */ componentPath);
        components[cfg.name] = module.default || module;
      }
    } catch (error) {
      console.warn(`Failed to load component "${cfg.name}" from "${cfg.component}":`, error);
    }
  }

  return components;
}

function extractAntdComponentName(path: string): string | null {
  const mapping: Record<string, string> = {
    'ant-design-vue/es/form': 'Form',
    'ant-design-vue/es/form/FormItem': 'FormItem',
    'ant-design-vue/es/input': 'Input',
    'ant-design-vue/es/input/Password': 'InputPassword',
    'ant-design-vue/es/button': 'Button',
    'ant-design-vue/es/checkbox': 'Checkbox',
    'ant-design-vue/es/spin': 'Spin',
    'ant-design-vue/es/card': 'Card',
    'ant-design-vue/es/alert': 'Alert',
    'ant-design-vue/es/layout': 'Layout',
    'ant-design-vue/es/layout/Header': 'LayoutHeader',
    'ant-design-vue/es/layout/Content': 'LayoutContent',
    'ant-design-vue/es/result': 'Result',
    'ant-design-vue/es/config-provider': 'ConfigProvider',
  };
  
  return mapping[path] || null;
}

function registerUIComponents(uiConfig: UIConfig | undefined, components: Record<string, Component>): void {
  if (uiConfig) {
    const componentConfigs: UIComponentConfig[] = Object.entries(components).map(([name, component]) => ({
      name,
      component,
    }));
    setupUIComponents({
      components: componentConfigs,
      theme: uiConfig.theme,
    });
  }
}

function createRouterFromConfig(routerConfig: RouterConfig | string | undefined): Router {
  if (!routerConfig) {
    throw new Error('Router config is required in app schema');
  }

  if (typeof routerConfig === 'string') {
    throw new Error('Router config as string path is not supported yet');
  }

  return createRouter(routerConfig);
}

function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = [];
  for (const route of routes) {
    result.push(route);
    if (route.children) {
      result.push(...flattenRoutes(route.children));
    }
  }
  return result;
}

export function matchRoute(routes: RouteConfig[], path: string): RouteConfig | undefined {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }
    if (route.redirect && path === '/') {
      return route;
    }
    const pathMatchRegex = /^:pathMatch\(.+\)\*$/;
    if (pathMatchRegex.test(route.path)) {
      return route;
    }
  }
  return undefined;
}

export function getRouteSchemaPath(route: RouteConfig | undefined): string | undefined {
  if (!route) return undefined;
  if (route.redirect) return undefined;
  if (typeof route.component === 'string') return route.component;
  return undefined;
}