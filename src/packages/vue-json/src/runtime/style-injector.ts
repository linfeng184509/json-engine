const injectedStyles = new Map<string, HTMLStyleElement>();

let componentIdCounter = 0;

export function generateComponentId(componentName: string): string {
  const sanitizedName = componentName
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  const uniqueId = `${sanitizedName}-${++componentIdCounter}`;
  return uniqueId;
}

export function injectStyles(
  componentId: string,
  css: string,
  scoped: boolean = false
): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (injectedStyles.has(componentId)) {
    return;
  }

  let processedCss = css;

  if (scoped) {
    processedCss = transformScopedCss(css, componentId);
  }

  const styleElement = document.createElement('style');
  styleElement.id = `vue-json-style-${componentId}`;
  styleElement.setAttribute('data-component', componentId);
  styleElement.textContent = processedCss;

  document.head.appendChild(styleElement);
  injectedStyles.set(componentId, styleElement);
}

export function removeStyles(componentId: string): void {
  const styleElement = injectedStyles.get(componentId);

  if (styleElement) {
    styleElement.remove();
    injectedStyles.delete(componentId);
  }
}

export function updateStyles(componentId: string, css: string, scoped: boolean = false): void {
  const styleElement = injectedStyles.get(componentId);

  if (styleElement) {
    let processedCss = css;

    if (scoped) {
      processedCss = transformScopedCss(css, componentId);
    }

    styleElement.textContent = processedCss;
  } else {
    injectStyles(componentId, css, scoped);
  }
}

function transformScopedCss(css: string, componentId: string): string {
  const scopedAttr = `[data-v-${componentId}]`;

  return css.replace(/([^{]+)\{/g, (_match, selectors) => {
    const processedSelectors = String(selectors)
      .split(',')
      .map((selector) => {
        const trimmed = String(selector).trim();
        if (trimmed.startsWith('@') || trimmed.startsWith(':')) {
          return trimmed;
        }

        if (trimmed.includes('::')) {
          return trimmed.replace(/::/, `${scopedAttr}::`);
        }

        if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          return trimmed.slice(0, colonIndex) + scopedAttr + trimmed.slice(colonIndex);
        }

        return trimmed + scopedAttr;
      })
      .join(', ');

    return `${processedSelectors} {`;
  });
}

export function getInjectedStyleIds(): string[] {
  return Array.from(injectedStyles.keys());
}

export function clearAllStyles(): void {
  for (const [, styleElement] of injectedStyles) {
    styleElement.remove();
  }
  injectedStyles.clear();
}