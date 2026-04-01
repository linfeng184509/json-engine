import type { MockMethod } from 'vite-plugin-mock';
import { loginMock } from './auth.mock';
import { userMock } from './user.mock';
import { basicDataMock } from './basic-data.mock';
import { roleMock } from './role.mock';

export default [
  ...loginMock,
  ...userMock,
  ...basicDataMock,
  ...roleMock,
] as MockMethod[];