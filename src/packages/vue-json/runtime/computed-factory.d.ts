import { type ComputedRef, type WritableComputedRef } from 'vue';
import type { ComputedDefinition, SetupContext } from '../types';
export declare function createComputed(definition: ComputedDefinition | undefined, context: SetupContext, state: Record<string, unknown>, stateTypes?: Record<string, 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly'>, coreScope?: Record<string, unknown>): Record<string, ComputedRef<unknown> | WritableComputedRef<unknown>>;
//# sourceMappingURL=computed-factory.d.ts.map