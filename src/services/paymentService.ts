import { supabase } from "@/integrations/supabase/client";
import { paymentExpirationService } from "./paymentExpirationService";

export interface PaystackInitializeData {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  plan?: string;
  channels?: string[];
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
    public_key?: string;
  };
}

export interface SubscriptionData {
  plan_id: string;
  user_id: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

class PaymentService {
  private async callPaystackFunction(functionName: string, data: any) {
    try {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data
      });

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw new Error(error.message || `Failed to call ${functionName}`);
      }

      return result;
    } catch (error) {
      console.error(`Payment service error in ${functionName}:`, error);
      throw error;
    }
  }

  async initializePayment(data: PaystackInitializeData): Promise<PaystackResponse> {
    const result = await this.callPaystackFunction('paystack-initialize', data);
    
    // Schedule automatic expiration for this payment
    if (result?.data?.reference) {
      console.log(`Scheduling expiration for payment: ${result.data.reference}`);
      // Find the payment record to schedule expiration
      const { data: payment } = await supabase
        .from('payments')
        .select('id')
        .eq('provider_reference', result.data.reference)
        .single();
      
      if (payment) {
        paymentExpirationService.schedulePaymentExpiration(payment.id);
      }
    }
    
    return result;
  }

  async verifyPayment(reference: string) {
    return this.callPaystackFunction('paystack-verify', { reference });
  }

  async createSubscription(data: SubscriptionData) {
    return this.callPaystackFunction('paystack-subscription', data);
  }

  async cancelSubscription(subscriptionId: string) {
    return this.callPaystackFunction('paystack-cancel-subscription', { 
      subscription_id: subscriptionId 
    });
  }

  async getUserActivePackage(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_plan_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user active package:', error);
      return null;
    }
  }

  async createSubscriptionFromPayment(paymentData: any, planId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get plan configuration
      const planConfig = this.getPlanConfiguration(planId);
      
      // Ensure planId is one of the valid plan types
      const validPlanTypes = ['free', 'starter', 'standard', 'rising', 'pro', 'business', 'premium'] as const;
      const planType = validPlanTypes.includes(planId as any) ? planId as typeof validPlanTypes[number] : 'free';
      
      // ALWAYS create a brand new subscription record for EVERY payment
      // This ensures each purchase is completely independent
      // When purchasing with an ad, start with 1 ad used instead of 0
      const subscriptionData = {
        user_id: user.id,
        plan_type: planType,
        plan_name: planConfig.name,
        plan_price: planConfig.price,
        duration_days: planConfig.duration,
        ads_allowed: planConfig.adsAllowed,
        ads_used: paymentData.metadata?.purchasedWithAd ? 1 : 0, // Start with 1 if purchased during ad submission
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000).toISOString(),
        features: planConfig.features || {},
        status: 'active'
      };

      console.log(`Creating brand new subscription for plan ${planId} - each purchase is independent`);

      // Insert brand new subscription - NEVER update existing ones
      const { data: subscription, error } = await supabase
        .from('user_plan_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;

      console.log(`Created completely new subscription for plan ${planId} starting with 0 ads used`);
      return subscription;
    } catch (error) {
      console.error('Error creating subscription from payment:', error);
      throw error;
    }
  }

  private getPlanConfiguration(planId: string) {
    const plans: Record<string, any> = {
      'starter': { name: 'Starter Plan', price: 15, duration: 7, adsAllowed: 1 },
      'standard': { name: 'Standard Plan', price: 30, duration: 30, adsAllowed: 1 },
      'rising': { name: 'Rising Seller Plan', price: 50, duration: 14, adsAllowed: 25 },
      'pro': { name: 'Pro Seller Plan', price: 120, duration: 30, adsAllowed: 50 },
      'business': { name: 'Business Plan', price: 250, duration: 90, adsAllowed: 100 },
      'premium': { name: 'Premium Brand Plan', price: 500, duration: 150, adsAllowed: null },
    };
    
    return plans[planId] || { name: 'Unknown Plan', price: 0, duration: 30, adsAllowed: 1 };
  }

  async getPaymentHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          subscriptions (
            plan_id,
            status,
            current_period_start,
            current_period_end
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the types to match our interfaces
      return data?.map(payment => ({
        ...payment,
        status: payment.status as 'pending' | 'succeeded' | 'failed' | 'cancelled',
        metadata: (payment.metadata || {}) as Record<string, any>,
        subscriptions: payment.subscriptions ? {
          ...payment.subscriptions,
          status: payment.subscriptions.status as string
        } : undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  async getActiveSubscriptions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString());

      if (error) throw error;
      
      // Cast the status to the correct type
      return data?.map(sub => ({
        ...sub,
        status: sub.status as 'active' | 'expired' | 'cancelled'
      })) || [];
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
