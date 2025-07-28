
import { supabase } from "@/integrations/supabase/client";

export interface Location {
  id: string;
  name: string;
  type: 'region' | 'city' | 'town';
  parent_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const locationService = {
  async getAllLocations(): Promise<Location[]> {
    console.log('Fetching all locations...');
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }

    return (data || []) as Location[];
  },

  async getLocationsByType(type: 'region' | 'city' | 'town'): Promise<Location[]> {
    console.log(`Fetching locations of type: ${type}`);
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('type', type)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error(`Error fetching ${type} locations:`, error);
      throw error;
    }

    return (data || []) as Location[];
  },

  async getLocationsByParent(parentId: string): Promise<Location[]> {
    console.log(`Fetching child locations for parent: ${parentId}`);
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('parent_id', parentId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching child locations:', error);
      throw error;
    }

    return (data || []) as Location[];
  },

  async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> {
    console.log('Creating location:', location);
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      throw error;
    }

    return data as Location;
  },

  async updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
    console.log('Updating location:', id, updates);
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      throw error;
    }

    return data as Location;
  },

  async deleteLocation(id: string): Promise<void> {
    console.log('Deleting location:', id);
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  },

  async toggleLocationActive(id: string, active: boolean): Promise<Location> {
    console.log('Toggling location active status:', id, active);
    const { data, error } = await supabase
      .from('locations')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling location status:', error);
      throw error;
    }

    return data as Location;
  }
};
