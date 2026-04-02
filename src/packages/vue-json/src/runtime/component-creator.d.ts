import { type Component } from 'vue';
import type { VueJsonSchemaInput } from '../types';
import type { CoreScope } from '../composables/use-core-scope';
export interface ComponentCreatorOptions {
    cache?: boolean;
    injectStyles?: boolean;
    debug?: boolean;
    extraComponents?: Record<string, Component>;
    registerPageLoader?: boolean;
    coreScope?: CoreScope;
}
export declare function createComponentCreator(schemaInput: VueJsonSchemaInput, options?: ComponentCreatorOptions): Component;
export declare function clearComponentCache(): void;
export declare function getCachedComponents(): Map<string, Component>;
//# sourceMappingURL=component-creator.d.ts.map