import type { VueJsonSchema } from './schema';

export interface RouteConfig {
  path: string;
  name?: string;
  component?: VueJsonSchema | string;
  components?: Record<string, VueJsonSchema | string>;
  children?: RouteConfig[];
  redirect?: string | { name: string };
  props?: boolean | Record<string, unknown>;
  meta?: RouteMeta;
  alias?: string | string[];
  beforeEnter?: NavigationGuard;
  caseSensitive?: boolean;
}

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  permissions?: string[];
  roles?: string[];
  keepAlive?: boolean;
  [key: string]: unknown;
}

export interface NavigationGuard {
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardCallback): void;
}

export type NavigationGuardCallback = (to?: string | RouteLocationNormalized | null) => void;

export interface RouteLocationNormalized {
  name?: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  fullPath: string;
  matched: RouteRecordNormalized[];
  meta: RouteMeta;
  redirectedFrom?: string;
}

export interface RouteRecordNormalized {
  path: string;
  name?: string;
  meta: RouteMeta;
  props: boolean | Record<string, unknown>;
  children?: RouteRecordNormalized[];
  alias?: string[];
}

export interface RouterConfig {
  history?: 'hash' | 'history' | 'memory';
  routes: RouteConfig[];
  guards?: RouterGuards;
}

export interface RouterGuards {
  beforeEach?: NavigationGuard;
  afterEach?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
  beforeResolve?: NavigationGuard;
}

export type Router = {
  install: (app: unknown) => void;
  push: (to: string | RouteLocationNormalized) => Promise<NavigationResult>;
  replace: (to: string | RouteLocationNormalized) => Promise<NavigationResult>;
  back: () => void;
  forward: () => void;
  go: (delta: number) => void;
  beforeResolve: (guard: NavigationGuard) => () => void;
  afterEach: (guard: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void) => () => void;
  onError: (handler: (error: unknown) => void) => () => void;
};

export type NavigationResult = void | Promise<void>;