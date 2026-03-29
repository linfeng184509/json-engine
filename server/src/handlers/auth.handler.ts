import { WebSocket } from 'ws';
import type { WSMessage, AuthPayload, SessionInfo, KickPayload } from '../types/message';

export function handleAuth(
  ws: WebSocket,
  payload: AuthPayload,
  sessions: Map<number, SessionInfo>,
  clientMap: Map<number, WebSocket>,
  validateToken: (token: string) => { userId: number; username: string } | null,
  sendMessage: (ws: WebSocket, type: string, payload?: unknown) => void,
  kickUser: (userId: number, reason: KickPayload['reason']) => void
): void {
  const user = validateToken(payload.token);
  if (!user) {
    sendMessage(ws, 'auth:error', { error: 'Invalid token' });
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
}

export function handleLogout(
  ws: WebSocket,
  userId: number,
  sessions: Map<number, SessionInfo>,
  clientMap: Map<number, WebSocket>,
  cleanup: () => void
): void {
  sessions.delete(userId);
  clientMap.delete(userId);
  cleanup();
  ws.close();
}

export function handleHeartbeat(
  userId: number,
  sessions: Map<number, SessionInfo>
): void {
  const session = sessions.get(userId);
  if (session) {
    session.lastHeartbeat = Date.now();
    session.missedHeartbeats = 0;
  }
}

export function handleNotificationAck(
  _ws: WebSocket,
  payload: { id: string }
): void {
  console.log(`Notification acknowledged: ${payload.id}`);
}