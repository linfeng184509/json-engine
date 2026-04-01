import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';
import {
  basicDataTree,
  roleStore,
  getAllPermissionsFlat,
  compareRoles,
  type Role,
} from './shared-data';

const MockRandom = Mock.Random;

export const roleMock: MockMethod[] = [
  {
    url: '/api/role/list',
    method: 'get',
    response: ({ query }: { query: { page?: string | number; pageSize?: string | number; keyword?: string; status?: string } }) => {
      const page = typeof query.page === 'number' ? query.page : parseInt(query.page || '1');
      const pageSize = typeof query.pageSize === 'number' ? query.pageSize : parseInt(query.pageSize || '10');
      const keyword = query.keyword || '';
      const status = query.status || '';
      
      let filtered = roleStore;
      
      if (keyword) {
        filtered = filtered.filter(r => 
          r.name.includes(keyword) || 
          r.code.includes(keyword) ||
          r.description.includes(keyword)
        );
      }
      
      if (status) {
        filtered = filtered.filter(r => r.status === status);
      }
      
      const start = (page - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);
      
      return {
        success: true,
        data: {
          list,
          total: filtered.length,
          page,
          pageSize
        }
      };
    }
  },
  {
    url: '/api/role/:id',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      const role = roleStore.find(r => r.id === params.id);
      if (!role) {
        return { success: false, error: '角色不存在' };
      }
      return { success: true, data: role };
    }
  },
  {
    url: '/api/role',
    method: 'post',
    response: ({ body }: { body: Partial<Role> }) => {
      const newRole: Role = {
        id: MockRandom.guid(),
        code: body.code || `role_${Date.now()}`,
        name: body.name || '新角色',
        description: body.description || '',
        status: body.status || 'active',
        permissions: body.permissions || {
          pages: [],
          forms: [],
          fields: []
        },
        createdAt: MockRandom.datetime(),
        updatedAt: MockRandom.datetime()
      };
      
      if (roleStore.some(r => r.code === newRole.code)) {
        return { success: false, error: '角色编码已存在' };
      }
      
      roleStore.push(newRole);
      return { success: true, data: newRole };
    }
  },
  {
    url: '/api/role/:id',
    method: 'put',
    response: ({ params, body }: { params: { id: string }; body: Partial<Role> }) => {
      const index = roleStore.findIndex(r => r.id === params.id);
      if (index === -1) {
        return { success: false, error: '角色不存在' };
      }
      
      if (body.code && body.code !== roleStore[index].code) {
        if (roleStore.some(r => r.code === body.code && r.id !== params.id)) {
          return { success: false, error: '角色编码已存在' };
        }
      }
      
      roleStore[index] = {
        ...roleStore[index],
        ...body,
        updatedAt: MockRandom.datetime()
      };
      
      return { success: true, data: roleStore[index] };
    }
  },
  {
    url: '/api/role/:id',
    method: 'delete',
    response: ({ params }: { params: { id: string } }) => {
      const index = roleStore.findIndex(r => r.id === params.id);
      if (index === -1) {
        return { success: false, error: '角色不存在' };
      }
      
      if (['r1', 'r2'].includes(params.id)) {
        return { success: false, error: '系统内置角色不能删除' };
      }
      
      roleStore.splice(index, 1);
      return { success: true };
    }
  },
  {
    url: '/api/role/:id/permissions',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      const role = roleStore.find(r => r.id === params.id);
      if (!role) {
        return { success: false, error: '角色不存在' };
      }
      
      const permissions = getAllPermissionsFlat(role);
      return { success: true, data: permissions };
    }
  },
  {
    url: '/api/role/:id/permissions',
    method: 'put',
    response: ({ params, body }: { params: { id: string }; body: { permissions: Role['permissions'] } }) => {
      const index = roleStore.findIndex(r => r.id === params.id);
      if (index === -1) {
        return { success: false, error: '角色不存在' };
      }
      
      roleStore[index].permissions = body.permissions;
      roleStore[index].updatedAt = MockRandom.datetime();
      
      return { success: true, data: roleStore[index].permissions };
    }
  },
  {
    url: '/api/permission-tree',
    method: 'get',
    response: () => {
      return { success: true, data: basicDataTree };
    }
  },
  {
    url: '/api/role/:id/permissions/preview',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      const role = roleStore.find(r => r.id === params.id);
      if (!role) {
        return { success: false, error: '角色不存在' };
      }
      
      const permissions = getAllPermissionsFlat(role);
      
      const stats = {
        pageLevel: role.permissions.pages.length,
        formLevel: role.permissions.forms.length,
        fieldLevel: permissions.fields.filter(f => !f.inherited).length,
        inheritedFieldLevel: permissions.fields.filter(f => f.inherited).length,
        total: permissions.fields.length
      };
      
      return {
        success: true,
        data: {
          permissions,
          stats,
          inheritanceTree: permissions.inheritanceTree
        }
      };
    }
  },
  {
    url: '/api/role/compare',
    method: 'get',
    response: ({ query }: { query: { roleId1: string; roleId2: string } }) => {
      if (!query.roleId1 || !query.roleId2) {
        return { success: false, error: '缺少角色ID参数' };
      }
      
      const result = compareRoles(query.roleId1, query.roleId2);
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result };
    }
  },
  {
    url: '/api/role/all',
    method: 'get',
    response: () => {
      return {
        success: true,
        data: roleStore.map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          status: r.status
        }))
      };
    }
  }
];