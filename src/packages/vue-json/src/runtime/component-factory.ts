import type { Component } from 'vue';
import type { VueJsonSchemaInput, CreateComponentOptions } from '../types';
import { createComponentCreator } from './component-creator';
import { getCoreScope } from '../composables/use-core-scope';

export { clearComponentCache, getCachedComponents } from './component-creator';

export function createComponent(
  schemaInput: VueJsonSchemaInput,
  options: CreateComponentOptions = {}
): Component {
  const coreScope = getCoreScope();
  return createComponentCreator(schemaInput, {
    ...options,
    coreScope,
  });
}
