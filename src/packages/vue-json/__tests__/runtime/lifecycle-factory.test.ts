import { describe, it, expect, vi } from 'vitest';
import { setupLifecycle } from '../../src/runtime/lifecycle-factory';
import type { LifecycleDefinition, SetupContext } from '../../src/types';

describe('setupLifecycle', () => {
  const mockContext: SetupContext = {
    props: {},
    emit: () => {},
    slots: {},
    attrs: {},
  };

  it('should handle undefined definition', () => {
    expect(() => setupLifecycle(undefined, mockContext)).not.toThrow();
  });

  it('should handle empty definition', () => {
    expect(() => setupLifecycle({}, mockContext)).not.toThrow();
  });

  it('should handle onMounted hook', () => {
    const definition: LifecycleDefinition = {
      onMounted: 'console.log("mounted")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle onUnmounted hook', () => {
    const definition: LifecycleDefinition = {
      onUnmounted: 'console.log("unmounted")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle onUpdated hook', () => {
    const definition: LifecycleDefinition = {
      onUpdated: 'console.log("updated")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle onBeforeMount hook', () => {
    const definition: LifecycleDefinition = {
      onBeforeMount: 'console.log("before mount")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle onBeforeUnmount hook', () => {
    const definition: LifecycleDefinition = {
      onBeforeUnmount: 'console.log("before unmount")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle onBeforeUpdate hook', () => {
    const definition: LifecycleDefinition = {
      onBeforeUpdate: 'console.log("before update")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle onErrorCaptured hook', () => {
    const definition: LifecycleDefinition = {
      onErrorCaptured: 'console.log("error captured")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle multiple lifecycle hooks', () => {
    const definition: LifecycleDefinition = {
      onMounted: 'console.log("mounted")',
      onUnmounted: 'console.log("unmounted")',
      onUpdated: 'console.log("updated")',
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });

  it('should handle array of lifecycle hooks', () => {
    const definition: LifecycleDefinition = {
      onMounted: ['console.log("first")', 'console.log("second")'],
    };

    expect(() => setupLifecycle(definition, mockContext)).not.toThrow();
  });
});
