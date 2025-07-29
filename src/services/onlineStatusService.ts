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
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
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
}

export const onlineStatusService = new OnlineStatusService(); 