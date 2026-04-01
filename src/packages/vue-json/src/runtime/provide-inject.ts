import { provide, inject } from 'vue';
import type {
  ProvideDefinition,
  InjectDefinition,
  SetupContext,
  RenderContext,
  PropertyValue,
} from '../types';
import type { ExpressionParseData, FunctionParseData } from '@json-engine/core-engine';
import { ComponentCreationError } from '../utils/error';
import { evaluateExpression, executeFunction, isExpressionParseData, isFunctionParseData } from './value-resolver';

export function setupProvide(
  definition: ProvideDefinition | undefined,
  context: SetupContext,
  state: Record<string, unknown>,
  computed: Record<string, unknown>,
  methods: Record<string, (...args: unknown[]) => unknown>
): Record<string, unknown> {
  const provided: Record<string, unknown> = {};

  if (!definition) return provided;

  const renderContext: RenderContext = {
    props: context.props,
    state: state as RenderContext['state'],
    computed: computed as RenderContext['computed'],
    methods,
    components: {},
    slots: context.slots,
    attrs: context.attrs,
    emit: context.emit,
    provide: provided,
  };

  for (const item of definition.items) {
    try {
      const value = resolveProvideValue(item.value, renderContext);
      provide(item.key, value);
      provided[item.key] = value;
    } catch (error) {
      throw new ComponentCreationError(
        context.props?.['__componentName__'] as string || 'Unknown',
        `Failed to provide "${item.key}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return provided;
}

function resolveProvideValue(
  value: ExpressionParseData | FunctionParseData,
  context: RenderContext
): unknown {
  if (isExpressionParseData(value)) {
    return evaluateExpression(value.expression as string | Parameters<typeof evaluateExpression>[0], context);
  }
  if (isFunctionParseData(value)) {
    return executeFunction(value, context, []);
  }
  return value;
}

export function setupInject(
  definition: InjectDefinition | undefined,
  context: SetupContext
): Record<string, unknown> {
  const injected: Record<string, unknown> = {};

  if (!definition) return injected;

  for (const item of definition.items) {
    try {
      const defaultValue = item.default !== undefined ? resolveInjectDefault(item.default) : undefined;
      const value = inject(item.key, defaultValue);
      injected[item.key] = value;
    } catch (error) {
      throw new ComponentCreationError(
        context.props?.['__componentName__'] as string || 'Unknown',
        `Failed to inject "${item.key}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return injected;
}

function resolveInjectDefault(defaultValue: PropertyValue): unknown {
  if (defaultValue === null || defaultValue === undefined) {
    return defaultValue;
  }

  if (typeof defaultValue !== 'object') {
    return defaultValue;
  }

  if (isExpressionParseData(defaultValue)) {
    return undefined;
  }

  return defaultValue;
}