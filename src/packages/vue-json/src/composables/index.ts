import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { parseJson, registerKeyParser, clearKeyParsers, type ParseConfig } from '@json-engine/core-engine';

interface UseJsonParserOptions {
  keyParsers?: ParseConfig['keyParsers'];
  autoParse?: boolean;
}

interface UseJsonParserReturn {
  parsedData: Ref<unknown>;
  parse: (json: unknown) => void;
  reset: () => void;
  isValid: ComputedRef<boolean>;
}

export function useJsonParser(
  initialData?: unknown,
  options: UseJsonParserOptions = {}
): UseJsonParserReturn {
  const { keyParsers, autoParse = true } = options;

  const parsedData = ref<unknown>(null);

  const isValid = computed(() => {
    return parsedData.value !== null;
  });

  const parse = (json: unknown): void => {
    try {
      parsedData.value = parseJson(json, { keyParsers });
    } catch (error) {
      console.error('JSON parsing failed:', error);
      parsedData.value = null;
    }
  };

  const reset = (): void => {
    parsedData.value = null;
  };

  if (initialData !== undefined && autoParse) {
    parse(initialData);
  }

  return {
    parsedData,
    parse,
    reset,
    isValid,
  };
}

interface UseKeyParserOptions {
  persist?: boolean;
}

interface UseKeyParserReturn {
  register: (keyName: string, parser: (key: string) => string) => void;
  clear: () => void;
}

export function useKeyParser(options: UseKeyParserOptions = {}): UseKeyParserReturn {
  const { persist = false } = options;

  const localParsers = new Map<string, (key: string) => string>();

  const register = (keyName: string, parser: (key: string) => string): void => {
    localParsers.set(keyName, parser);
    if (persist) {
      registerKeyParser(keyName, parser);
    }
  };

  const clear = (): void => {
    localParsers.clear();
    if (persist) {
      clearKeyParsers();
    }
  };

  return {
    register,
    clear,
  };
}

export function useParsedCallback(
  callback: ParseConfig['onParsed']
): { config: ParseConfig } {
  return {
    config: {
      onParsed: callback,
    },
  };
}