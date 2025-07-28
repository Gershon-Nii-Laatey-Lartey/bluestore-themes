
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { packageFeatureService } from "./packageFeatureService";
import { adAnalyticsService } from "./adAnalyticsService";

export const enhancedProductService = {
  /**
   * Get featured products with package-based prioritization
   */
  async getFeaturedProducts(): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .order('boost_level', { ascending: false }) // Boost levels first (2x_boost > boost > none)
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    // Track views for analytics (without user context for public view)
    const products = data || [];
    for (const product of products) {
      const packageData = product.package as any;
      if (packageData && typeof packageData === 'object' && packageData.id) {
        await adAnalyticsService.trackView(
          product.id, 
          product.user_id, 
          packageData.id
        );
      }
    }

    return products.map(this.transformProductData);
  },

  /**
   * Get products with enhanced priority sorting
   */
  async getProductsWithPriority(category?: string): Promise<ProductSubmission[]> {
    let query = supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('boost_level', { ascending: false }) // Boost levels first
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return (data || []).map(this.transformProductData);
  },

  /**
   * Get products with advanced priority scoring using database function
   */
  async getProductsWithAdvancedPriority(category?: string): Promise<ProductSubmission[]> {
    let query = supabase
      .from('product_submissions')
      .select('*, calculate_priority_score_with_boost(package_price, created_at, boost_level) as priority_score')
      .eq('status', 'approved');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('priority_score', { ascending: false });

    if (error) {
      console.error('Error fetching products with advanced priority:', error);
      throw error;
    }

    return (data || []).map(this.transformProductData);
  },

  /**
   * Check if a product has specific package features
   */
  async getProductFeatures(product: ProductSubmission): Promise<{
    hasAnalytics: boolean;
    hasFeaturedListing: boolean;
    hasUrgentTag: boolean;
    priorityBoost: number;
    urgentTagLimit: number;
  }> {
    const packageData = product.package as any;
    const packageId = (packageData && typeof packageData === 'object' && packageData.id) 
      ? packageData.id 
      : 'free';

    const [
      hasAnalytics,
      hasFeaturedListing,
      hasUrgentTag,
      priorityBoost,
      urgentTagLimit
    ] = await Promise.all([
      packageFeatureService.hasAnalytics(packageId),
      packageFeatureService.hasFeaturedListing(packageId),
      packageFeatureService.hasUrgentTag(packageId),
      packageFeatureService.getPriorityBoost(packageId),
      packageFeatureService.getUrgentTagLimit(packageId)
    ]);

    return {
      hasAnalytics,
      hasFeaturedListing,
      hasUrgentTag,
      priorityBoost,
      urgentTagLimit
    };
  },

  /**
   * Transform database product to frontend format
   */
  transformProductData(data: any): ProductSubmission {
    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      category: data.category,
      condition: data.condition,
      description: data.description,
      price: data.price.toString(),
      originalPrice: data.original_price?.toString(),
      negotiable: data.negotiable || false,
      phone: data.phone,
      location: data.location,
      images: data.images || [],
      main_image_index: data.main_image_index || 0,
      package: data.package,
      packagePrice: data.package_price || 0,
      status: data.status,
      submittedAt: data.created_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      rejection_reason: data.rejection_reason,
      suggestions: data.suggestions,
      edited: data.edited || false,
      boost_level: data.boost_level || 'none'
    };
  }
};
