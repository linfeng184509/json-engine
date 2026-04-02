import type { ProvideDefinition, InjectDefinition, SetupContext } from '../types';
export declare function setupProvide(definition: ProvideDefinition | undefined, context: SetupContext, state: Record<string, unknown>, computed: Record<string, unknown>, methods: Record<string, (...args: unknown[]) => unknown>): Record<string, unknown>;
export declare function setupInject(definition: InjectDefinition | undefined, context: SetupContext): Record<string, unknown>;
//# sourceMappingURL=provide-inject.d.ts.map