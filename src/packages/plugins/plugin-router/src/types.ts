export interface RouterPluginConfig {
  mode?: 'hash' | 'history';
  base?: string;
  scrollBehavior?: 'top' | 'bottom' | 'preserve';
}

export interface RouteDefinition {
  path: string;
  name?: string;
  component?: string;
  children?: RouteDefinition[];
}

export interface CoreScopeRouter {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  go: (n: number) => void;
  getCurrentRoute: () => string;
}
