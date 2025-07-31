import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { hybridOnlineStatusService } from '@/services/hybridOnlineStatusService';
import { VendorOnlineStatus } from '@/types/onlineStatus';

interface UseHybridOnlineStatusOptions {
  vendorId?: string;
  autoInitialize?: boolean;
}

interface PushNotificationDecision {
  shouldSendPush: boolean;
  reason: 'connected' | 'recent_activity' | 'preference_override' | 'offline';
  confidence: 'high' | 'medium' | 'low';
  lastActivity: string;
  connectionStatus: 'connected' | 'disconnected' | 'away';
}

export const useHybridOnlineStatus = (options: UseHybridOnlineStatusOptions = {}) => {
  const { vendorId, autoInitialize = true } = options;
  const { user } = useAuth();
  
  const [status, setStatus] = useState<VendorOnlineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pushDecision, setPushDecision] = useState<PushNotificationDecision | null>(null);

  // Initialize connection tracking
  const initialize = useCallback(async () => {
    if (!user?.id) return;

    try {
      await hybridOnlineStatusService.initialize(user.id);
      
      // Get initial status
      const initialStatus = await hybridOnlineStatusService.getOnlineStatus(user.id);
      setStatus(initialStatus);
    } catch (err) {
      console.error('Error initializing hybrid online status:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check push notification eligibility
  const checkPushNotification = useCallback(async (
    notificationType: 'chat' | 'orders' | 'marketing'
  ): Promise<PushNotificationDecision> => {
    if (!user?.id) {
      return {
        shouldSendPush: false,
        reason: 'offline',
        confidence: 'low',
        lastActivity: 'No user',
        connectionStatus: 'disconnected'
      };
    }

    try {
      const decision = await hybridOnlineStatusService.shouldSendPushNotification(user.id, notificationType);
      setPushDecision(decision);
      return decision;
    } catch (err) {
      console.error('Error checking push notification:', err);
      return {
        shouldSendPush: false,
        reason: 'offline',
        confidence: 'low',
        lastActivity: 'Error',
        connectionStatus: 'disconnected'
      };
    }
  }, [user?.id]);

  // Get users for push notification
  const getUsersForPushNotification = useCallback(async (
    notificationType: 'chat' | 'orders' | 'marketing'
  ): Promise<string[]> => {
    try {
      return await hybridOnlineStatusService.getUsersForPushNotification(notificationType);
    } catch (err) {
      console.error('Error getting users for push notification:', err);
      return [];
    }
  }, []);

  // Update status
  const updateStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const newStatus = await hybridOnlineStatusService.getOnlineStatus(user.id);
      setStatus(newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }, [user?.id]);

  // Send ping to keep connection alive
  const sendPing = useCallback(async () => {
    if (!user?.id) return;

    try {
      await hybridOnlineStatusService.sendPing(user.id);
    } catch (err) {
      console.error('Error sending ping:', err);
    }
  }, [user?.id]);

  // Initialize on mount
  useEffect(() => {
    if (autoInitialize && user?.id) {
      initialize();
    }
  }, [autoInitialize, user?.id, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user?.id) {
        hybridOnlineStatusService.cleanup(user.id);
      }
    };
  }, [user?.id]);

  // Set up periodic status updates
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      updateStatus();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, updateStatus]);

  return {
    status,
    loading,
    error,
    pushDecision,
    checkPushNotification,
    getUsersForPushNotification,
    updateStatus,
    sendPing,
    initialize
  };
};

// Hook for managing own online status
export const useOwnHybridOnlineStatus = () => {
  const { user } = useAuth();
  const [ownStatus, setOwnStatus] = useState<VendorOnlineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch own status
  const fetchOwnStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const status = await hybridOnlineStatusService.getOnlineStatus(user.id);
      setOwnStatus(status);
    } catch (err) {
      console.error('Error fetching own online status:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initialize connection tracking
  const initialize = useCallback(async () => {
    if (!user?.id) return;

    try {
      await hybridOnlineStatusService.initialize(user.id);
      await fetchOwnStatus();
    } catch (err) {
      console.error('Error initializing own online status:', err);
    }
  }, [user?.id, fetchOwnStatus]);

  // Check push notification for own user
  const checkOwnPushNotification = useCallback(async (
    notificationType: 'chat' | 'orders' | 'marketing'
  ) => {
    if (!user?.id) return null;

    try {
      return await hybridOnlineStatusService.shouldSendPushNotification(user.id, notificationType);
    } catch (err) {
      console.error('Error checking own push notification:', err);
      return null;
    }
  }, [user?.id]);

  // Fetch on mount
  useEffect(() => {
    fetchOwnStatus();
  }, [fetchOwnStatus]);

  // Initialize on mount
  useEffect(() => {
    if (user?.id) {
      initialize();
    }
  }, [user?.id, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user?.id) {
        hybridOnlineStatusService.cleanup(user.id);
      }
    };
  }, [user?.id]);

  return {
    status: ownStatus,
    loading,
    initialize,
    checkOwnPushNotification,
    refetch: fetchOwnStatus
  };
}; 