
import { supabase } from "@/integrations/supabase/client";

export interface StorefrontData {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  logo_image?: string;
  banner_image?: string;
  storefront_url: string;
  contact_info?: any;
  settings?: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

class StorefrontService {
  async generateStorefrontUrl(businessName: string): Promise<string> {
    // Generate a short, professional URL from business name
    const baseUrl = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 12); // Shorter URLs
    
    // Check if URL already exists
    let counter = 0;
    let finalUrl = baseUrl;
    
    while (true) {
      const { data } = await supabase
        .from('vendor_profiles')
        .select('storefront_url')
        .eq('storefront_url', finalUrl)
        .single();
      
      if (!data) break;
      
      counter++;
      finalUrl = `${baseUrl}${counter}`;
    }
    
    return finalUrl;
  }

  async enableStorefront(userId: string, businessName: string): Promise<string> {
    const storefrontUrl = await this.generateStorefrontUrl(businessName);
    
    const { error } = await supabase
      .from('vendor_profiles')
      .update({
        storefront_url: storefrontUrl,
        storefront_enabled: true
      })
      .eq('user_id', userId);

    if (error) throw error;
    
    return storefrontUrl;
  }

  async getStorefrontByUrl(storefrontUrl: string): Promise<any> {
    console.log('Fetching storefront for URL:', storefrontUrl);
    
    // First get the vendor profile
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('storefront_url', storefrontUrl)
      .eq('storefront_enabled', true)
      .single();

    if (vendorError) {
      console.error('Error fetching storefront:', vendorError);
      throw vendorError;
    }

    if (!vendorData) {
      throw new Error('Storefront not found');
    }

    // Then get the associated user profile separately
    let userProfile = null;
    if (vendorData.user_id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', vendorData.user_id)
        .single();

      if (!profileError) {
        userProfile = profileData;
      }
    }

    console.log('Storefront data:', vendorData);
    console.log('User profile data:', userProfile);

    return {
      ...vendorData,
      profiles: userProfile
    };
  }

  async getStorefrontProducts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async hasStorefrontAccess(packageId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('package_has_feature', {
      pkg_id: packageId,
      feature_name: 'storefront'
    });

    if (error) return false;
    return data || false;
  }

  async saveStorefrontCustomization(userId: string, customization: any): Promise<void> {
    const { error } = await supabase
      .from('vendor_profiles')
      .update({
        business_name: customization.businessName,
        description: customization.description,
        // Store customization settings in a JSON field
        settings: {
          colorTheme: customization.colorTheme,
          customColors: customization.customColors,
          layoutStyle: customization.layoutStyle,
          productsPerRow: customization.productsPerRow,
          showContactInfo: customization.showContactInfo,
          showCategories: customization.showCategories,
          enableSearch: customization.enableSearch,
          enableFilters: customization.enableFilters,
          socialLinks: customization.socialLinks
        }
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getStorefrontCustomization(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('settings, business_name, description')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const storefrontService = new StorefrontService();
