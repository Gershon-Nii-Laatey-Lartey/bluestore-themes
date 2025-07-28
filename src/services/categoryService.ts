
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'subsubcategory';
  parent_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    console.log('Fetching all categories...');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return (data || []) as Category[];
  },

  async getCategoriesByType(type: 'category' | 'subcategory' | 'subsubcategory'): Promise<Category[]> {
    console.log(`Fetching categories of type: ${type}`);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error(`Error fetching ${type} categories:`, error);
      throw error;
    }

    return (data || []) as Category[];
  },

  async getCategoriesByParent(parentId: string): Promise<Category[]> {
    console.log(`Fetching child categories for parent: ${parentId}`);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching child categories:', error);
      throw error;
    }

    return (data || []) as Category[];
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    console.log('Creating category:', category);
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    console.log('Updating category:', id, updates);
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    console.log('Deleting category:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  async toggleCategoryActive(id: string, active: boolean): Promise<Category> {
    console.log('Toggling category active status:', id, active);
    const { data, error } = await supabase
      .from('categories')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }

    return data as Category;
  }
};
