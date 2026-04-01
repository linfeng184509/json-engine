import type { MockMethod } from 'vite-plugin-mock';
import {
  basicDataTree,
  findNodeById,
  addChildNode,
  deleteNodeById,
  generateId,
  type BasicDataNode,
} from './shared-data';

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