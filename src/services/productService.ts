import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProductSubmission } from "@/types/product";
import { optimizedProductService } from "./optimizedProductService";

export const incrementUserAdsUsed = async (userId: string) => {
  try {
    console.log('Attempting to increment ads used for user:', userId);
    
    // Use the improved database function that finds the first available subscription
    const { error } = await supabase.rpc('increment_user_ads_used', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('Database function error:', error);
      throw new Error(`Failed to increment ads used: ${error.message}`);
    }
    
    console.log('Successfully incremented ads used via database function');
  } catch (error) {
    console.error('Failed to increment user ads used:', error);
    throw error;
  }
};

// Transform database product to frontend format
const transformProductData = (data: any): ProductSubmission => {
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
    boost_level: data.boost_level
  };
};

// Helper function to convert ProductSubmission to database format
const convertToDbFormat = (updates: Partial<ProductSubmission>) => {
  const dbUpdates: any = { ...updates };
  
  // Convert frontend property names to database column names
  if (updates.originalPrice !== undefined) {
    dbUpdates.original_price = updates.originalPrice ? parseFloat(updates.originalPrice) : null;
    delete dbUpdates.originalPrice;
  }
  
  if (updates.main_image_index !== undefined) {
    dbUpdates.main_image_index = updates.main_image_index;
  }
  
  if (updates.price !== undefined) {
    dbUpdates.price = parseFloat(updates.price);
  }
  
  // Convert package to JSON format for database storage
  if (updates.package !== undefined) {
    dbUpdates.package = updates.package ? JSON.parse(JSON.stringify(updates.package)) : null;
  }
  
  // Handle boost_level
  if (updates.boost_level !== undefined) {
    dbUpdates.boost_level = updates.boost_level;
  }
  
  // Remove frontend-only properties
  delete dbUpdates.submittedAt;
  delete dbUpdates.packagePrice;
  delete dbUpdates.created_at;
  delete dbUpdates.updated_at;
  
  return dbUpdates;
};

class ProductService {
  // Search products by query (public)
  async searchProducts(query: string): Promise<ProductSubmission[]> {
    if (!query.trim()) {
      return this.getFeaturedProducts();
    }

    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('boost_level', { ascending: false }) // Boost levels first
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return (data || []).map(transformProductData);
  }

  // Get featured products (public)
  async getFeaturedProducts(): Promise<ProductSubmission[]> {
    return optimizedProductService.getFeaturedProducts();
  }

  // Get products by category (public)
  async getProductsByCategory(category: string): Promise<ProductSubmission[]> {
    return optimizedProductService.getProductsByCategory(category);
  }

  // Get single product by ID (public)
  async getProductById(id: string): Promise<ProductSubmission | null> {
    return optimizedProductService.getProductById(id);
  }

  // Get all product submissions (authenticated - for admin/user management)
  async getProductSubmissions(): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product submissions:', error);
      throw error;
    }

    return (data || []).map(transformProductData);
  }

  // Update product submission (authenticated)
  async updateProductSubmission(id: string, updates: Partial<ProductSubmission>) {
    const dbUpdates = convertToDbFormat(updates);
    
    const { data, error } = await supabase
      .from('product_submissions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // Edit product submission (authenticated)
  async editProductSubmission(id: string, updates: Partial<ProductSubmission>) {
    // Mark as edited and set status to pending for review
    const editUpdates: Partial<ProductSubmission> = {
      ...updates,
      edited: true,
      status: 'pending' as const
    };

    const dbUpdates = convertToDbFormat(editUpdates);

    const { data, error } = await supabase
      .from('product_submissions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error editing product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // Reactivate product submission (authenticated)
  async reactivateProductSubmission(id: string) {
    const { data, error } = await supabase
      .from('product_submissions')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error reactivating product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // Delete product submission (authenticated)
  async deleteProductSubmission(id: string) {
    const { error } = await supabase
      .from('product_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product submission:', error);
      throw error;
    }
  }

  // Boost product submission (authenticated)
  async boostProductSubmission(id: string, boostLevel: 'boost' | '2x_boost') {
    const { data, error } = await supabase
      .from('product_submissions')
      .update({ 
        boost_level: boostLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error boosting product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }
}

// Export the service instance
export const productService = new ProductService();
