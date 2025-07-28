
import { supabase } from "@/integrations/supabase/client";

export interface PackageFeature {
  feature_name: string;
  feature_value: any;
}

export interface FeatureConfig {
  enabled: boolean;
  [key: string]: any;
}

export const packageFeatureService = {
  /**
   * Get all features for a specific package
   */
  async getPackageFeatures(packageId: string): Promise<PackageFeature[]> {
    const { data, error } = await supabase.rpc('get_package_features', {
      pkg_id: packageId
    });

    if (error) {
      console.error('Error fetching package features:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Check if a package has a specific feature enabled
   */
  async packageHasFeature(packageId: string, featureName: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('package_has_feature', {
      pkg_id: packageId,
      feature_name: featureName
    });

    if (error) {
      console.error('Error checking package feature:', error);
      return false;
    }

    return data || false;
  },

  /**
   * Get specific feature configuration for a package
   */
  async getFeatureConfig(packageId: string, featureName: string): Promise<FeatureConfig | null> {
    try {
      const features = await this.getPackageFeatures(packageId);
      const feature = features.find(f => f.feature_name === featureName);
      return feature ? feature.feature_value : null;
    } catch (error) {
      console.error('Error getting feature config:', error);
      return null;
    }
  },

  /**
   * Check if package supports analytics
   */
  async hasAnalytics(packageId: string): Promise<boolean> {
    return this.packageHasFeature(packageId, 'analytics');
  },

  /**
   * Check if package supports featured listings
   */
  async hasFeaturedListing(packageId: string): Promise<boolean> {
    return this.packageHasFeature(packageId, 'featured_listing');
  },

  /**
   * Check if package supports urgent tags
   */
  async hasUrgentTag(packageId: string): Promise<boolean> {
    return this.packageHasFeature(packageId, 'urgent_tag');
  },

  /**
   * Get priority boost value for a package
   */
  async getPriorityBoost(packageId: string): Promise<number> {
    const config = await this.getFeatureConfig(packageId, 'priority_placement');
    return config?.boost || 0;
  },

  /**
   * Get urgent tag count limit for a package
   */
  async getUrgentTagLimit(packageId: string): Promise<number> {
    const config = await this.getFeatureConfig(packageId, 'urgent_tag');
    return config?.count || 0;
  }
};
