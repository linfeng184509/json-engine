import type { VueJsonSchema, PropsDefinition, StateDefinition, ComputedDefinition, MethodsDefinition } from '../types';

const TYPE_MAP: Record<string, string> = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Array: 'Array<unknown>',
  Object: 'Record<string, unknown>',
  Function: '(...args: unknown[]) => unknown',
  Symbol: 'symbol',
  BigInt: 'bigint',
};

export function generatePropsType(props: PropsDefinition | undefined): string {
  if (!props) return '{}';

  const entries = Object.entries(props).map(([name, def]) => {
    const types = def.type
      ? Array.isArray(def.type)
        ? def.type.map((t) => TYPE_MAP[t] || 'unknown')
        : [TYPE_MAP[def.type] || 'unknown']
      : ['unknown'];

    const optional = def.required ? '' : '?';
    const unionType = types.join(' | ');

    return `  ${name}${optional}: ${unionType};`;
  });

  return `{\n${entries.join('\n')}\n}`;
}

export function generateStateType(state: StateDefinition | undefined): string {
  if (!state) return '{}';

  const entries = Object.entries(state).map(([name, def]) => {
    let type = 'unknown';

    if (def.initial !== undefined) {
      type = inferTypeFromValue(def.initial);
    }

    if (def.type === 'ref' || def.type === 'shallowRef') {
      return `  ${name}: Ref<${type}>;`;
    }

    if (def.type === 'reactive' || def.type === 'shallowReactive') {
      return `  ${name}: Reactive<${type}>;`;
    }

    return `  ${name}: ${type};`;
  });

  return `{\n${entries.join('\n')}\n}`;
}

export function generateComputedType(computed: ComputedDefinition | undefined): string {
  if (!computed) return '{}';

  const entries = Object.entries(computed).map(([name]) => {
    return `  ${name}: ComputedRef<unknown>;`;
  });

  return `{\n${entries.join('\n')}\n}`;
}

export function generateMethodsType(methods: MethodsDefinition | undefined): string {
  if (!methods) return '{}';

  const entries = Object.entries(methods).map(([name]) => {
    return `  ${name}: (...args: unknown[]) => unknown;`;
  });

  return `{\n${entries.join('\n')}\n}`;
}

export function generateTypes(schema: VueJsonSchema): string {
  const propsType = generatePropsType(schema.props);
  const stateType = generateStateType(schema.state);
  const computedType = generateComputedType(schema.computed);
  const methodsType = generateMethodsType(schema.methods);

  return `// Auto-generated types for ${schema.name}
import type { Ref, Reactive, ComputedRef } from 'vue';

export interface ${schema.name}Props ${propsType}

export interface ${schema.name}State ${stateType}

export interface ${schema.name}Computed ${computedType}

export interface ${schema.name}Methods ${methodsType}

export interface ${schema.name}Context {
  props: ${schema.name}Props;
  state: ${schema.name}State;
  computed: ${schema.name}Computed;
  methods: ${schema.name}Methods;
}
`;
}

export function writeTypeDefinition(
  schema: VueJsonSchema,
  outputPath: string
): void {
  const types = generateTypes(schema);
  const { writeFileSync } = require('fs');
  const { resolve } = require('path');
  const resolvedPath = resolve(outputPath);

  writeFileSync(resolvedPath, types, 'utf-8');
}

function inferTypeFromValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'function':
      return '(...args: unknown[]) => unknown';
    case 'object':
      if (Array.isArray(value)) {
        return 'Array<unknown>';
      }
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

export function inferSchemaType(schema: VueJsonSchema): {
  props: string;
  state: string;
  computed: string;
  methods: string;
} {
  return {
    props: generatePropsType(schema.props),
    state: generateStateType(schema.state),
    computed: generateComputedType(schema.computed),
    methods: generateMethodsType(schema.methods),
  };
}