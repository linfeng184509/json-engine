import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const MockRandom = Mock.Random;

const captchaStore: Record<string, string> = {};
const tokenStore: Record<string, { userId: number; username: string; expiresAt: number }> = {};

interface LoginBody {
  username: string;
  password: string;
  captchaId?: string;
  captchaCode?: string;
}

interface MockHeaders {
  authorization?: string;
}

export const loginMock: MockMethod[] = [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: LoginBody }) => {
      const { username, password, captchaId, captchaCode } = body;
      
      if (!username || !password) {
        return { success: false, error: 'Username and password required' };
      }
      
      if (captchaId && captchaStore[captchaId] !== captchaCode) {
        return { success: false, error: 'Invalid captcha' };
      }
      
      if (username === 'admin' && password === 'admin123') {
        const token = `mock_token_${MockRandom.guid()}`;
        const expiresIn = 7200;
        tokenStore[token] = {
          userId: 1,
          username: 'admin',
          expiresAt: Date.now() + expiresIn * 1000,
        };
        return { success: true, token, expiresIn };
      }
      
      if (username === 'user' && password === 'user123') {
        const token = `mock_token_${MockRandom.guid()}`;
        const expiresIn = 7200;
        tokenStore[token] = {
          userId: 2,
          username: 'user',
          expiresAt: Date.now() + expiresIn * 1000,
        };
        return { success: true, token, expiresIn };
      }
      
      return { success: false, error: 'Invalid credentials' };
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: ({ headers }: { headers: MockHeaders }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return { success: false, error: 'No active session' };
      }
      delete tokenStore[token];
      return { success: true };
    },
  },
  {
    url: '/api/auth/captcha',
    method: 'get',
    response: () => {
      const captchaId = MockRandom.guid();
      const captchaCode = MockRandom.string('lower', 4);
      captchaStore[captchaId] = captchaCode;
      
      const colors = ['#1677ff', '#52c41a', '#faad14', '#f5222d'];
      const canvas = `<svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f2f5"/>
        <text x="50%" y="50%" font-size="24" font-family="Arial" fill="${MockRandom.pick(colors)}" text-anchor="middle" dominant-baseline="middle">${captchaCode}</text>
        <line x1="0" y1="${MockRandom.integer(10, 30)}" x2="120" y2="${MockRandom.integer(10, 30)}" stroke="${MockRandom.pick(colors)}" stroke-width="1"/>
        <line x1="${MockRandom.integer(0, 40)}" y1="0" x2="${MockRandom.integer(80, 120)}" y2="40" stroke="${MockRandom.pick(colors)}" stroke-width="1"/>
      </svg>`;
      
      const captchaImage = `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
      
      return { captchaId, captchaImage };
    },
  },
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: ({ headers }: { headers: MockHeaders }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token || !tokenStore[token]) {
        return { success: false, error: 'Token expired' };
      }
      
      const session = tokenStore[token];
      if (session.expiresAt < Date.now()) {
        delete tokenStore[token];
        return { success: false, error: 'Token expired' };
      }
      
      const newToken = `mock_token_${MockRandom.guid()}`;
      const expiresIn = 7200;
      tokenStore[newToken] = {
        ...session,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      delete tokenStore[token];
      
      return { success: true, token: newToken, expiresIn };
    },
  },
];

export function validateToken(token: string): { userId: number; username: string } | null {
  let cleanToken = token;
  if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
    cleanToken = cleanToken.slice(1, -1);
  }
  const session = tokenStore[cleanToken];
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return { userId: session.userId, username: session.username };
}