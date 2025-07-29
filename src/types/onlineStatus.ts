export type ActivityType = 'login' | 'logout' | 'page_view' | 'chat_message' | 'product_view' | 'heartbeat';

export type OnlineStatusPreference = 'auto' | 'always_online' | 'always_offline' | 'manual';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface VendorOnlineStatus {
  is_online: boolean;
  last_seen: string;
  online_status_preference: OnlineStatusPreference;
}

export interface OnlineStatusUpdate {
  is_online: boolean;
  last_seen: string;
  preference?: OnlineStatusPreference;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface OnlineStatusConfig {
  heartbeatInterval: number; // in milliseconds
  offlineThreshold: number; // in minutes
  autoOfflineEnabled: boolean;
} 