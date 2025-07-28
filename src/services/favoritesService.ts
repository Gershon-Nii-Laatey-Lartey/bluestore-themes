
import { supabase } from '@/integrations/supabase/client';

export const favoritesService = {
  async addToFavorites(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to add favorites');
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        product_id: productId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromFavorites(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to remove favorites');
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async getUserFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) throw error;
    return data?.map(fav => fav.product_id) || [];
  },

  async isFavorite(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};
