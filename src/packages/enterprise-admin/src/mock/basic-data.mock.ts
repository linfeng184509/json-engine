import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const MockRandom = Mock.Random;

interface BasicDataNode {
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

const basicDataTree: BasicDataNode[] = [
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

function findNodeById(nodes: BasicDataNode[], id: string): BasicDataNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function addChildNode(parentId: string, newNode: BasicDataNode): boolean {
  const parent = findNodeById(basicDataTree, parentId);
  if (parent) {
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);
    return true;
  }
  return false;
}

function deleteNodeById(id: string): boolean {
  for (const node of basicDataTree) {
    if (node.children) {
      const idx = node.children.findIndex(c => c.id === id);
      if (idx !== -1) {
        node.children.splice(idx, 1);
        return true;
      }
      const deleted = deleteChildNode(node.children, id);
      if (deleted) return true;
    }
  }
  return false;
}

function deleteChildNode(children: BasicDataNode[], id: string): boolean {
  for (const child of children) {
    if (child.children) {
      const idx = child.children.findIndex(c => c.id === id);
      if (idx !== -1) {
        child.children.splice(idx, 1);
        return true;
      }
      const deleted = deleteChildNode(child.children, id);
      if (deleted) return true;
    }
  }
  return false;
}

function generateId(): string {
  return MockRandom.guid();
}

export const basicDataMock: MockMethod[] = [
  {
    url: '/api/basic-data/tree',
    method: 'get',
    response: () => {
      return {
        success: true,
        data: basicDataTree
      };
    }
  },
  {
    url: '/api/basic-data/node',
    method: 'post',
    response: ({ body }: { body: Partial<BasicDataNode> }) => {
      const newNode: BasicDataNode = {
        id: generateId(),
        code: body.code || `new_code_${Date.now()}`,
        name: body.name || '新节点',
        type: body.type || 'field',
        parentId: body.parentId || null,
        permissions: body.permissions || { read: true, write: true, hidden: false, privacy: false },
        children: body.type !== 'field' ? [] : undefined
      };

      if (body.parentId) {
        const added = addChildNode(body.parentId, newNode);
        if (added) {
          return { success: true, data: newNode };
        }
        return { success: false, error: '父节点不存在' };
      } else {
        basicDataTree.push(newNode);
        return { success: true, data: newNode };
      }
    }
  },
  {
    url: '/api/basic-data/node/:id',
    method: 'put',
    response: ({ body, params }: { body: Partial<BasicDataNode>; params: { id: string } }) => {
      const node = findNodeById(basicDataTree, params.id);
      if (!node) {
        return { success: false, error: '节点不存在' };
      }

      if (body.code !== undefined) node.code = body.code;
      if (body.name !== undefined) node.name = body.name;
      if (body.permissions !== undefined) node.permissions = body.permissions;

      return { success: true, data: node };
    }
  },
  {
    url: '/api/basic-data/node/:id',
    method: 'delete',
    response: ({ params }: { params: { id: string } }) => {
      const deleted = deleteNodeById(params.id);
      if (deleted) {
        return { success: true };
      }
      return { success: false, error: '节点不存在' };
    }
  }
];