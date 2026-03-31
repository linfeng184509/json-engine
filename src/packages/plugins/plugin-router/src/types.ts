export interface RouterPluginConfig {
  mode?: 'hash' | 'history';
  base?: string;
  scrollBehavior?: 'top' | 'bottom' | 'preserve';
}

export interface RouteDefinition {
  path: string;
  name?: string;
  component?: string;
  redirect?: string;
  children?: RouteDefinition[];
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    permissions?: string[];
    layout?: string;
  };
}

export interface MatchedRoute {
  path: string;
  route: RouteDefinition;
  children?: MatchedRoute[];
  params: Record<string, string>;
}

export interface CoreScopeRouter {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  go: (n: number) => void;
  getCurrentRoute: () => string;
  getMatchedRoute: () => MatchedRoute | null;
}