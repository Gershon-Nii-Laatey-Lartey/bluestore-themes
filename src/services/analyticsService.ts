
import { supabase } from "@/integrations/supabase/client";

export interface AdAnalytics {
  id: string;
  product_id: string;
  user_id: string;
  date: string;
  views: number;
  clicks: number;
  messages: number;
  interactions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  averageTransactionValue: number;
  revenueByPlan: Record<string, number>;
  transactionsByStatus: Record<string, number>;
  monthlyRevenue: Array<{ month: string; revenue: number; transactions: number }>;
}

class AnalyticsService {
  async trackAdView(productId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Check if analytics record exists for today
      const { data: existing } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('ad_analytics')
          .update({ 
            views: existing.views + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('ad_analytics')
          .insert({
            product_id: productId,
            user_id: user.id,
            date: today,
            views: 1,
            clicks: 0,
            messages: 0,
            interactions: {}
          });
      }
    } catch (error) {
      console.error('Error tracking ad view:', error);
    }
  }

  async trackAdClick(productId: string, clickType: string = 'general') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing) {
        // Cast interactions to Record<string, any> and handle properly
        const currentInteractions = (existing.interactions as Record<string, any>) || {};
        const updatedInteractions = {
          ...currentInteractions,
          [clickType]: (currentInteractions[clickType] || 0) + 1
        };

        await supabase
          .from('ad_analytics')
          .update({ 
            clicks: existing.clicks + 1,
            interactions: updatedInteractions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('ad_analytics')
          .insert({
            product_id: productId,
            user_id: user.id,
            date: today,
            views: 0,
            clicks: 1,
            messages: 0,
            interactions: { [clickType]: 1 }
          });
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  }

  async trackAdMessage(productId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('ad_analytics')
          .update({ 
            messages: existing.messages + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('ad_analytics')
          .insert({
            product_id: productId,
            user_id: user.id,
            date: today,
            views: 0,
            clicks: 0,
            messages: 1,
            interactions: {}
          });
      }
    } catch (error) {
      console.error('Error tracking ad message:', error);
    }
  }

  async getAdAnalytics(productId: string): Promise<AdAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('product_id', productId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        interactions: (item.interactions as Record<string, any>) || {}
      }));
    } catch (error) {
      console.error('Error fetching ad analytics:', error);
      return [];
    }
  }

  async getUserAdAnalytics(userId: string): Promise<AdAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        interactions: (item.interactions as Record<string, any>) || {}
      }));
    } catch (error) {
      console.error('Error fetching user ad analytics:', error);
      return [];
    }
  }

  async getPaymentAnalytics(): Promise<PaymentAnalytics> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const analytics: PaymentAnalytics = {
        totalRevenue: 0,
        totalTransactions: payments?.length || 0,
        successfulPayments: 0,
        failedPayments: 0,
        averageTransactionValue: 0,
        revenueByPlan: {},
        transactionsByStatus: {},
        monthlyRevenue: []
      };

      if (!payments) return analytics;

      // Calculate basic metrics
      payments.forEach(payment => {
        if (payment.status === 'succeeded') {
          analytics.totalRevenue += payment.amount;
          analytics.successfulPayments++;
          
          // Track revenue by plan - cast metadata to Record<string, any>
          const metadata = (payment.metadata as Record<string, any>) || {};
          const planId = metadata.plan_id || 'unknown';
          analytics.revenueByPlan[planId] = (analytics.revenueByPlan[planId] || 0) + payment.amount;
        } else if (payment.status === 'failed') {
          analytics.failedPayments++;
        }

        // Track transactions by status
        analytics.transactionsByStatus[payment.status] = 
          (analytics.transactionsByStatus[payment.status] || 0) + 1;
      });

      // Calculate average transaction value
      if (analytics.successfulPayments > 0) {
        analytics.averageTransactionValue = analytics.totalRevenue / analytics.successfulPayments;
      }

      // Calculate monthly revenue
      const monthlyData: Record<string, { revenue: number; transactions: number }> = {};
      payments.forEach(payment => {
        if (payment.status === 'succeeded') {
          const monthKey = new Date(payment.created_at).toISOString().slice(0, 7); // YYYY-MM
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, transactions: 0 };
          }
          monthlyData[monthKey].revenue += payment.amount;
          monthlyData[monthKey].transactions++;
        }
      });

      analytics.monthlyRevenue = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return analytics;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulPayments: 0,
        failedPayments: 0,
        averageTransactionValue: 0,
        revenueByPlan: {},
        transactionsByStatus: {},
        monthlyRevenue: []
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
