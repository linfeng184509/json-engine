import Mock from 'mockjs';

const MockRandom = Mock.Random;

export interface BasicDataNode {
  id: string;
  code: string;
  name: string;
  type: 'platform' | 'menu' | 'page' | 'feature' | 'form' | 'field';
  parentId: string | null;
  permissions?: {
    read: boolean;
    write: boolean;
    hidden: boolean;
    privacy: boolean;
  };
  children?: BasicDataNode[];
}

export const basicDataTree: BasicDataNode[] = [
  {
    id: 'p1',
    code: 'enterprise-admin',
    name: '企业管理平台',
    type: 'platform',
    parentId: null,
    children: [
      {
        id: 'm1',
        code: 'dashboard',
        name: 'Dashboard',
        type: 'menu',
        parentId: 'p1',
        children: [
          {
            id: 'pg1',
            code: 'dashboard-home',
            name: '首页',
            type: 'page',
            parentId: 'm1',
            children: [
              {
                id: 'f1',
                code: 'visit-chart',
                name: '访问图表',
                type: 'feature',
                parentId: 'pg1',
                children: [
                  {
                    id: 'fm1',
                    code: 'chart-config',
                    name: '图表配置',
                    type: 'form',
                    parentId: 'f1',
                    children: [
                      {
                        id: 'fd1',
                        code: 'title',
                        name: '标题',
                        type: 'field',
                        parentId: 'fm1',
                        permissions: { read: true, write: true, hidden: false, privacy: false }
                      },
                      {
                        id: 'fd2',
                        code: 'data-range',
                        name: '数据范围',
                        type: 'field',
                        parentId: 'fm1',
                        permissions: { read: true, write: true, hidden: false, privacy: false }
                      },
                      {
                        id: 'fd3',
                        code: 'user-email',
                        name: '用户邮箱',
                        type: 'field',
                        parentId: 'fm1',
                        permissions: { read: true, write: false, hidden: false, privacy: true }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'm2',
        code: 'system',
        name: '系统管理',
        type: 'menu',
        parentId: 'p1',
        children: [
          {
            id: 'pg2',
            code: 'user-management',
            name: '用户管理',
            type: 'page',
            parentId: 'm2',
            children: [
              {
                id: 'f2',
                code: 'user-form',
                name: '用户表单',
                type: 'feature',
                parentId: 'pg2',
                children: [
                  {
                    id: 'fm2',
                    code: 'user-basic-info',
                    name: '基本信息',
                    type: 'form',
                    parentId: 'f2',
                    children: [
                      {
                        id: 'fd4',
                        code: 'username',
                        name: '用户名',
                        type: 'field',
                        parentId: 'fm2',
                        permissions: { read: true, write: true, hidden: false, privacy: false }
                      },
                      {
                        id: 'fd5',
                        code: 'password',
                        name: '密码',
                        type: 'field',
                        parentId: 'fm2',
                        permissions: { read: false, write: true, hidden: true, privacy: true }
                      },
                      {
                        id: 'fd6',
                        code: 'email',
                        name: '邮箱',
                        type: 'field',
                        parentId: 'fm2',
                        permissions: { read: true, write: true, hidden: false, privacy: true }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export function findNodeById(nodes: BasicDataNode[], id: string): BasicDataNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function addChildNode(parentId: string, newNode: BasicDataNode): boolean {
  const parent = findNodeById(basicDataTree, parentId);
  if (parent) {
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);
    return true;
  }
  return false;
}

export function deleteNodeById(id: string): boolean {
  for (let i = 0; i < basicDataTree.length; i++) {
    if (basicDataTree[i].id === id) {
      basicDataTree.splice(i, 1);
      return true;
    }
    if (basicDataTree[i].children) {
      const deleted = deleteChildNode(basicDataTree[i].children!, id);
      if (deleted) return true;
    }
  }
  return false;
}

function deleteChildNode(children: BasicDataNode[], id: string): boolean {
  for (let i = 0; i < children.length; i++) {
    if (children[i].id === id) {
      children.splice(i, 1);
      return true;
    }
    if (children[i].children) {
      const deleted = deleteChildNode(children[i].children!, id);
      if (deleted) return true;
    }
  }
  return false;
}

export function generateId(): string {
  return MockRandom.guid();
}

export interface FieldPermission {
  fieldId: string;
  fieldCode: string;
  fieldName: string;
  read: boolean;
  write: boolean;
  hidden: boolean;
  privacy: boolean;
  inherited: boolean;
  inheritedFrom?: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  permissions: {
    pages: string[];
    forms: string[];
    fields: FieldPermission[];
  };
  createdAt: string;
  updatedAt: string;
}

export const roleStore: Role[] = [
  {
    id: 'r1',
    code: 'admin',
    name: '系统管理员',
    description: '拥有系统所有权限，可管理所有模块',
    status: 'active',
    permissions: {
      pages: ['*'],
      forms: ['*'],
      fields: []
    },
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-15 10:30:00'
  },
  {
    id: 'r2',
    code: 'user',
    name: '普通用户',
    description: '基础访问权限，可查看和编辑自己的数据',
    status: 'active',
    permissions: {
      pages: ['dashboard:view', 'profile:edit'],
      forms: ['user-basic-info:edit'],
      fields: [
        {
          fieldId: 'fd4',
          fieldCode: 'username',
          fieldName: '用户名',
          read: true,
          write: false,
          hidden: false,
          privacy: false,
          inherited: false
        },
        {
          fieldId: 'fd6',
          fieldCode: 'email',
          fieldName: '邮箱',
          read: true,
          write: true,
          hidden: false,
          privacy: true,
          inherited: false
        }
      ]
    },
    createdAt: '2024-01-05 08:00:00',
    updatedAt: '2024-01-10 14:20:00'
  },
  {
    id: 'r3',
    code: 'viewer',
    name: '访客',
    description: '只读权限，可查看公开信息',
    status: 'active',
    permissions: {
      pages: ['dashboard:view'],
      forms: [],
      fields: [
        {
          fieldId: 'fd1',
          fieldCode: 'title',
          fieldName: '标题',
          read: true,
          write: false,
          hidden: false,
          privacy: false,
          inherited: true,
          inheritedFrom: 'dashboard:view'
        }
      ]
    },
    createdAt: '2024-01-08 09:00:00',
    updatedAt: '2024-01-08 09:00:00'
  },
  {
    id: 'r4',
    code: 'manager',
    name: '运营管理员',
    description: '可管理内容配置和数据分析',
    status: 'inactive',
    permissions: {
      pages: ['dashboard:view', 'user:view'],
      forms: ['user-basic-info:view', 'chart-config:edit'],
      fields: []
    },
    createdAt: '2024-01-10 11:00:00',
    updatedAt: '2024-01-20 16:45:00'
  }
];

export function calculateInheritedPermissions(role: Role): FieldPermission[] {
  const result: FieldPermission[] = [];
  
  function traverseTree(nodes: BasicDataNode[], inheritedPermissions: string[] = []) {
    for (const node of nodes) {
      if (node.type === 'page') {
        const hasPagePermission = role.permissions.pages.includes('*') || 
          role.permissions.pages.includes(node.code);
        const newInherited = hasPagePermission ? [...inheritedPermissions, node.code] : inheritedPermissions;
        
        if (node.children) {
          traverseTree(node.children, newInherited);
        }
      } else if (node.type === 'feature') {
        if (node.children) {
          traverseTree(node.children, inheritedPermissions);
        }
      } else if (node.type === 'form') {
        const hasFormPermission = role.permissions.forms.includes('*') || 
          role.permissions.forms.includes(node.code);
        const newInherited = hasFormPermission ? [...inheritedPermissions, node.code] : inheritedPermissions;
        
        if (node.children) {
          traverseTree(node.children, newInherited);
        }
      } else if (node.type === 'field') {
        const existingField = role.permissions.fields.find(f => f.fieldId === node.id);
        
        if (existingField) {
          result.push({
            ...existingField,
            inherited: false
          });
        } else if (inheritedPermissions.length > 0) {
          const topmostInheritance = inheritedPermissions[0];
          result.push({
            fieldId: node.id,
            fieldCode: node.code,
            fieldName: node.name,
            read: true,
            write: false,
            hidden: false,
            privacy: false,
            inherited: true,
            inheritedFrom: topmostInheritance
          });
        }
      }
    }
  }
  
  traverseTree(basicDataTree);
  return result;
}

export function getAllPermissionsFlat(role: Role): {
  pages: string[];
  forms: string[];
  fields: FieldPermission[];
  inheritanceTree: Record<string, any>;
} {
  const fields = calculateInheritedPermissions(role);
  
  const inheritanceTree: Record<string, any> = {};
  
  function buildTree(nodes: BasicDataNode[], parentKey: string = 'root') {
    for (const node of nodes) {
      const nodeKey = `${node.type}:${node.code}`;
      
      if (node.type === 'page' || node.type === 'form') {
        inheritanceTree[nodeKey] = {
          id: node.id,
          code: node.code,
          name: node.name,
          type: node.type,
          inherited: false,
          children: {}
        };
        
        if (node.children) {
          buildTree(node.children, nodeKey);
        }
      } else if (node.type === 'field') {
        const fieldPerm = fields.find(f => f.fieldId === node.id);
        if (fieldPerm && inheritanceTree[parentKey]) {
          inheritanceTree[parentKey].children[nodeKey] = {
            id: node.id,
            code: node.code,
            name: node.name,
            type: 'field',
            ...fieldPerm
          };
        }
      } else if (node.children) {
        buildTree(node.children, parentKey);
      }
    }
  }
  
  buildTree(basicDataTree);
  
  return {
    pages: role.permissions.pages,
    forms: role.permissions.forms,
    fields,
    inheritanceTree
  };
}

export function compareRoles(roleId1: string, roleId2: string) {
  const role1 = roleStore.find(r => r.id === roleId1);
  const role2 = roleStore.find(r => r.id === roleId2);
  
  if (!role1 || !role2) {
    return { error: 'Role not found' };
  }
  
  const perm1 = getAllPermissionsFlat(role1);
  const perm2 = getAllPermissionsFlat(role2);
  
  const added: string[] = [];
  const removed: string[] = [];
  const common: string[] = [];
  
  for (const page of perm1.pages) {
    if (page === '*') {
      added.push('*:all-pages');
    } else if (!perm2.pages.includes(page) && !perm2.pages.includes('*')) {
      added.push(`page:${page}`);
    }
  }
  
  for (const page of perm2.pages) {
    if (page === '*') continue;
    if (!perm1.pages.includes(page) && !perm1.pages.includes('*')) {
      removed.push(`page:${page}`);
    }
  }
  
  for (const page of perm1.pages) {
    if (page !== '*' && perm2.pages.includes(page)) {
      common.push(`page:${page}`);
    }
  }
  
  for (const form of perm1.forms) {
    if (form === '*') {
      if (!added.includes('*:all-forms')) added.push('*:all-forms');
    } else if (!perm2.forms.includes(form) && !perm2.forms.includes('*')) {
      added.push(`form:${form}`);
    }
  }
  
  for (const form of perm2.forms) {
    if (form === '*') continue;
    if (!perm1.forms.includes(form) && !perm1.forms.includes('*')) {
      removed.push(`form:${form}`);
    }
  }
  
  for (const field1 of perm1.fields) {
    const field2 = perm2.fields.find(f => f.fieldId === field1.fieldId);
    if (field2) {
      if (field1.read === field2.read && 
          field1.write === field2.write && 
          field1.hidden === field2.hidden && 
          field1.privacy === field2.privacy) {
        common.push(`field:${field1.fieldCode}`);
      } else {
        added.push(`field:${field1.fieldCode}`);
      }
    } else if (!field1.inherited) {
      added.push(`field:${field1.fieldCode}`);
    }
  }
  
  for (const field2 of perm2.fields) {
    if (!field2.inherited) {
      const field1 = perm1.fields.find(f => f.fieldId === field2.fieldId);
      if (!field1) {
        removed.push(`field:${field2.fieldCode}`);
      }
    }
  }
  
  return {
    role1: { id: role1.id, name: role1.name },
    role2: { id: role2.id, name: role2.name },
    added,
    removed,
    common
  };
}