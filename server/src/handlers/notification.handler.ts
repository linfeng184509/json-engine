import { WebSocket } from 'ws';
import type { WSMessage, NotificationPayload } from '../types/message';

export function handleNotificationPush(
  payload: NotificationPayload & { targetUserId?: number },
  clientMap: Map<number, WebSocket>,
  sendMessage: (ws: WebSocket, type: string, payload?: unknown) => void
): void {
  if (payload.targetUserId) {
    const ws = clientMap.get(payload.targetUserId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, 'notification:push', payload);
    }
  }
}

export function handleBroadcast(
  payload: NotificationPayload,
  clientMap: Map<number, WebSocket>,
  sendMessage: (ws: WebSocket, type: string, payload?: unknown) => void
): void {
  for (const ws of clientMap.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, 'notification:push', payload);
    }
  }
}