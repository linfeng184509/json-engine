interface CacheOptions {
  enabled: boolean;
  maxSize?: number;
  ttl?: number;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class ParserCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private enabled: boolean;
  private maxSize: number;
  private ttl: number;

  constructor(options: CacheOptions = { enabled: true }) {
    this.enabled = options.enabled;
    this.maxSize = options.maxSize ?? 1000;
    this.ttl = options.ttl ?? 0;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    if (this.ttl <= 0) return false;
    return Date.now() - entry.timestamp > this.ttl;
  }

  private evictExpired(): void {
    if (this.ttl <= 0) return;
    
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    if (this.cache.size <= this.maxSize) return;
    
    const entriesToDelete = this.cache.size - this.maxSize;
    const keys = Array.from(this.cache.keys());
    
    for (let i = 0; i < entriesToDelete; i++) {
      this.cache.delete(keys[i]);
    }
  }

  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;
    
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  set<T>(key: string, value: T): void {
    if (!this.enabled) return;
    
    this.evictExpired();
    this.evictOldest();
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  getOrCompute<T>(key: string, compute: () => T): T {
    if (!this.enabled) {
      return compute();
    }
    
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const value = compute();
    this.set(key, value);
    return value;
  }

  has(key: string): boolean {
    if (!this.enabled) return false;
    
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  values(): IterableIterator<unknown> {
    return Array.from(this.cache.values()).map(entry => entry.value)[Symbol.iterator]();
  }

  entries(): IterableIterator<[string, unknown]> {
    return Array.from(this.cache.entries()).map(
      ([key, entry]) => [key, entry.value] as [string, unknown]
    )[Symbol.iterator]();
  }
}

function createParserCache(options?: CacheOptions): ParserCache {
  return new ParserCache(options);
}

export {
  ParserCache,
  createParserCache,
};

export type {
  CacheOptions,
  CacheEntry,
};
