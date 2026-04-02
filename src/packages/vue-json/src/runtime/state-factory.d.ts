import { type Ref, type Reactive } from 'vue';
import type { StateDefinition, SetupContext } from '../types';
export declare function createState(definition: StateDefinition | undefined, context: SetupContext): Record<string, Ref | Reactive<unknown>>;
/**
 * Creates a Proxy wrapper around the state object that automatically
 * unwraps `.value` from Vue ref objects when accessed via get,
 * and wraps values in `.value` when setting.
 *
 * This allows $state.count to work without explicit .value references.
 */
export declare function createStateProxy(state: Record<string, Ref | Reactive<unknown>>): Record<string, unknown>;
//# sourceMappingURL=state-factory.d.ts.map