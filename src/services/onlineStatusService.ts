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

  // Track user activity
  async trackActivity(activityType: ActivityType, metadata?: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          metadata: metadata || {}
        });

      if (error) {
        console.error('Error tracking activity:', error);
        return;
      }

      // Update online status based on activity and preference
      await this.updateOnlineStatusBasedOnActivity(activityType);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Update online status based on activity and user preference
  private async updateOnlineStatusBasedOnActivity(activityType: ActivityType): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current vendor profile
      const { data: vendorProfile, error } = await supabase
        .from('vendor_profiles')
        .select('is_online, last_seen, online_status_preference')
        .eq('user_id', user.id)
        .single();

      if (error || !vendorProfile) return;

      const now = new Date().toISOString();
      const preference = vendorProfile.online_status_preference || 'auto';
      
      // Determine if user should be online based on activity and preference
      let shouldBeOnline = false;
      
      switch (preference) {
        case 'always_online':
          shouldBeOnline = true;
          break;
        case 'always_offline':
          shouldBeOnline = false;
          break;
        case 'manual':
          // Keep current status for manual mode
          shouldBeOnline = vendorProfile.is_online;
          break;
        case 'auto':
        default:
          // For auto mode, check if activity is recent (within 5 minutes)
          if (activityType === 'logout') {
            shouldBeOnline = false;
          } else {
            const lastSeenDate = new Date(vendorProfile.last_seen);
            const diffInMinutes = (new Date().getTime() - lastSeenDate.getTime()) / (1000 * 60);
            shouldBeOnline = diffInMinutes <= this.config.offlineThreshold;
          }
          break;
      }

      // Only update if status actually changed
      if (vendorProfile.is_online !== shouldBeOnline) {
        await supabase
          .from('vendor_profiles')
          .update({
            is_online: shouldBeOnline,
            last_seen: now
          })
          .eq('user_id', user.id);
      } else {
        // Just update last_seen if status didn't change
        await supabase
          .from('vendor_profiles')
          .update({
            last_seen: now
          })
          .eq('user_id', user.id);
      }
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
      
      // Update database immediately
      this.updateConnectionStatus(userId, true);
    } else {
      this.wsConnections.delete(userId);
      this.updateConnectionStatus(userId, false);
    }
  }

  // Update connection status in database
  private async updateConnectionStatus(userId: string, connected: boolean): Promise<void> {
    try {
      await supabase
        .from('vendor_profiles')
        .update({
          is_online: connected,
          last_seen: new Date().toISOString(),
          connection_status: connected ? 'connected' : 'disconnected'
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating connection status:', error);
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

  // Get vendor online status
  async getVendorOnlineStatus(vendorId: string): Promise<VendorOnlineStatus | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('is_online, last_seen, online_status_preference')
        .eq('id', vendorId)
        .single();

      if (error) {
        console.error('Error fetching vendor online status:', error);
        return null;
      }

      return {
        is_online: data.is_online || false,
        last_seen: data.last_seen,
        online_status_preference: data.online_status_preference || 'auto'
      };
    } catch (error) {
      console.error('Error fetching vendor online status:', error);
      return null;
    }
  }

  // Update vendor online status
  async updateVendorOnlineStatus(updates: OnlineStatusUpdate): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        is_online: updates.is_online,
        last_seen: updates.last_seen
      };

      if (updates.preference) {
        updateData.online_status_preference = updates.preference;
      }

      const { error } = await supabase
        .from('vendor_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating vendor online status:', error);
      }
    } catch (error) {
      console.error('Error updating vendor online status:', error);
    }
  }

  // Set online status preference
  async setOnlineStatusPreference(preference: OnlineStatusPreference): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('vendor_profiles')
        .update({ 
          online_status_preference: preference,
          is_online: preference === 'always_online' ? true : 
                     preference === 'always_offline' ? false : 
                     undefined // Keep current status for 'auto' and 'manual'
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error setting online status preference:', error);
      }
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

  // Subscribe to vendor online status changes
  subscribeToVendorStatus(vendorId: string, callback: (status: VendorOnlineStatus) => void): () => void {
    const subscription = supabase
      .channel(`vendor-status-${vendorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendor_profiles',
          filter: `id=eq.${vendorId}`
        },
        (payload) => {
          const newStatus = payload.new as VendorOnlineStatus;
          callback(newStatus);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  // Get online vendors count
  async getOnlineVendorsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('vendor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      if (error) {
        console.error('Error getting online vendors count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting online vendors count:', error);
      return 0;
    }
  }

  // Get recent activity for a user
  async getUserRecentActivity(limit: number = 10): Promise<UserActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user activity:', error);
        return [];
      }

      return data || [];
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

  // Get current online status with proper calculation
  async getCurrentOnlineStatus(userId?: string): Promise<boolean> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data?.user?.id;
      if (!targetUserId) return false;

      const { data: vendorProfile, error } = await supabase
        .from('vendor_profiles')
        .select('is_online, last_seen, online_status_preference')
        .eq('user_id', targetUserId)
        .single();

      if (error || !vendorProfile) return false;

      const preference = vendorProfile.online_status_preference || 'auto';
      
      switch (preference) {
        case 'always_online':
          return true;
        case 'always_offline':
          return false;
        case 'manual':
          return vendorProfile.is_online;
        case 'auto':
        default:
          // Check if last activity was within 5 minutes
          const lastSeenDate = new Date(vendorProfile.last_seen);
          const diffInMinutes = (new Date().getTime() - lastSeenDate.getTime()) / (1000 * 60);
          return diffInMinutes <= this.config.offlineThreshold;
      }
    } catch (error) {
      console.error('Error getting current online status:', error);
      return false;
    }
  }
}

export const onlineStatusService = new OnlineStatusService(); 