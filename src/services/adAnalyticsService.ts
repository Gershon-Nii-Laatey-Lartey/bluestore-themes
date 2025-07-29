
import { supabase } from "@/integrations/supabase/client";
import { packageFeatureService } from "./packageFeatureService";

export interface AdAnalytics {
  id: string;
  product_id: string;
  user_id: string;
  package_id?: string;
  date: string;
  views: number;
  clicks: number;
  messages: number;
  interactions: any;
  priority_score: number;
  featured: boolean;
  urgent: boolean;
  created_at: string;
  updated_at: string;
}

export const adAnalyticsService = {
  /**
   * Check if ad_analytics table exists
   */
  async tableExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ad_analytics')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Error checking if ad_analytics table exists:', error);
      return false;
    }
  },

  /**
   * Track a view for an ad
   */
  async trackView(productId: string, userId: string, packageId?: string): Promise<void> {
    try {
      // Check if table exists first
      const tableExists = await this.tableExists();
      if (!tableExists) {
        console.log('ad_analytics table does not exist, skipping analytics tracking');
        return;
      }

      // Get priority score based on package
      let priorityScore = 0;
      let featured = false;
      let urgent = false;

      if (packageId) {
        priorityScore = await packageFeatureService.getPriorityBoost(packageId);
        featured = await packageFeatureService.hasFeaturedListing(packageId);
        urgent = await packageFeatureService.hasUrgentTag(packageId);
      }

      const today = new Date().toISOString().split('T')[0];

      // Check if record exists for today
      const { data: existing, error: fetchError } = await supabase
        .from('ad_analytics')
        .select('id, views')
        .eq('product_id', productId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing analytics:', fetchError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('ad_analytics')
          .update({
            views: (existing.views || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating view count:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('ad_analytics')
          .insert({
            product_id: productId,
            user_id: userId,
            package_id: packageId,
            date: today,
            views: 1,
            clicks: 0,
            messages: 0,
            priority_score: priorityScore,
            featured,
            urgent
          });

        if (error) {
          console.error('Error creating analytics record:', error);
        }
      }
    } catch (error) {
      console.error('Error in trackView:', error);
    }
  },

  /**
   * Track a click for an ad
   */
  async trackClick(productId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if record exists for today
      const { data: existing, error: fetchError } = await supabase
        .from('ad_analytics')
        .select('id, clicks')
        .eq('product_id', productId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing analytics:', fetchError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('ad_analytics')
          .update({
            clicks: (existing.clicks || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating click count:', error);
        }
      }
    } catch (error) {
      console.error('Error in trackClick:', error);
    }
  },

  /**
   * Track a message for an ad
   */
  async trackMessage(productId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if record exists for today
      const { data: existing, error: fetchError } = await supabase
        .from('ad_analytics')
        .select('id, messages')
        .eq('product_id', productId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing analytics:', fetchError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('ad_analytics')
          .update({
            messages: (existing.messages || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating message count:', error);
        }
      }
    } catch (error) {
      console.error('Error in trackMessage:', error);
    }
  },

  /**
   * Get analytics for a specific product
   */
  async getProductAnalytics(productId: string, userId: string): Promise<AdAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        // Return empty array instead of throwing error to prevent app crashes
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductAnalytics:', error);
      return [];
    }
  },

  /**
   * Get analytics summary for a user's ads
   */
  async getUserAnalyticsSummary(userId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    totalMessages: number;
    topPerformingAds: AdAnalytics[];
  }> {
    try {
      const { data, error } = await supabase
        .from('ad_analytics')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user analytics:', error);
        // Return default values instead of throwing error
        return {
          totalViews: 0,
          totalClicks: 0,
          totalMessages: 0,
          topPerformingAds: []
        };
      }

      const analytics = data || [];
      const totalViews = analytics.reduce((sum, record) => sum + (record.views || 0), 0);
      const totalClicks = analytics.reduce((sum, record) => sum + (record.clicks || 0), 0);
      const totalMessages = analytics.reduce((sum, record) => sum + (record.messages || 0), 0);

      // Get top performing ads (by views + clicks + messages)
      const topPerformingAds = analytics
        .map(record => ({
          ...record,
          performance: (record.views || 0) + (record.clicks || 0) * 2 + (record.messages || 0) * 3
        }))
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 5);

      return {
        totalViews,
        totalClicks,
        totalMessages,
        topPerformingAds
      };
    } catch (error) {
      console.error('Error in getUserAnalyticsSummary:', error);
      return {
        totalViews: 0,
        totalClicks: 0,
        totalMessages: 0,
        topPerformingAds: []
      };
    }
  }
};
