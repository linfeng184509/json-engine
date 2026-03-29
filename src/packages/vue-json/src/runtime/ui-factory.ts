import type { UIConfig, UIComponentConfig, UIThemeConfig } from '../types/app';

export type ComponentLibrary = 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'primevue';

const registeredComponents = new Map<string, unknown>();
const libraryComponents: Record<string, unknown> = {};
let currentTheme: UIThemeConfig = {};

export function registerComponents(components: UIComponentConfig[]): void {
  for (const comp of components) {
    registeredComponents.set(comp.name, comp.component);
  }
}

export function getComponent(name: string): unknown | undefined {
  return registeredComponents.get(name) || libraryComponents[name];
}

export function hasComponent(name: string): boolean {
  return registeredComponents.has(name) || libraryComponents[name] !== undefined;
}

export function configureTheme(theme: UIThemeConfig): void {
  currentTheme = { ...currentTheme, ...theme };
  applyTheme();
}

export function getTheme(): UIThemeConfig {
  return { ...currentTheme };
}

function applyTheme(): void {
  if (currentTheme.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', currentTheme.primaryColor);
  }
  if (currentTheme.borderRadius !== undefined) {
    document.documentElement.style.setProperty('--border-radius', String(currentTheme.borderRadius));
  }
}

export function setupUIComponents(config: UIConfig): void {
  if (config.components) {
    registerComponents(config.components);
  }
  if (config.theme) {
    configureTheme(config.theme);
  }
}

export function loadLibraryComponents(
  _library: ComponentLibrary,
  _components?: string[]
): Promise<void> {
  return Promise.resolve();
}

export function getAllRegisteredComponents(): string[] {
  return Array.from(registeredComponents.keys());
}

export function clearRegisteredComponents(): void {
  registeredComponents.clear();
}

export function injectGlobalProperties(
  _app: unknown,
  _properties: Record<string, unknown>
): void {
}