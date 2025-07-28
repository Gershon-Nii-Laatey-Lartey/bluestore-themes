
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { transformProductData } from "./productTransforms";

export class AuthenticatedProductService {
  async getProductSubmissions(): Promise<ProductSubmission[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user product submissions:', error);
      throw error;
    }

    return (data || []).map(transformProductData);
  }

  async createProductSubmission(submission: Omit<ProductSubmission, 'id'>, imageFiles?: File[]): Promise<ProductSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Handle image uploads if provided
    let imageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      // Image upload logic would go here
      // For now, we'll use the provided images array
      imageUrls = submission.images || [];
    } else {
      imageUrls = submission.images || [];
    }

    // Serialize the package data to remove non-JSON-serializable properties
    const packageData = submission.package ? {
      id: submission.package.id,
      name: submission.package.name,
      price: submission.package.price,
      duration: submission.package.duration,
      features: submission.package.features,
      bestFor: submission.package.bestFor,
      color: submission.package.color,
      recommended: submission.package.recommended,
      popular: submission.package.popular,
      adsAllowed: submission.package.adsAllowed
    } : null;

    const submissionData = {
      user_id: user.id,
      title: submission.title,
      description: submission.description,
      category: submission.category,
      condition: submission.condition,
      price: parseFloat(submission.price),
      original_price: submission.originalPrice ? parseFloat(submission.originalPrice) : null,
      images: imageUrls,
      location: submission.location,
      phone: submission.phone,
      negotiable: submission.negotiable,
      status: submission.status,
      package: packageData,
      package_price: submission.package?.price || 0,
      main_image_index: submission.main_image_index || 0,
      rejection_reason: submission.rejection_reason,
      suggestions: submission.suggestions,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('product_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  async updateProductSubmission(id: string, updates: Partial<ProductSubmission>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map updates to database columns
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.condition !== undefined) updateData.condition = updates.condition;
    if (updates.price !== undefined) updateData.price = parseFloat(updates.price);
    if (updates.originalPrice !== undefined) updateData.original_price = updates.originalPrice ? parseFloat(updates.originalPrice) : null;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.negotiable !== undefined) updateData.negotiable = updates.negotiable;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.package !== undefined) {
      // Serialize the package data
      const packageData = updates.package ? {
        id: updates.package.id,
        name: updates.package.name,
        price: updates.package.price,
        duration: updates.package.duration,
        features: updates.package.features,
        bestFor: updates.package.bestFor,
        color: updates.package.color,
        recommended: updates.package.recommended,
        popular: updates.package.popular,
        adsAllowed: updates.package.adsAllowed
      } : null;
      
      updateData.package = packageData;
      updateData.package_price = updates.package?.price || 0;
    }
    if (updates.main_image_index !== undefined) updateData.main_image_index = updates.main_image_index;
    if (updates.rejection_reason !== undefined) updateData.rejection_reason = updates.rejection_reason;
    if (updates.suggestions !== undefined) updateData.suggestions = updates.suggestions;

    const { error } = await supabase
      .from('product_submissions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating product submission:', error);
      throw error;
    }
  }

  async reactivateProductSubmission(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('product_submissions')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error reactivating product submission:', error);
      throw error;
    }
  }

  async editProductSubmission(id: string, updates: Partial<ProductSubmission>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const editData: any = {
      status: 'pending', // Reset to pending for review
      edited: true,
      updated_at: new Date().toISOString()
    };

    // Store previous price if price is being changed
    if (updates.price !== undefined) {
      // Get current product to store previous price
      const { data: currentProduct } = await supabase
        .from('product_submissions')
        .select('price')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (currentProduct) {
        editData.previous_price = currentProduct.price;
        editData.price = parseFloat(updates.price);
      }
    }

    // Apply other updates
    if (updates.title !== undefined) editData.title = updates.title;
    if (updates.description !== undefined) editData.description = updates.description;
    if (updates.category !== undefined) editData.category = updates.category;
    if (updates.condition !== undefined) editData.condition = updates.condition;
    if (updates.originalPrice !== undefined) editData.original_price = updates.originalPrice ? parseFloat(updates.originalPrice) : null;
    if (updates.images !== undefined) editData.images = updates.images;
    if (updates.location !== undefined) editData.location = updates.location;
    if (updates.phone !== undefined) editData.phone = updates.phone;
    if (updates.negotiable !== undefined) editData.negotiable = updates.negotiable;
    if (updates.main_image_index !== undefined) editData.main_image_index = updates.main_image_index;

    const { error } = await supabase
      .from('product_submissions')
      .update(editData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error editing product submission:', error);
      throw error;
    }
  }

  async deleteProductSubmission(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('product_submissions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting product submission:', error);
      throw error;
    }
  }
}
