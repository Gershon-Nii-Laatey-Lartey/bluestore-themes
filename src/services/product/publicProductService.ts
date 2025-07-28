
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { transformProductData } from "./productTransforms";

export class PublicProductService {
  async getFeaturedProducts(): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .order('boost_level', { ascending: false }) // Boost levels first
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    return (data || []).map(transformProductData);
  }

  async getProductsByCategory(category: string): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .eq('category', category)
      .order('boost_level', { ascending: false }) // Boost levels first
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    return (data || []).map(transformProductData);
  }

  async getProductById(id: string): Promise<ProductSubmission | null> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching product by ID:', error);
      throw error;
    }

    return transformProductData(data);
  }
}
