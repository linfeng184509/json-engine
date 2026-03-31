import type { MockMethod } from 'vite-plugin-mock';
import { validateToken } from './auth.mock';

interface MenuItem {
  key: string;
  title: string;
  icon?: string;
  path: string;
  children?: MenuItem[];
}

interface MockHeaders {
  authorization?: string;
}

const userProfiles: Record<number, { id: number; username: string; nickname: string; email: string; avatar: string }> = {
  1: {
    id: 1,
    username: 'admin',
    nickname: 'Administrator',
    email: 'admin@enterprise.com',
    avatar: '/assets/avatar.png',
  },
  2: {
    id: 2,
    username: 'user',
    nickname: 'Regular User',
    email: 'user@enterprise.com',
    avatar: '/assets/avatar.png',
  },
};

const userPermissions: Record<number, string[]> = {
  1: ['system:manage', 'user:view', 'user:edit', 'role:view', 'dashboard:view'],
  2: ['dashboard:view', 'profile:edit'],
};

const userMenus: Record<number, MenuItem[]> = {
  1: [
    { key: 'dashboard', title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    {
      key: 'system',
      title: 'System Management',
      icon: 'setting',
      path: '/system',
      children: [
        { key: 'user', title: 'User Management', path: '/system/user' },
        { key: 'role', title: 'Role Management', path: '/system/role' },
      ],
    },
    { key: 'basic-data-config', title: '基础数据配置', icon: 'database', path: '/basic-data-config' },
  ],
  2: [
    { key: 'dashboard', title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { key: 'profile', title: 'Profile', icon: 'user', path: '/profile' },
  ],
};

export const userMock: MockMethod[] = [
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ headers }: { headers: MockHeaders }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      const user = validateToken(token || '');
      
      if (!user) {
        return { status: 401, body: { error: 'Unauthorized' } };
      }
      
      return userProfiles[user.userId];
    },
  },
  {
    url: '/api/user/permissions',
    method: 'get',
    response: ({ headers }: { headers: MockHeaders }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      const user = validateToken(token || '');
      
      if (!user) {
        return { status: 401, body: { error: 'Unauthorized' } };
      }
      
      return userPermissions[user.userId];
    },
  },
  {
    url: '/api/user/menus',
    method: 'get',
    response: ({ headers }: { headers: MockHeaders }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      const user = validateToken(token || '');
      
      if (!user) {
        return { status: 401, body: { error: 'Unauthorized' } };
      }
      
      return userMenus[user.userId];
    },
  },
];