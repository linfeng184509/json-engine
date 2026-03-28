import { registerKeyParser, unregisterKeyParser, clearKeyParsers } from '@json-engine/core-engine';

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

export function registerDefaultKeyParsers(): void {
  registerKeyParser(COMPONENT_NAME_KEY, componentNameParser);
  registerKeyParser(STATE_KEY_KEY, stateKeyParser);
}

export function unregisterDefaultKeyParsers(): void {
  unregisterKeyParser(COMPONENT_NAME_KEY);
  unregisterKeyParser(STATE_KEY_KEY);
}

export function registerVueJsonKeyParser(name: string, parser: (key: string) => string): void {
  registerKeyParser(`vue-json:${name}`, parser);
}

export function unregisterVueJsonKeyParser(name: string): void {
  unregisterKeyParser(`vue-json:${name}`);
}

export function clearVueJsonKeyParsers(): void {
  clearKeyParsers();
}

export { toPascalCase, isValidVariableName };