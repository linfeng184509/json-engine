import { createComponentCreator } from './component-creator';
import { getCoreScope } from '../composables/use-core-scope';
export { clearComponentCache, getCachedComponents } from './component-creator';
export function createComponent(schemaInput, options = {}) {
    const coreScope = getCoreScope();
    return createComponentCreator(schemaInput, {
        ...options,
        coreScope,
    });
}
//# sourceMappingURL=component-factory.js.map