export interface WSMessage {
  type: string;
  payload?: unknown;
  timestamp: number;
  seq?: number;
}

export interface NotificationPayload {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

export interface KickPayload {
  reason: 'duplicate_login' | 'token_expired' | 'admin_kick';
}