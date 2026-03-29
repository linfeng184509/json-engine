import { createVueParserConfig, type ParserConfig } from '../config/vue-parser-config';

const COMPONENT_NAME_KEY = 'vue-json:component-name';
const STATE_KEY_KEY = 'vue-json:state-key';

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

export function getVueParserConfig(): ParserConfig {
  return createVueParserConfig({
    keyParsers: {
      [COMPONENT_NAME_KEY]: componentNameParser,
      [STATE_KEY_KEY]: stateKeyParser,
    },
  });
}

export function getVueKeyParsers(): Record<string, (key: string) => string> {
  return {
    [COMPONENT_NAME_KEY]: componentNameParser,
    [STATE_KEY_KEY]: stateKeyParser,
  };
}

export function registerDefaultKeyParsers(): void {
  // Deprecated: Use getVueParserConfig() instead
}

export function unregisterDefaultKeyParsers(): void {
  // Deprecated: Use getVueParserConfig() instead
}

export function registerVueJsonKeyParser(name: string, parser: (key: string) => string): void {
  // Deprecated: Use getVueParserConfig() with custom keyParsers
}

export function unregisterVueJsonKeyParser(name: string): void {
  // Deprecated
}

export function clearVueJsonKeyParsers(): void {
  // Deprecated
}

export { toPascalCase, isValidVariableName };
