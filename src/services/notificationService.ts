
import { supabase } from "@/integrations/supabase/client";
import { Notification as NotificationType } from "@/types/notification";

class NotificationService {
  async getNotifications(userId?: string): Promise<NotificationType[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by user if userId is provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return (data || []) as NotificationType[];
  }

  async markAsRead(id: string, userId?: string): Promise<void> {
    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    // Filter by user if userId is provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId?: string): Promise<void> {
    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    // Filter by user if userId is provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(id: string, userId?: string): Promise<void> {
    let query = supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    // Filter by user if userId is provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId?: string): Promise<number> {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    // Filter by user if userId is provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  }

  // Admin notification methods
  async notifyAdminsForAdSubmission(userId: string, productTitle: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Create notifications for all admins
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: "New Ad Submission",
        message: `A new ad "${productTitle}" has been submitted and requires review.`,
        type: "info",
        read: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating admin notifications for ad submission:', error);
      }
    } catch (error) {
      console.error('Error notifying admins for ad submission:', error);
    }
  }

  async notifyAdminsForKYCSubmission(userId: string, userName: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Create notifications for all admins
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: "New KYC Submission",
        message: `${userName} has submitted KYC documents for verification.`,
        type: "warning",
        read: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating admin notifications for KYC submission:', error);
      }
    } catch (error) {
      console.error('Error notifying admins for KYC submission:', error);
    }
  }

  async notifyAdminsForSupportChat(userId: string, userName: string, message: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Create notifications for all admins
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: "New Support Chat Message",
        message: `${userName} sent a support message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        type: "info",
        read: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating admin notifications for support chat:', error);
      }
    } catch (error) {
      console.error('Error notifying admins for support chat:', error);
    }
  }

  async notifyAdminsForReport(userId: string, userName: string, reportType: string, productTitle: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Create notifications for all admins
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: "New Product Report",
        message: `${userName} reported "${productTitle}" for ${reportType}.`,
        type: "error",
        read: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating admin notifications for report:', error);
      }
    } catch (error) {
      console.error('Error notifying admins for report:', error);
    }
  }

  // Request notification permission from admin
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Send browser notification
  async sendBrowserNotification(title: string, message: string): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
