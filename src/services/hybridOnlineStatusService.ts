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
  viewportVisible: boolean;
  lastViewportChange: number;
}

interface PushNotificationDecision {
  shouldSendPush: boolean;
  reason: 'connected' | 'recent_activity' | 'preference_override' | 'offline';
  confidence: 'high' | 'medium' | 'low';
  lastActivity: string;
  connectionStatus: 'connected' | 'disconnected' | 'away';
  viewportStatus: 'visible' | 'hidden' | 'unknown';
}

class HybridOnlineStatusService {
  private connectionSessions = new Map<string, ConnectionSession>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private viewportTrackingInterval: NodeJS.Timeout | null = null;
  private config = {
    pushNotificationThreshold: 2, // 2 minutes for push notifications
    connectionTimeout: 30, // 30 seconds for connection timeout
    heartbeatInterval: 30000, // 30 seconds
    activityThreshold: 5, // 5 minutes for general online status
    viewportHiddenThreshold: 10, // 10 seconds after viewport hidden
    viewportCheckInterval: 5000 // Check viewport every 5 seconds
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
        startTime: new Date(),
        viewportVisible: true,
        lastViewportChange: now
      });

      // Update database
      await this.updateConnectionStatus(userId, true, deviceType, userAgent);

      // Start heartbeat if not already running
      this.startHeartbeat();
      
      // Start viewport tracking
      this.startViewportTracking(userId);

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
      this.stopViewportTracking(userId);
    } catch (error) {
      console.error('Error ending connection session:', error);
    }
  }

  // Track viewport visibility changes
  private startViewportTracking(userId: string): void {
    const session = this.connectionSessions.get(userId);
    if (!session) return;

    // Set up visibility change listener
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      const now = Date.now();
      
      session.viewportVisible = isVisible;
      session.lastViewportChange = now;

      console.log(`Viewport ${isVisible ? 'visible' : 'hidden'} for user ${userId}`);

      // Update database with viewport status
      this.updateViewportStatus(userId, isVisible);
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Store the handler for cleanup
    session['visibilityHandler'] = handleVisibilityChange;

    // Start periodic viewport checking
    this.startViewportCheckInterval(userId);
  }

  // Stop viewport tracking
  private stopViewportTracking(userId: string): void {
    const session = this.connectionSessions.get(userId);
    if (!session || !session['visibilityHandler']) return;

    // Remove event listener
    document.removeEventListener('visibilitychange', session['visibilityHandler']);
    delete session['visibilityHandler'];

    // Clear interval
    if (session['viewportInterval']) {
      clearInterval(session['viewportInterval']);
      delete session['viewportInterval'];
    }
  }

  // Start periodic viewport checking
  private startViewportCheckInterval(userId: string): void {
    const session = this.connectionSessions.get(userId);
    if (!session) return;

    const interval = setInterval(() => {
      const isVisible = !document.hidden;
      const now = Date.now();

      // Update if viewport status changed
      if (session.viewportVisible !== isVisible) {
        session.viewportVisible = isVisible;
        session.lastViewportChange = now;
        this.updateViewportStatus(userId, isVisible);
      }
    }, this.config.viewportCheckInterval);

    session['viewportInterval'] = interval;
  }

  // Update viewport status in database
  private async updateViewportStatus(userId: string, isVisible: boolean): Promise<void> {
    try {
      // For now, just log the viewport status since the fields don't exist yet
      console.log('Viewport status update:', {
        userId,
        isVisible,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating viewport status:', error);
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
      const session = this.connectionSessions.get(userId);
      const viewportStatus = this.getViewportStatus(userId);

      // 1. Check WebSocket connection (highest priority)
      const isConnected = this.isUserConnected(userId);
      if (isConnected && viewportStatus === 'visible') {
        return {
          shouldSendPush: false, // Don't send if viewport is visible
          reason: 'connected',
          confidence: 'high',
          lastActivity: 'Just now',
          connectionStatus: 'connected',
          viewportStatus: 'visible'
        };
      }

      // 2. Check if viewport is hidden (good for push notifications)
      if (isConnected && viewportStatus === 'hidden') {
        return {
          shouldSendPush: true,
          reason: 'connected',
          confidence: 'high',
          lastActivity: 'Just now',
          connectionStatus: 'connected',
          viewportStatus: 'hidden'
        };
      }

      // 3. Check recent activity (within 2 minutes)
      const recentActivity = await this.hasRecentActivity(userId, this.config.pushNotificationThreshold);
      if (recentActivity.hasActivity && viewportStatus === 'hidden') {
        return {
          shouldSendPush: true,
          reason: 'recent_activity',
          confidence: 'medium',
          lastActivity: recentActivity.timeSince,
          connectionStatus: 'away',
          viewportStatus: 'hidden'
        };
      }

      // 4. Check user preferences
      const preferenceOverride = await this.checkPreferenceOverride(userId, notificationType);
      if (preferenceOverride && viewportStatus === 'hidden') {
        return {
          shouldSendPush: true,
          reason: 'preference_override',
          confidence: 'low',
          lastActivity: 'Unknown',
          connectionStatus: 'disconnected',
          viewportStatus: 'hidden'
        };
      }

      // 5. Default: Don't send push (viewport visible or user offline)
      return {
        shouldSendPush: false,
        reason: 'offline',
        confidence: 'high',
        lastActivity: 'Unknown',
        connectionStatus: 'disconnected',
        viewportStatus: viewportStatus
      };
    } catch (error) {
      console.error('Error checking push notification status:', error);
      return {
        shouldSendPush: false,
        reason: 'offline',
        confidence: 'low',
        lastActivity: 'Error',
        connectionStatus: 'disconnected',
        viewportStatus: 'unknown'
      };
    }
  }

  // Get viewport status for a user
  private getViewportStatus(userId: string): 'visible' | 'hidden' | 'unknown' {
    const session = this.connectionSessions.get(userId);
    if (!session) return 'unknown';

    const now = Date.now();
    const timeSinceViewportChange = now - session.lastViewportChange;

    // If viewport was hidden recently, consider it still hidden
    if (!session.viewportVisible && timeSinceViewportChange < (this.config.viewportHiddenThreshold * 1000)) {
      return 'hidden';
    }

    return session.viewportVisible ? 'visible' : 'hidden';
  }

  // Get users who should receive push notifications
  async getUsersForPushNotification(notificationType: 'chat' | 'orders' | 'marketing'): Promise<string[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('vendor_profiles')
        .select('user_id')
        .not('user_id', 'is', null);

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
        .select('created_at')
        .eq('user_id', userId)
        .single();

      if (error || !profile) return { hasActivity: false, timeSince: 'Unknown' };

      // For now, use created_at as a proxy for last activity since last_seen doesn't exist yet
      const lastSeenDate = new Date(profile.created_at);
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
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) return false;

      // For now, return false since the preference fields don't exist yet
      // In the future, this will check online_status_preference and notification_preferences
      return false;
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
      // For now, just log the connection status since the fields don't exist yet
      console.log('Connection status update:', {
        userId,
        connected,
        deviceType,
        userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }

  // Update last ping in database
  private async updateLastPing(userId: string): Promise<void> {
    try {
      // For now, just log the ping since the fields don't exist yet
      console.log('Ping update:', {
        userId,
        timestamp: new Date().toISOString()
      });
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
      // First try to find vendor profile by user_id
      let { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If not found by user_id, try by id (in case userId is actually a vendor profile id)
      if (error && error.code === 'PGRST116') {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (vendorError) {
          console.error('Error fetching vendor profile by both user_id and id:', vendorError);
          return {
            is_online: false,
            last_seen: new Date().toISOString(),
            online_status_preference: 'auto'
          };
        }

        data = vendorData;
      } else if (error) {
        console.error('Error fetching vendor profile:', error);
        return {
          is_online: false,
          last_seen: new Date().toISOString(),
          online_status_preference: 'auto'
        };
      }

      if (!data) {
        return {
          is_online: false,
          last_seen: new Date().toISOString(),
          online_status_preference: 'auto'
        };
      }

      // Determine actual online status using hybrid approach
      const isConnected = this.isUserConnected(userId);
      const { hasActivity } = await this.hasRecentActivity(userId, this.config.activityThreshold);
      const viewportStatus = this.getViewportStatus(userId);
      
      let actualOnlineStatus = false;
      
      // For now, use a simple logic since the preference fields don't exist yet
      actualOnlineStatus = isConnected || hasActivity;

      return {
        is_online: actualOnlineStatus,
        last_seen: new Date().toISOString(),
        online_status_preference: 'auto'
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