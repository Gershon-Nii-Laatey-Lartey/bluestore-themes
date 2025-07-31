import { supabase } from "@/integrations/supabase/client";
import { 
  ActivityType, 
  OnlineStatusPreference, 
  UserActivity, 
  VendorOnlineStatus,
  OnlineStatusUpdate,
  OnlineStatusConfig 
} from "@/types/onlineStatus";

class OnlineStatusService {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private config: OnlineStatusConfig = {
    heartbeatInterval: 30000, // 30 seconds
    offlineThreshold: 5, // 5 minutes
    autoOfflineEnabled: true
  };

  // WebSocket connection tracking for real-time status
  private wsConnections = new Map<string, { 
    connected: boolean; 
    lastPing: number; 
    userId: string;
  }>();

  // Track user activity (simplified for now)
  async trackActivity(activityType: ActivityType, metadata?: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, just log the activity since user_activity table doesn't exist yet
      console.log('Activity tracked:', { activityType, userId: user.id, metadata });
      
      // Update online status based on activity and preference
      await this.updateOnlineStatusBasedOnActivity(activityType);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Update online status based on activity and user preference (simplified)
  private async updateOnlineStatusBasedOnActivity(activityType: ActivityType): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current vendor profile
      const { data: vendorProfile, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !vendorProfile) return;

      const now = new Date().toISOString();
      
      // For now, just log the status update since the fields don't exist yet
      console.log('Online status update:', {
        userId: user.id,
        activityType,
        timestamp: now,
        vendorProfile: vendorProfile.id
      });
      
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Track WebSocket connection
  trackWebSocketConnection(userId: string, connected: boolean): void {
    const now = Date.now();
    
    if (connected) {
      this.wsConnections.set(userId, {
        connected: true,
        lastPing: now,
        userId
      });
      
      console.log('WebSocket connected for user:', userId);
    } else {
      this.wsConnections.delete(userId);
      console.log('WebSocket disconnected for user:', userId);
    }
  }

  // Check if user is actually connected (for push notifications)
  isUserConnected(userId: string): boolean {
    const connection = this.wsConnections.get(userId);
    if (!connection) return false;
    
    // Consider user offline if no ping in last 30 seconds
    const now = Date.now();
    const timeSinceLastPing = now - connection.lastPing;
    return connection.connected && timeSinceLastPing < 30000;
  }

  // Send ping to keep connection alive
  sendPing(userId: string): void {
    const connection = this.wsConnections.get(userId);
    if (connection) {
      connection.lastPing = Date.now();
    }
  }

  // Get vendor online status (simplified)
  async getVendorOnlineStatus(vendorId: string): Promise<VendorOnlineStatus | null> {
    try {
      // First try to find vendor profile by id
      let { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', vendorId)
        .single();

      // If not found by id, try by user_id (in case vendorId is actually a user_id)
      if (error && error.code === 'PGRST116') {
        const { data: userData, error: userError } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', vendorId)
          .single();

        if (userError) {
          console.error('Error fetching vendor online status by both id and user_id:', userError);
          return null;
        }

        data = userData;
      } else if (error) {
        console.error('Error fetching vendor online status:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // For now, return a default status since the fields don't exist yet
      return {
        is_online: this.isUserConnected(vendorId), // Use WebSocket connection status
        last_seen: new Date().toISOString(),
        online_status_preference: 'auto'
      };
    } catch (error) {
      console.error('Error fetching vendor online status:', error);
      return null;
    }
  }

  // Update vendor online status (simplified)
  async updateVendorOnlineStatus(updates: OnlineStatusUpdate): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Online status update requested:', updates);
      // For now, just log the update since the fields don't exist yet
    } catch (error) {
      console.error('Error updating vendor online status:', error);
    }
  }

  // Set online status preference (simplified)
  async setOnlineStatusPreference(preference: OnlineStatusPreference): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Online status preference set:', preference);
      // For now, just log the preference since the fields don't exist yet
    } catch (error) {
      console.error('Error setting online status preference:', error);
    }
  }

  // Start heartbeat for current user
  startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      await this.trackActivity('heartbeat');
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Subscribe to vendor online status changes (simplified)
  subscribeToVendorStatus(vendorId: string, callback: (status: VendorOnlineStatus) => void): () => void {
    console.log('Subscribing to vendor status:', vendorId);
    
    // For now, just return a no-op unsubscribe function
    return () => {
      console.log('Unsubscribing from vendor status:', vendorId);
    };
  }

  // Get online vendors count (simplified)
  async getOnlineVendorsCount(): Promise<number> {
    try {
      // For now, just return the count of connected WebSocket users
      return this.wsConnections.size;
    } catch (error) {
      console.error('Error getting online vendors count:', error);
      return 0;
    }
  }

  // Get recent activity for a user (simplified)
  async getUserRecentActivity(limit: number = 10): Promise<UserActivity[]> {
    try {
      // For now, return empty array since user_activity table doesn't exist
      return [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  // Calculate time since last seen
  getTimeSinceLastSeen(lastSeen: string): string {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  // Check if user should be considered online based on preference
  shouldBeOnline(preference: OnlineStatusPreference, lastSeen: string): boolean {
    switch (preference) {
      case 'always_online':
        return true;
      case 'always_offline':
        return false;
      case 'manual':
        return false; // Manual mode requires explicit user action
      case 'auto':
      default:
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
        return diffInMinutes <= this.config.offlineThreshold;
    }
  }

  // Initialize online status tracking
  async initialize(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track login activity
      await this.trackActivity('login');
      
      // Start heartbeat
      this.startHeartbeat();

      // Set up page visibility tracking
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.trackActivity('page_view');
        }
      });

      // Track page views
      this.trackActivity('page_view');
    } catch (error) {
      console.error('Error initializing online status:', error);
    }
  }

  // Cleanup on logout
  async cleanup(): Promise<void> {
    try {
      await this.trackActivity('logout');
      this.stopHeartbeat();
    } catch (error) {
      console.error('Error during online status cleanup:', error);
    }
  }

  // Get current online status with proper calculation (simplified)
  async getCurrentOnlineStatus(userId?: string): Promise<boolean> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data?.user?.id;
      if (!targetUserId) return false;

      // For now, just use WebSocket connection status
      return this.isUserConnected(targetUserId);
    } catch (error) {
      console.error('Error getting current online status:', error);
      return false;
    }
  }
}

export const onlineStatusService = new OnlineStatusService(); 