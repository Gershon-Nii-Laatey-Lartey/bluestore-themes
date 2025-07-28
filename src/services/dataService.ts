import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  avatar_url: string | null;
}

export interface ProductSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  originalPrice?: number;
  images: string[];
  location: string;
  phone: string;
  negotiable: boolean;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed' | 'processing' | 'draft';
  rejection_reason?: string;
  suggestions?: string;
  main_image_index?: number;
  package?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface KYCSubmission {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  location: string;
  store_name: string;
  product_category: string;
  store_description: string;
  id_document_url: string;
  id_document_back_url?: string;
  selfie_with_id_url: string;
  submitted_at: string;
  reviewed_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  categories?: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
  shipping_policy?: string;
  return_policy?: string;
  warranty_info?: string;
}

export const dataService = {
  async getAllUsers(): Promise<UserProfile[]> {
    console.log('Fetching all users for admin...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  },

  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  async getVendorProfile(userId?: string): Promise<VendorProfile | null> {
    const targetUserId = userId || (await supabase.auth.getUser()).data?.user?.id;
    if (!targetUserId) return null;
    
    console.log('Fetching vendor profile for user:', targetUserId);
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }

    return data;
  },

  async createVendorProfile(vendorData: Omit<VendorProfile, 'id' | 'created_at' | 'updated_at'>): Promise<VendorProfile> {
    console.log('Creating vendor profile:', vendorData);
    const { data, error } = await supabase
      .from('vendor_profiles')
      .insert(vendorData)
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor profile:', error);
      throw error;
    }

    return data;
  },

  async createProductSubmission(productData: Omit<ProductSubmission, 'id' | 'submittedAt'>): Promise<string> {
    console.log('Creating product submission:', productData);
    const { data, error } = await supabase
      .from('product_submissions')
      .insert({
        user_id: productData.user_id,
        title: productData.title,
        description: productData.description,
        category: productData.category,
        condition: productData.condition,
        price: productData.price,
        original_price: productData.originalPrice,
        images: productData.images,
        location: productData.location,
        phone: productData.phone,
        negotiable: productData.negotiable,
        status: productData.status,
        package: productData.package,
        main_image_index: productData.main_image_index,
        rejection_reason: productData.rejection_reason,
        suggestions: productData.suggestions,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product submission:', error);
      throw error;
    }

    return data.id;
  },

  async updateProductSubmission(id: string, updates: Partial<ProductSubmission>): Promise<ProductSubmission> {
    console.log('Updating product submission:', id, updates);
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map camelCase to snake_case for database
    if (updates.originalPrice !== undefined) updateData.original_price = updates.originalPrice;
    if (updates.main_image_index !== undefined) updateData.main_image_index = updates.main_image_index;
    if (updates.user_id !== undefined) updateData.user_id = updates.user_id;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.condition !== undefined) updateData.condition = updates.condition;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.negotiable !== undefined) updateData.negotiable = updates.negotiable;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.package !== undefined) updateData.package = updates.package;
    if (updates.rejection_reason !== undefined) updateData.rejection_reason = updates.rejection_reason;
    if (updates.suggestions !== undefined) updateData.suggestions = updates.suggestions;

    const { data, error } = await supabase
      .from('product_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product submission:', error);
      throw error;
    }

    return {
      ...data,
      submittedAt: data.created_at,
      originalPrice: data.original_price,
      main_image_index: data.main_image_index,
      status: data.status as 'pending' | 'approved' | 'rejected' | 'closed' | 'processing' | 'draft',
      package: data.package as { id: string; name: string; price: number; } | undefined
    };
  },

  async getAllKYCSubmissions(): Promise<KYCSubmission[]> {
    console.log('Fetching all KYC submissions for admin...');
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC submissions:', error);
      throw error;
    }

    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'approved' | 'rejected'
    }));
  },

  async getKYCSubmission(userId?: string): Promise<KYCSubmission | null> {
    const targetUserId = userId || (await supabase.auth.getUser()).data?.user?.id;
    if (!targetUserId) return null;
    
    console.log('Fetching KYC submission for user:', targetUserId);
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching KYC submission:', error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      status: data.status as 'pending' | 'approved' | 'rejected'
    };
  },

  async getProductSubmissions(): Promise<ProductSubmission[]> {
    console.log('Fetching all product submissions for admin...');
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product submissions:', error);
      throw error;
    }

    // Transform the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      submittedAt: item.created_at,
      originalPrice: item.original_price,
      main_image_index: item.main_image_index,
      status: item.status as 'pending' | 'approved' | 'rejected' | 'closed' | 'processing' | 'draft',
      package: item.package as { id: string; name: string; price: number; } | undefined
    }));
  },

  async approveKYCSubmission(kycId: string): Promise<void> {
    console.log('Approving KYC submission:', kycId);
    const { error } = await supabase
      .from('kyc_submissions')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', kycId);

    if (error) {
      console.error('Error approving KYC:', error);
      throw error;
    }
  },

  async rejectKYCSubmission(kycId: string, rejectionReason: string): Promise<void> {
    console.log('Rejecting KYC submission:', kycId);
    const { error } = await supabase
      .from('kyc_submissions')
      .update({ 
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', kycId);

    if (error) {
      console.error('Error rejecting KYC:', error);
      throw error;
    }
  },

  async approveProductSubmission(submissionId: string, suggestions?: string): Promise<void> {
    console.log('Approving product submission:', submissionId);
    const updateData: any = { status: 'approved' };
    if (suggestions) {
      updateData.suggestions = suggestions;
    }

    const { error } = await supabase
      .from('product_submissions')
      .update(updateData)
      .eq('id', submissionId);

    if (error) {
      console.error('Error approving product:', error);
      throw error;
    }
  },

  async rejectProductSubmission(submissionId: string, rejectionReason: string): Promise<void> {
    console.log('Rejecting product submission:', submissionId);
    const { error } = await supabase
      .from('product_submissions')
      .update({ 
        status: 'rejected',
        rejection_reason: rejectionReason
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error rejecting product:', error);
      throw error;
    }
  },

  async isCSWorker(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_cs_worker');
      if (error) {
        console.error('Error checking CS worker status:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('Error checking CS worker status:', error);
      return false;
    }
  }
};
