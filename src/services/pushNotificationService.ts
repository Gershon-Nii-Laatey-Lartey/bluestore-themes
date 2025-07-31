import { supabase } from "@/integrations/supabase/client";
import { onlineStatusService } from "./onlineStatusService";

interface PushNotificationStatus {
  userId: string;
  isConnected: boolean;
  lastPing: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  canReceivePush: boolean;
  notificationPreferences: {
    chat: boolean;
    orders: boolean;
    marketing: boolean;
  };
}

class PushNotificationService {
  private connectionSessions = new Map<string, {
    sessionId: string;
    startTime: Date;
    lastPing: Date;
    deviceType: string;
  }>();

  // Start a new connection session (call when user connects)
  async startConnectionSession(
    userId: string, 
    deviceType: 'web' | 'mobile' | 'desktop' = 'web',
    userAgent?: string,
    ipAddress?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('start_connection_session', {
        p_user_id: userId,
        p_device_type: deviceType,
        p_user_agent: userAgent,
        p_ip_address: ipAddress
      });

      if (error) throw error;

      const sessionId = data;
      
      // Track in memory
      this.connectionSessions.set(userId, {
        sessionId,
        startTime: new Date(),
        lastPing: new Date(),
        deviceType
      });

      // Update WebSocket tracking
      onlineStatusService.trackWebSocketConnection(userId, true);

      return sessionId;
    } catch (error) {
      console.error('Error starting connection session:', error);
      throw error;
    }
  }

  // End a connection session (call when user disconnects)
  async endConnectionSession(sessionId: string): Promise<void> {
    try {
      await supabase.rpc('end_connection_session', {
        p_session_id: sessionId
      });

      // Remove from memory tracking
      for (const [userId, session] of this.connectionSessions.entries()) {
        if (session.sessionId === sessionId) {
          this.connectionSessions.delete(userId);
          onlineStatusService.trackWebSocketConnection(userId, false);
          break;
        }
      }
    } catch (error) {
      console.error('Error ending connection session:', error);
    }
  }

  // Send ping to keep connection alive
  async sendPing(userId: string): Promise<void> {
    try {
      await supabase.rpc('update_last_ping', {
        p_user_id: userId
      });

      // Update memory tracking
      const session = this.connectionSessions.get(userId);
      if (session) {
        session.lastPing = new Date();
      }

      // Update WebSocket tracking
      onlineStatusService.sendPing(userId);
    } catch (error) {
      console.error('Error sending ping:', error);
    }
  }

  // Check if user can receive push notifications
  async canReceivePushNotifications(userId: string): Promise<boolean> {
    try {
      // Check if user is actually connected
      const isConnected = onlineStatusService.isUserConnected(userId);
      
      if (!isConnected) return false;

      // Check user's notification preferences
      const { data: profile, error } = await supabase
        .from('vendor_profiles')
        .select('notification_preferences')
        .eq('user_id', userId)
        .single();

      if (error || !profile) return false;

      const preferences = profile.notification_preferences || {};
      
      // User must have at least one notification type enabled
      return Object.values(preferences).some(enabled => enabled === true);
    } catch (error) {
      console.error('Error checking push notification status:', error);
      return false;
    }
  }

  // Get users who should receive push notifications
  async getUsersForPushNotification(notificationType: 'chat' | 'orders' | 'marketing'): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('user_id, notification_preferences, connection_status, last_ping')
        .eq('connection_status', 'connected')
        .gte('last_ping', new Date(Date.now() - 30000).toISOString()) // Active in last 30 seconds
        .not('notification_preferences', 'is', null);

      if (error) throw error;

      return data
        .filter(profile => {
          const preferences = profile.notification_preferences || {};
          return preferences[notificationType] === true;
        })
        .map(profile => profile.user_id);
    } catch (error) {
      console.error('Error getting users for push notification:', error);
      return [];
    }
  }

  // Start periodic ping for connected users
  startPeriodicPing(): void {
    setInterval(() => {
      this.connectionSessions.forEach((session, userId) => {
        this.sendPing(userId);
      });
    }, 30000); // Every 30 seconds
  }

  // Get connection status for a user
  async getConnectionStatus(userId: string): Promise<PushNotificationStatus | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('connection_status, last_ping, device_info, notification_preferences')
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;

      const isConnected = onlineStatusService.isUserConnected(userId);

      return {
        userId,
        isConnected,
        lastPing: data.last_ping,
        deviceType: data.device_info?.device_type || 'web',
        canReceivePush: isConnected && this.hasNotificationPreferences(data.notification_preferences),
        notificationPreferences: data.notification_preferences || {
          chat: true,
          orders: true,
          marketing: false
        }
      };
    } catch (error) {
      console.error('Error getting connection status:', error);
      return null;
    }
  }

  private hasNotificationPreferences(preferences: any): boolean {
    if (!preferences) return false;
    return Object.values(preferences).some(enabled => enabled === true);
  }

  // Initialize connection tracking
  async initializeConnectionTracking(userId: string): Promise<void> {
    try {
      const userAgent = navigator.userAgent;
      const deviceType = this.detectDeviceType(userAgent);
      
      await this.startConnectionSession(userId, deviceType, userAgent);
      this.startPeriodicPing();
    } catch (error) {
      console.error('Error initializing connection tracking:', error);
    }
  }

  private detectDeviceType(userAgent: string): 'web' | 'mobile' | 'desktop' {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile';
    }
    return 'web';
  }
}

export const pushNotificationService = new PushNotificationService(); 