
import { useState, useEffect, useRef } from "react";
import { notificationService } from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationBadgeProps {
  children: React.ReactNode;
}

export const NotificationBadge = ({ children }: NotificationBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const channelRef = useRef<string>(`notifications-badge-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!user) return;

    // Load initial unread count
    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Set up real-time subscription for new notifications with unique channel name
    const channel = supabase
      .channel(channelRef.current)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Reload count when new notification is inserted
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Reload count when notification is updated (marked as read)
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="relative">
      {children}
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-4">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};
