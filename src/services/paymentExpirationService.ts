
import { supabase } from "@/integrations/supabase/client";

class PaymentExpirationService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly EXPIRATION_TIME_MS = 2 * 60 * 1000; // 2 minutes

  async expirePendingPayments() {
    try {
      const expirationTime = new Date(Date.now() - this.EXPIRATION_TIME_MS).toISOString();
      
      const { data: expiredPayments, error: selectError } = await supabase
        .from('payments')
        .select('id, provider_reference, created_at')
        .eq('status', 'pending')
        .lt('created_at', expirationTime);

      if (selectError) {
        console.error('Error fetching pending payments:', selectError);
        return false;
      }

      if (!expiredPayments || expiredPayments.length === 0) {
        return true;
      }

      console.log(`Found ${expiredPayments.length} expired payments to update`);

      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'pending')
        .lt('created_at', expirationTime);

      if (updateError) {
        console.error('Error expiring pending payments:', updateError);
        return false;
      }

      console.log(`Successfully expired ${expiredPayments.length} payments`);
      return true;
    } catch (error) {
      console.error('Payment expiration service error:', error);
      return false;
    }
  }

  async checkAndExpirePayment(paymentId: string) {
    try {
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('status', 'pending')
        .single();

      if (fetchError || !payment) {
        return false;
      }

      const createdAt = new Date(payment.created_at);
      const now = new Date();
      const diffInMs = now.getTime() - createdAt.getTime();

      if (diffInMs > this.EXPIRATION_TIME_MS) {
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);

        if (updateError) {
          console.error('Error updating expired payment:', updateError);
          return false;
        }

        console.log(`Payment ${paymentId} expired and marked as failed`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking payment expiration:', error);
      return false;
    }
  }

  startAutoExpiration() {
    if (this.intervalId) {
      return; // Already running
    }

    console.log('Starting automatic payment expiration service');
    
    // Run immediately
    this.expirePendingPayments();
    
    // Then run every 30 seconds
    this.intervalId = setInterval(() => {
      this.expirePendingPayments();
    }, 30000);
  }

  stopAutoExpiration() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped automatic payment expiration service');
    }
  }

  async schedulePaymentExpiration(paymentId: string) {
    setTimeout(async () => {
      await this.checkAndExpirePayment(paymentId);
    }, this.EXPIRATION_TIME_MS);
  }
}

export const paymentExpirationService = new PaymentExpirationService();
