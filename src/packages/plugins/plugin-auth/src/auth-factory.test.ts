import { describe, it, expect } from 'vitest';
import { createAuthInstance } from './runtime/auth-factory';

describe('AuthFactory', () => {
  it('should create auth instance', () => {
    const auth = createAuthInstance({});
    expect(auth).toHaveProperty('login');
    expect(auth).toHaveProperty('logout');
    expect(auth).toHaveProperty('getUser');
    expect(auth).toHaveProperty('hasPermission');
    expect(auth).toHaveProperty('hasRole');
  });

  it('should return null user initially', () => {
    const auth = createAuthInstance({});
    expect(auth.getUser()).toBeNull();
  });

  it('should login and return user', async () => {
    const auth = createAuthInstance({});
    const user = await auth.login({ username: 'test', password: '123' });

    expect(user).not.toBeNull();
    expect(user?.id).toBe('1');
    expect(user?.name).toBe('User');
  });

  it('should check permission', async () => {
    const auth = createAuthInstance({});
    await auth.login({});

    expect(auth.hasPermission('read')).toBe(true);
    expect(auth.hasPermission('write')).toBe(true);
    expect(auth.hasPermission('admin')).toBe(false);
  });

  it('should check role', async () => {
    const auth = createAuthInstance({});
    await auth.login({});

    expect(auth.hasRole('user')).toBe(true);
    expect(auth.hasRole('admin')).toBe(false);
  });

  it('should logout and clear user', async () => {
    const auth = createAuthInstance({});
    await auth.login({});
    auth.logout();

    expect(auth.getUser()).toBeNull();
  });
});
