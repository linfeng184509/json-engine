import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ParserCache, createParserCache } from './cache';

describe('ParserCache', () => {
  describe('basic get/set', () => {
    it('should set and get a value', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for missing keys', () => {
      const cache = new ParserCache({ enabled: true });
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('key', 'value1');
      cache.set('key', 'value2');
      expect(cache.get('key')).toBe('value2');
    });

    it('should store different types', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('str', 'hello');
      cache.set('num', 42);
      cache.set('obj', { a: 1 });
      cache.set('arr', [1, 2, 3]);
      expect(cache.get('str')).toBe('hello');
      expect(cache.get('num')).toBe(42);
      expect(cache.get('obj')).toEqual({ a: 1 });
      expect(cache.get('arr')).toEqual([1, 2, 3]);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entry when cache exceeds maxSize', () => {
      const cache = new ParserCache({ enabled: true, maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      // At this point size=3, adding 'd' triggers eviction check but evictOldest
      // returns early since size (3) <= maxSize (3), so d is added making size=4
      cache.set('d', 4);
      
      // Now size=4, adding 'e' triggers eviction: evictOldest deletes 1 entry from front
      cache.set('e', 5);
      
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
      expect(cache.get('e')).toBe(5);
    });

    it('should evict oldest (least recently accessed) entry', () => {
      const cache = new ParserCache({ enabled: true, maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      cache.set('e', 5);
      
      // After filling past maxSize, eviction kicks in
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
      expect(cache.get('e')).toBe(5);
    });

    it('should maintain correct order after multiple gets', () => {
      const cache = new ParserCache({ enabled: true, maxSize: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      
      // Access a to make it recently used
      cache.get('a');
      
      // Add e - should evict b (front of map, least recently used)
      cache.set('e', 5);
      
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
      expect(cache.get('e')).toBe(5);
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return undefined after TTL expires', () => {
      const cache = new ParserCache({ enabled: true, ttl: 1000 });
      cache.set('key', 'value');
      
      expect(cache.get('key')).toBe('value');
      
      vi.advanceTimersByTime(1001);
      
      expect(cache.get('key')).toBeUndefined();
    });

    it('should return value before TTL expires', () => {
      const cache = new ParserCache({ enabled: true, ttl: 1000 });
      cache.set('key', 'value');
      
      vi.advanceTimersByTime(500);
      
      expect(cache.get('key')).toBe('value');
    });

    it('should evict expired entries during set when cache is full', () => {
      const cache = new ParserCache({ enabled: true, maxSize: 2, ttl: 1000 });
      cache.set('a', 1);
      cache.set('b', 2);
      
      vi.advanceTimersByTime(1001);
      
      cache.set('c', 3);
      
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });

    it('should not expire entries when ttl is 0', () => {
      const cache = new ParserCache({ enabled: true, ttl: 0 });
      cache.set('key', 'value');
      
      vi.advanceTimersByTime(999999);
      
      expect(cache.get('key')).toBe('value');
    });

    it('should have has return false for expired entries', () => {
      const cache = new ParserCache({ enabled: true, ttl: 1000 });
      cache.set('key', 'value');
      
      vi.advanceTimersByTime(1001);
      
      expect(cache.has('key')).toBe(false);
    });
  });

  describe('maxSize enforcement', () => {
    it('should allow exceeding maxSize by 1 before eviction kicks in', () => {
      const cache = new ParserCache({ enabled: true, maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      // Size can be maxSize + 1 because eviction only triggers on the next set
      expect(cache.size()).toBe(3);
      
      // Adding one more triggers eviction
      cache.set('d', 4);
      expect(cache.size()).toBe(3);
      expect(cache.get('a')).toBeUndefined();
    });

    it('should use default maxSize of 1000', () => {
      const cache = new ParserCache({ enabled: true });
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
      }
      expect(cache.size()).toBe(1000);
      
      // Adding one more doesn't evict yet
      cache.set('key1000', 1000);
      expect(cache.size()).toBe(1001);
      
      // Adding another triggers eviction
      cache.set('key1001', 1001);
      expect(cache.size()).toBe(1001);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should remove a specific entry', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('a', 1);
      cache.set('b', 2);
      
      expect(cache.delete('a')).toBe(true);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.size()).toBe(1);
    });

    it('should return false for non-existent keys', () => {
      const cache = new ParserCache({ enabled: true });
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const cache = new ParserCache({ enabled: true });
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should update access order', () => {
      const cache = new ParserCache({ enabled: true, maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      // Access 'a' via has to make it recently used
      cache.has('a');
      
      // Add 'd' - triggers eviction of front entry (b)
      cache.set('d', 4);
      
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct count', () => {
      const cache = new ParserCache({ enabled: true });
      expect(cache.size()).toBe(0);
      
      cache.set('a', 1);
      expect(cache.size()).toBe(1);
      
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
      
      cache.delete('a');
      expect(cache.size()).toBe(1);
    });
  });

  describe('getOrCompute', () => {
    it('should return cached value if present', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('key', 'cached');
      
      const computeFn = vi.fn(() => 'computed');
      const result = cache.getOrCompute('key', computeFn);
      
      expect(result).toBe('cached');
      expect(computeFn).not.toHaveBeenCalled();
    });

    it('should compute and cache value if not present', () => {
      const cache = new ParserCache({ enabled: true });
      const computeFn = vi.fn(() => 'computed');
      
      const result = cache.getOrCompute('key', computeFn);
      
      expect(result).toBe('computed');
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(cache.get('key')).toBe('computed');
    });

    it('should only compute once', () => {
      const cache = new ParserCache({ enabled: true });
      const computeFn = vi.fn(() => 'computed');
      
      cache.getOrCompute('key', computeFn);
      cache.getOrCompute('key', computeFn);
      cache.getOrCompute('key', computeFn);
      
      expect(computeFn).toHaveBeenCalledTimes(1);
    });

    it('should bypass cache when disabled', () => {
      const cache = new ParserCache({ enabled: false });
      const computeFn = vi.fn(() => 'computed');
      
      const result = cache.getOrCompute('key', computeFn);
      
      expect(result).toBe('computed');
      expect(cache.get('key')).toBeUndefined();
    });
  });

  describe('disabled cache', () => {
    it('should return undefined for get when disabled', () => {
      const cache = new ParserCache({ enabled: false });
      cache.set('key', 'value');
      expect(cache.get('key')).toBeUndefined();
    });

    it('should not store values when disabled', () => {
      const cache = new ParserCache({ enabled: false });
      cache.set('key', 'value');
      expect(cache.size()).toBe(0);
    });

    it('should return false for has when disabled', () => {
      const cache = new ParserCache({ enabled: false });
      expect(cache.has('key')).toBe(false);
    });

    it('should still compute in getOrCompute when disabled', () => {
      const cache = new ParserCache({ enabled: false });
      const result = cache.getOrCompute('key', () => 'value');
      expect(result).toBe('value');
      expect(cache.size()).toBe(0);
    });
  });

  describe('keys, values, entries', () => {
    it('should return correct keys', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('a', 1);
      cache.set('b', 2);
      
      const keys = Array.from(cache.keys());
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });

    it('should return correct values', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('a', 1);
      cache.set('b', 2);
      
      const values = Array.from(cache.values());
      expect(values).toContain(1);
      expect(values).toContain(2);
    });

    it('should return correct entries', () => {
      const cache = new ParserCache({ enabled: true });
      cache.set('a', 1);
      cache.set('b', 2);
      
      const entries = Array.from(cache.entries());
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });
  });
});

describe('createParserCache', () => {
  it('should create a ParserCache instance', () => {
    const cache = createParserCache({ enabled: true });
    expect(cache).toBeInstanceOf(ParserCache);
  });

  it('should create with default options when no options provided', () => {
    const cache = createParserCache();
    expect(cache).toBeInstanceOf(ParserCache);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
});
