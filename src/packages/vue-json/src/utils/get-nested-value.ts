export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || !path) return obj;

  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return result;
}
