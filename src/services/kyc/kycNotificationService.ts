
import { supabase } from "@/integrations/supabase/client";

export class KYCNotificationService {
  async sendKYCApprovalNotification(userId: string, kycId: string): Promise<void> {
    try {
      console.log('Sending KYC approval notification for user:', userId);
      
      // The notification will be automatically created by the database trigger
      // when the KYC status is updated to 'approved'
      console.log('KYC approval notification will be triggered by database');
    } catch (error) {
      console.error('Error in KYC notification service:', error);
      // Don't throw here to avoid blocking the main KYC approval process
    }
  }

  async sendKYCRejectionNotification(userId: string, rejectionReason: string): Promise<void> {
    try {
      console.log('Sending KYC rejection notification for user:', userId);
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'KYC Verification Rejected',
          message: `Your KYC verification has been rejected. Reason: ${rejectionReason}. Please review and resubmit your documents.`,
          type: 'error'
        });

      if (error) {
        console.error('Error creating rejection notification:', error);
        throw error;
      }

      console.log('KYC rejection notification sent successfully');
    } catch (error) {
      console.error('Error sending KYC rejection notification:', error);
      // Don't throw here to avoid blocking the main KYC rejection process
    }
  }
}

export const kycNotificationService = new KYCNotificationService();
