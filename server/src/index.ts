import { WebSocket, WebSocketServer } from 'ws';
import type { WSMessage, AuthPayload, SessionInfo, KickPayload, NotificationPayload } from './types/message';
import { handleAuth, handleLogout, handleHeartbeat, handleNotificationAck } from './handlers/auth.handler';
import { handleNotificationPush, handleBroadcast } from './handlers/notification.handler';

const PORT = 8080;
const HEARTBEAT_INTERVAL = 30000;
const MAX_MISSED_HEARTBEATS = 3;

const wss = new WebSocketServer({ port: PORT });
const sessions = new Map<number, SessionInfo>();
const clientMap = new Map<number, WebSocket>();

const mockTokenStore: Record<string, { userId: number; username: string }> = {
  'mock_token_admin': { userId: 1, username: 'admin' },
  'mock_token_user': { userId: 2, username: 'user' },
};

function validateToken(token: string): { userId: number; username: string } | null {
  return mockTokenStore[token] || null;
}

function sendMessage(ws: WebSocket, type: string, payload?: unknown, seq?: number): void {
  const message: WSMessage = {
    type,
    payload,
    timestamp: Date.now(),
    seq,
  };
  ws.send(JSON.stringify(message));
}

function kickUser(userId: number, reason: KickPayload['reason']): void {
  const ws = clientMap.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    sendMessage(ws, 'auth:kick', { reason });
    ws.close();
    clientMap.delete(userId);
    sessions.delete(userId);
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  const token = url.searchParams.get('token') || '';

  const user = validateToken(token);
  if (!user) {
    sendMessage(ws, 'auth:error', { error: 'Invalid token' });
    ws.close();
    return;
  }

  if (clientMap.has(user.userId)) {
    kickUser(user.userId, 'duplicate_login');
  }

  const session: SessionInfo = {
    userId: user.userId,
    username: user.username,
    connectedAt: Date.now(),
    lastHeartbeat: Date.now(),
    missedHeartbeats: 0,
  };

  sessions.set(user.userId, session);
  clientMap.set(user.userId, ws);

  sendMessage(ws, 'auth:login:success', { userId: user.userId, username: user.username });

  const heartbeatTimer = setInterval(() => {
    const currentSession = sessions.get(user.userId);
    if (!currentSession) {
      clearInterval(heartbeatTimer);
      return;
    }

    currentSession.missedHeartbeats++;
    if (currentSession.missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
      kickUser(user.userId, 'token_expired');
      clearInterval(heartbeatTimer);
      return;
    }

    sendMessage(ws, 'heartbeat', { timestamp: Date.now() });
  }, HEARTBEAT_INTERVAL);

  ws.on('message', (data) => {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      const currentSession = sessions.get(user.userId);

      if (!currentSession) return;

      switch (message.type) {
        case 'auth:login':
          handleAuth(ws, message.payload as AuthPayload, sessions, clientMap, validateToken, sendMessage, kickUser);
          break;
        case 'auth:logout':
          handleLogout(ws, user.userId, sessions, clientMap, clearInterval(heartbeatTimer));
          break;
        case 'heartbeat:ack':
          handleHeartbeat(user.userId, sessions);
          break;
        case 'notification:ack':
          handleNotificationAck(ws, message.payload as { id: string });
          break;
        case 'notification:push':
          handleNotificationPush(message.payload as NotificationPayload, clientMap, sendMessage);
          break;
        case 'notification:broadcast':
          handleBroadcast(message.payload as NotificationPayload, clientMap, sendMessage);
          break;
        default:
          sendMessage(ws, 'error', { error: `Unknown message type: ${message.type}` });
      }
    } catch (error) {
      sendMessage(ws, 'error', { error: 'Invalid message format' });
    }
  });

  ws.on('close', () => {
    sessions.delete(user.userId);
    clientMap.delete(user.userId);
    clearInterval(heartbeatTimer);
  });
});

console.log(`WebSocket server started on port ${PORT}`);