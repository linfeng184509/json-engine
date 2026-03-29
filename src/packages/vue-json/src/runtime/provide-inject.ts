import { provide, inject } from 'vue';
import type {
  ProvideDefinition,
  InjectDefinition,
  SetupContext,
  RenderContext,
  ExpressionValue,
  FunctionValue,
  PropertyValue,
} from '../types';
import { ComponentCreationError } from '../utils/error';
import { resolvePropertyValue, evaluateExpression, executeFunction, isExpressionValue, isFunctionValue } from './value-resolver';

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
  value: ExpressionValue | FunctionValue,
  context: RenderContext
): unknown {
  if (isExpressionValue(value)) {
    return evaluateExpression(value.expression, context);
  }
  if (isFunctionValue(value)) {
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

  if (isExpressionValue(defaultValue)) {
    return undefined;
  }

  return defaultValue;
}