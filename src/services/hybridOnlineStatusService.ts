import { supabase } from "@/integrations/supabase/client";
import { 
  ActivityType, 
  OnlineStatusPreference, 
  VendorOnlineStatus,
  OnlineStatusUpdate 
} from "@/types/onlineStatus";

interface ConnectionSession {
  sessionId: string;
  userId: string;
  connected: boolean;
  lastPing: number;
  deviceType: 'web' | 'mobile' | 'desktop';
  startTime: Date;
}

interface PushNotificationDecision {
  shouldSendPush: boolean;
  reason: 'connected' | 'recent_activity' | 'preference_override' | 'offline';
  confidence: 'high' | 'medium' | 'low';
  lastActivity: string;
  connectionStatus: 'connected' | 'disconnected' | 'away';
}

class HybridOnlineStatusService {
  private connectionSessions = new Map<string, ConnectionSession>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private config = {
    pushNotificationThreshold: 2, // 2 minutes for push notifications
    connectionTimeout: 30, // 30 seconds for connection timeout
    heartbeatInterval: 30000, // 30 seconds
    activityThreshold: 5 // 5 minutes for general online status
  };

  // Start connection session (call when user connects)
  async startConnectionSession(
    userId: string,
    deviceType: 'web' | 'mobile' | 'desktop' = 'web',
    userAgent?: string
  ): Promise<string> {
    try {
      const sessionId = crypto.randomUUID();
      const now = Date.now();

      // Track in memory
      this.connectionSessions.set(userId, {
        sessionId,
        userId,
        connected: true,
        lastPing: now,
        deviceType,
        startTime: new Date()
      });

      // Update database
      await this.updateConnectionStatus(userId, true, deviceType, userAgent);

      // Start heartbeat if not already running
      this.startHeartbeat();

      return sessionId;
    } catch (error) {
      console.error('Error starting connection session:', error);
      throw error;
    }
  }

  // End connection session (call when user disconnects)
  async endConnectionSession(userId: string): Promise<void> {
    try {
      this.connectionSessions.delete(userId);
      await this.updateConnectionStatus(userId, false);
    } catch (error) {
      console.error('Error ending connection session:', error);
    }
  }

  // Send ping to keep connection alive
  async sendPing(userId: string): Promise<void> {
    try {
      const session = this.connectionSessions.get(userId);
      if (session) {
        session.lastPing = Date.now();
        await this.updateLastPing(userId);
      }
    } catch (error) {
      console.error('Error sending ping:', error);
    }
  }

  // Check if user should receive push notifications
  async shouldSendPushNotification(
    userId: string, 
    notificationType: 'chat' | 'orders' | 'marketing'
  ): Promise<PushNotificationDecision> {
    try {
      // 1. Check WebSocket connection (highest priority)
      const isConnected = this.isUserConnected(userId);
      if (isConnected) {
        return {
          shouldSendPush: true,
          reason: 'connected',
          confidence: 'high',
          lastActivity: 'Just now',
          connectionStatus: 'connected'
        };
      }

      // 2. Check recent activity (within 2 minutes)
      const recentActivity = await this.hasRecentActivity(userId, this.config.pushNotificationThreshold);
      if (recentActivity) {
        return {
          shouldSendPush: true,
          reason: 'recent_activity',
          confidence: 'medium',
          lastActivity: recentActivity.timeSince,
          connectionStatus: 'away'
        };
      }

      // 3. Check user preferences
      const preferenceOverride = await this.checkPreferenceOverride(userId, notificationType);
      if (preferenceOverride) {
        return {
          shouldSendPush: true,
          reason: 'preference_override',
          confidence: 'low',
          lastActivity: 'Unknown',
          connectionStatus: 'disconnected'
        };
      }

      // 4. Default: Don't send push
      return {
        shouldSendPush: false,
        reason: 'offline',
        confidence: 'high',
        lastActivity: 'Unknown',
        connectionStatus: 'disconnected'
      };
    } catch (error) {
      console.error('Error checking push notification status:', error);
      return {
        shouldSendPush: false,
        reason: 'offline',
        confidence: 'low',
        lastActivity: 'Error',
        connectionStatus: 'disconnected'
      };
    }
  }

