import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { onlineStatusService } from '@/services/onlineStatusService';
import { VendorOnlineStatus, OnlineStatusPreference } from '@/types/onlineStatus';

interface UseOnlineStatusOptions {
  vendorId?: string;
  autoSubscribe?: boolean;
}

export const useOnlineStatus = (options: UseOnlineStatusOptions = {}) => {
  const { vendorId, autoSubscribe = true } = options;
  const { user } = useAuth();
  
  const [status, setStatus] = useState<VendorOnlineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial status
  const fetchStatus = useCallback(async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const vendorStatus = await onlineStatusService.getVendorOnlineStatus(vendorId);
      
      if (vendorStatus) {
        // Calculate actual online status based on 5-minute threshold
        const isActuallyOnline = await onlineStatusService.getCurrentOnlineStatus(vendorId);
        setStatus({
          ...vendorStatus,
          is_online: isActuallyOnline
        });
      } else {
        setStatus(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch online status');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!vendorId || !autoSubscribe) return;

    const unsubscribe = onlineStatusService.subscribeToVendorStatus(vendorId, (newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [vendorId, autoSubscribe]);

  // Fetch initial status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Update own online status
  const updateOwnStatus = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      await onlineStatusService.updateVendorOnlineStatus({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating own online status:', err);
    }
  }, [user]);

  // Set online status preference
  const setStatusPreference = useCallback(async (preference: OnlineStatusPreference) => {
    if (!user) return;

    try {
      await onlineStatusService.setOnlineStatusPreference(preference);
      // Refetch status to get updated preference
      await fetchStatus();
    } catch (err) {
      console.error('Error setting status preference:', err);
    }
  }, [user, fetchStatus]);

  // Track activity
  const trackActivity = useCallback(async (activityType: 'page_view' | 'chat_message' | 'product_view') => {
    if (!user) return;

    try {
      await onlineStatusService.trackActivity(activityType);
    } catch (err) {
      console.error('Error tracking activity:', err);
    }
  }, [user]);

  // Initialize online status tracking for current user
  const initializeTracking = useCallback(async () => {
    if (!user) return;

    try {
      await onlineStatusService.initialize();
    } catch (err) {
      console.error('Error initializing online status tracking:', err);
    }
  }, [user]);

  // Cleanup on unmount
  const cleanup = useCallback(async () => {
    if (!user) return;

    try {
      await onlineStatusService.cleanup();
    } catch (err) {
      console.error('Error during online status cleanup:', err);
    }
  }, [user]);

  // Initialize tracking on mount
  useEffect(() => {
    initializeTracking();

    return () => {
      cleanup();
    };
  }, [initializeTracking, cleanup]);

  return {
    status,
    loading,
    error,
    updateOwnStatus,
    setStatusPreference,
    trackActivity,
    refetch: fetchStatus
  };
};

// Hook for managing own online status
export const useOwnOnlineStatus = () => {
  const { user } = useAuth();
  const [ownStatus, setOwnStatus] = useState<VendorOnlineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch own status
  const fetchOwnStatus = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get own vendor profile to get status
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('is_online, last_seen, online_status_preference')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setOwnStatus({
        is_online: data.is_online || false,
        last_seen: data.last_seen,
        online_status_preference: data.online_status_preference || 'auto'
      });
    } catch (err) {
      console.error('Error fetching own online status:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update own status
  const updateStatus = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      await onlineStatusService.updateVendorOnlineStatus({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      });
      
      // Update local state
      setOwnStatus(prev => prev ? {
        ...prev,
        is_online: isOnline,
        last_seen: new Date().toISOString()
      } : null);
    } catch (err) {
      console.error('Error updating own online status:', err);
    }
  }, [user]);

  // Set preference
  const setPreference = useCallback(async (preference: OnlineStatusPreference) => {
    if (!user) return;

    try {
      await onlineStatusService.setOnlineStatusPreference(preference);
      await fetchOwnStatus(); // Refetch to get updated status
    } catch (err) {
      console.error('Error setting status preference:', err);
    }
  }, [user, fetchOwnStatus]);

  // Fetch on mount
  useEffect(() => {
    fetchOwnStatus();
  }, [fetchOwnStatus]);

  return {
    status: ownStatus,
    loading,
    updateStatus,
    setPreference,
    refetch: fetchOwnStatus
  };
}; 