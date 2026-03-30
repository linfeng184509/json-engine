// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createRouterInstance } from './runtime/router-factory';

describe('RouterFactory', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('should create router instance', () => {
    const router = createRouterInstance({});
    expect(router).toHaveProperty('push');
    expect(router).toHaveProperty('replace');
    expect(router).toHaveProperty('back');
    expect(router).toHaveProperty('forward');
    expect(router).toHaveProperty('go');
    expect(router).toHaveProperty('getCurrentRoute');
  });

  it('should return current hash route', () => {
    window.location.hash = '#/dashboard';
    const router = createRouterInstance({});
    expect(router.getCurrentRoute()).toBe('/dashboard');
  });

  it('should return / when no hash', () => {
    window.location.hash = '';
    const router = createRouterInstance({});
    expect(router.getCurrentRoute()).toBe('/');
  });

  it('should push new route', () => {
    const router = createRouterInstance({});
    router.push('/users');

    expect(window.location.hash).toBe('#/users');
    expect(router.getCurrentRoute()).toBe('/users');
  });

  it('should replace route', () => {
    const router = createRouterInstance({});
    router.replace('/about');

    expect(router.getCurrentRoute()).toBe('/about');
  });

  it('should have back function', () => {
    const router = createRouterInstance({});
    expect(typeof router.back).toBe('function');
  });

  it('should have forward function', () => {
    const router = createRouterInstance({});
    expect(typeof router.forward).toBe('function');
  });

  it('should have go function', () => {
    const router = createRouterInstance({});
    expect(typeof router.go).toBe('function');
  });
});