  // Get users who should receive push notifications
  async getUsersForPushNotification(notificationType: 'chat' | 'orders' | 'marketing'): Promise<string[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('vendor_profiles')
        .select('user_id, last_seen, notification_preferences, online_status_preference')
        .not('notification_preferences', 'is', null);

      if (error) throw error;

      const eligibleUsers: string[] = [];

      for (const profile of profiles || []) {
        const decision = await this.shouldSendPushNotification(profile.user_id, notificationType);
        
        if (decision.shouldSendPush) {
          eligibleUsers.push(profile.user_id);
        }
      }

      return eligibleUsers;
    } catch (error) {
      console.error('Error getting users for push notification:', error);
      return [];
    }
  }

  // Check if user is actually connected via WebSocket
  private isUserConnected(userId: string): boolean {
    const session = this.connectionSessions.get(userId);
    if (!session) return false;

    const now = Date.now();
    const timeSinceLastPing = now - session.lastPing;
    
    return session.connected && timeSinceLastPing < (this.config.connectionTimeout * 1000);
  }

  // Check if user has recent activity
  private async hasRecentActivity(userId: string, thresholdMinutes: number): Promise<{ hasActivity: boolean; timeSince: string }> {
    try {
      const { data: profile, error } = await supabase
        .from('vendor_profiles')
        .select('last_seen')
        .eq('user_id', userId)
        .single();

      if (error || !profile) return { hasActivity: false, timeSince: 'Unknown' };

      const lastSeenDate = new Date(profile.last_seen);
      const now = new Date();
      const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

      const hasActivity = diffInMinutes <= thresholdMinutes;
      const timeSince = this.formatTimeSince(lastSeenDate);

      return { hasActivity, timeSince };
    } catch (error) {
      console.error('Error checking recent activity:', error);
      return { hasActivity: false, timeSince: 'Error' };
    }
  }

  // Check if user has preference override (always online, etc.)
  private async checkPreferenceOverride(userId: string, notificationType: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('vendor_profiles')
        .select('online_status_preference, notification_preferences')
        .eq('user_id', userId)
        .single();

      if (error || !profile) return false;

      // Check if user is always online
      if (profile.online_status_preference === 'always_online') {
        return true;
      }

      // Check if user has specific notification preference enabled
      const preferences = profile.notification_preferences || {};
      return preferences[notificationType] === true;
    } catch (error) {
      console.error('Error checking preference override:', error);
      return false;
    }
  }

  // Update connection status in database
  private async updateConnectionStatus(
    userId: string, 
    connected: boolean, 
    deviceType?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        is_online: connected,
        last_seen: new Date().toISOString(),
        connection_status: connected ? 'connected' : 'disconnected'
      };

      if (deviceType) {
        updateData.device_info = {
          device_type: deviceType,
          user_agent: userAgent
        };
      }

      await supabase
        .from('vendor_profiles')
        .update(updateData)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }

  // Update last ping in database
  private async updateLastPing(userId: string): Promise<void> {
    try {
      await supabase
        .from('vendor_profiles')
        .update({
          last_ping: new Date().toISOString(),
          connection_status: 'connected'
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last ping:', error);
    }
  }

  // Start heartbeat for all connected users
  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      this.connectionSessions.forEach((session, userId) => {
        this.sendPing(userId);
      });
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Format time since last activity
  private formatTimeSince(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  // Get comprehensive online status
  async getOnlineStatus(userId: string): Promise<VendorOnlineStatus> {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('is_online, last_seen, online_status_preference, connection_status')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return {
          is_online: false,
          last_seen: new Date().toISOString(),
          online_status_preference: 'auto'
        };
      }

      // Determine actual online status using hybrid approach
      const isConnected = this.isUserConnected(userId);
      const { hasActivity } = await this.hasRecentActivity(userId, this.config.activityThreshold);
      
      let actualOnlineStatus = false;
      
      if (data.online_status_preference === 'always_online') {
        actualOnlineStatus = true;
      } else if (data.online_status_preference === 'always_offline') {
        actualOnlineStatus = false;
      } else {
        // Auto or manual mode: use connection + activity
        actualOnlineStatus = isConnected || hasActivity;
      }

      return {
        is_online: actualOnlineStatus,
        last_seen: data.last_seen,
        online_status_preference: data.online_status_preference || 'auto'
      };
    } catch (error) {
      console.error('Error getting online status:', error);
      return {
        is_online: false,
        last_seen: new Date().toISOString(),
        online_status_preference: 'auto'
      };
    }
  }

  // Initialize the service
  async initialize(userId: string): Promise<void> {
    try {
      const userAgent = navigator.userAgent;
      const deviceType = this.detectDeviceType(userAgent);
      
      await this.startConnectionSession(userId, deviceType, userAgent);
    } catch (error) {
      console.error('Error initializing hybrid online status service:', error);
    }
  }

  // Cleanup on logout
  async cleanup(userId: string): Promise<void> {
    try {
      await this.endConnectionSession(userId);
      this.stopHeartbeat();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Detect device type from user agent
  private detectDeviceType(userAgent: string): 'web' | 'mobile' | 'desktop' {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile';
    }
    return 'web';
  }
}

export const hybridOnlineStatusService = new HybridOnlineStatusService(); 