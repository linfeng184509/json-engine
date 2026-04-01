import type { KeyParserRegistry } from '@json-engine/core-engine';

function toPascalCase(str: string): string {
  return str
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/^([a-z])/, (_, c) => c.toUpperCase());
}

function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

function componentNameParser(key: string): string {
  return toPascalCase(key);
}

function stateKeyParser(key: string): string {
  if (!isValidVariableName(key)) {
    throw new Error(`Invalid state key: "${key}". Must be a valid JavaScript variable name.`);
  }
  return key;
}

export function getVueKeyParsers(): KeyParserRegistry {
  return {
    componentName: componentNameParser,
    stateKey: stateKeyParser,
  };
}

export { toPascalCase, isValidVariableName };