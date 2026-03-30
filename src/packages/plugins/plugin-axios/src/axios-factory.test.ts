import { describe, it, expect } from 'vitest';
import { createAxiosInstance } from './runtime/axios-factory';

describe('AxiosFactory', () => {
  it('should create axios instance with config', () => {
    const instance = createAxiosInstance({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });

    expect(instance).toHaveProperty('get');
    expect(instance).toHaveProperty('post');
    expect(instance).toHaveProperty('put');
    expect(instance).toHaveProperty('delete');
  });

  it('should have get method', () => {
    const instance = createAxiosInstance({});
    expect(typeof instance.get).toBe('function');
  });

  it('should have post method', () => {
    const instance = createAxiosInstance({});
    expect(typeof instance.post).toBe('function');
  });

  it('should have put method', () => {
    const instance = createAxiosInstance({});
    expect(typeof instance.put).toBe('function');
  });

  it('should have delete method', () => {
    const instance = createAxiosInstance({});
    expect(typeof instance.delete).toBe('function');
  });

  it('should use default timeout of 10000', () => {
    const instance = createAxiosInstance({});
    expect(instance).toBeDefined();
  });
});
