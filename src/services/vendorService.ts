
import { supabase } from "@/integrations/supabase/client";
import { VendorProfile } from "@/types/vendor";

class VendorService {
  async getVendorProfile(): Promise<VendorProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }

    if (!data) return null;

    // Cast to any to bypass type checking
    const profileData = data as any;

    return {
      id: profileData.id,
      businessName: profileData.business_name,
      description: profileData.description || '',
      location: profileData.location || '',
      phone: profileData.phone || '',
      email: profileData.email || '',
      categories: profileData.categories || [],
      shippingPolicy: profileData.shipping_policy || '',
      returnPolicy: profileData.return_policy || '',
      warrantyInfo: profileData.warranty_info || '',
      createdAt: profileData.created_at,
      verified: profileData.verified || false,
      totalProducts: 0, // This would need to be calculated
      user_id: profileData.user_id,
      storefrontUrl: profileData.storefront_url,
      storefrontEnabled: profileData.storefront_enabled || false
    };
  }

  async createVendorProfile(profile: Omit<VendorProfile, 'id'>): Promise<VendorProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .insert({
        business_name: profile.businessName,
        description: profile.description,
        location: profile.location,
        phone: profile.phone,
        email: profile.email,
        categories: profile.categories,
        shipping_policy: profile.shippingPolicy,
        return_policy: profile.returnPolicy,
        warranty_info: profile.warrantyInfo,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor profile:', error);
      throw error;
    }

    // Cast to any to bypass type checking
    const profileData = data as any;

    return {
      id: profileData.id,
      businessName: profileData.business_name,
      description: profileData.description || '',
      location: profileData.location || '',
      phone: profileData.phone || '',
      email: profileData.email || '',
      categories: profileData.categories || [],
      shippingPolicy: profileData.shipping_policy || '',
      returnPolicy: profileData.return_policy || '',
      warrantyInfo: profileData.warranty_info || '',
      createdAt: profileData.created_at,
      verified: profileData.verified || false,
      totalProducts: 0,
      user_id: profileData.user_id,
      storefrontUrl: profileData.storefront_url,
      storefrontEnabled: profileData.storefront_enabled || false
    };
  }

  async updateVendorProfile(updates: Partial<VendorProfile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {};
    
    if (updates.businessName) updateData.business_name = updates.businessName;
    if (updates.description) updateData.description = updates.description;
    if (updates.location) updateData.location = updates.location;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.email) updateData.email = updates.email;
    if (updates.categories) updateData.categories = updates.categories;
    if (updates.shippingPolicy) updateData.shipping_policy = updates.shippingPolicy;
    if (updates.returnPolicy) updateData.return_policy = updates.returnPolicy;
    if (updates.warrantyInfo) updateData.warranty_info = updates.warrantyInfo;

    const { error } = await supabase
      .from('vendor_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  }
}

export const vendorService = new VendorService();
