import type { VueJsonSchema, PropsDefinition, StateDefinition, ComputedDefinition, MethodsDefinition } from '../types';
export declare function generatePropsType(props: PropsDefinition | undefined): string;
export declare function generateStateType(state: StateDefinition | undefined): string;
export declare function generateComputedType(computed: ComputedDefinition | undefined): string;
export declare function generateMethodsType(methods: MethodsDefinition | undefined): string;
export declare function generateTypes(schema: VueJsonSchema): string;
export declare function writeTypeDefinition(schema: VueJsonSchema, outputPath: string): void;
export declare function inferSchemaType(schema: VueJsonSchema): {
    props: string;
    state: string;
    computed: string;
    methods: string;
};
//# sourceMappingURL=type-generator.d.ts.map