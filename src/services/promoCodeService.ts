import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free';
  discount_value: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeValidation {
  is_valid: boolean;
  discount_type?: string;
  discount_value?: number;
  message: string;
}

export interface PromoCodeApplication {
  success: boolean;
  discount_amount: number;
  final_amount: number;
  message: string;
}

class PromoCodeService {
  /**
   * Validate a promo code
   */
  async validatePromoCode(code: string, userId: string): Promise<PromoCodeValidation> {
    try {
      const { data, error } = await supabase
        .rpc('validate_promo_code', {
          p_code: code,
          p_user_id: userId
        });

      if (error) throw error;

      const result = data?.[0];
      return {
        is_valid: result?.is_valid || false,
        discount_type: result?.discount_type,
        discount_value: result?.discount_value,
        message: result?.message || 'Invalid promo code'
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        is_valid: false,
        message: 'Error validating promo code'
      };
    }
  }

  /**
   * Apply a promo code discount
   */
  async applyPromoCode(code: string, userId: string, originalAmount: number): Promise<PromoCodeApplication> {
    try {
      const { data, error } = await supabase
        .rpc('apply_promo_code_discount', {
          p_code: code,
          p_user_id: userId,
          p_original_amount: originalAmount
        });

      if (error) throw error;

      const result = data?.[0];
      return {
        success: result?.success || false,
        discount_amount: result?.discount_amount || 0,
        final_amount: result?.final_amount || originalAmount,
        message: result?.message || 'Error applying promo code'
      };
    } catch (error) {
      console.error('Error applying promo code:', error);
      return {
        success: false,
        discount_amount: 0,
        final_amount: originalAmount,
        message: 'Error applying promo code'
      };
    }
  }

  /**
   * Get all promo codes (admin only)
   */
  async getAllPromoCodes(): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return [];
    }
  }

  /**
   * Create a new promo code (admin only)
   */
  async createPromoCode(promoCode: Omit<PromoCode, 'id' | 'used_count' | 'created_at' | 'updated_at'>): Promise<PromoCode> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCode)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  }

  /**
   * Update a promo code (admin only)
   */
  async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<PromoCode> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating promo code:', error);
      throw error;
    }
  }

  /**
   * Delete a promo code (admin only)
   */
  async deletePromoCode(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting promo code:', error);
      throw error;
    }
  }

  /**
   * Get promo code usage statistics (admin only)
   */
  async getPromoCodeUsage(promoCodeId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('promo_code_usage')
        .select(`
          *,
          users:user_id(email, full_name),
          products:product_id(title)
        `)
        .eq('promo_code_id', promoCodeId)
        .order('used_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching promo code usage:', error);
      return [];
    }
  }
}

export const promoCodeService = new PromoCodeService(); 