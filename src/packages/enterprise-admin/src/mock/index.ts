import type { MockMethod } from 'vite-plugin-mock';
import { loginMock } from './auth.mock';
import { userMock } from './user.mock';

export default [
  ...loginMock,
  ...userMock,
] as MockMethod[];