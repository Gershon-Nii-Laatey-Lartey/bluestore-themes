
import { supabase } from "@/integrations/supabase/client";
import { AdPackage } from "@/types/adPackage";
import { Star, TrendingUp, Shield, Gift, Zap } from "lucide-react";

export const packageService = {
  async getPackages(): Promise<AdPackage[]> {
    const { data, error } = await supabase
      .from('ad_packages')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }

    // Convert database format to AdPackage format
    return data.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price),
      duration: pkg.duration,
      features: pkg.features || [],
      bestFor: pkg.best_for,
      color: pkg.color,
      icon: this.getIconComponent(pkg.icon),
      recommended: pkg.recommended || false,
      popular: pkg.popular || false,
      adsAllowed: pkg.ads_allowed
    }));
  },

  async createPackage(packageData: Omit<AdPackage, 'icon'> & { icon: string }): Promise<void> {
    const { error } = await supabase
      .from('ad_packages')
      .insert({
        id: packageData.id,
        name: packageData.name,
        price: packageData.price,
        duration: packageData.duration,
        features: packageData.features,
        best_for: packageData.bestFor,
        color: packageData.color,
        icon: packageData.icon,
        recommended: packageData.recommended,
        popular: packageData.popular,
        ads_allowed: packageData.adsAllowed
      });

    if (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  },

  async updatePackage(id: string, packageData: Partial<Omit<AdPackage, 'icon'> & { icon: string }>): Promise<void> {
    const updateData: any = {};
    
    if (packageData.name) updateData.name = packageData.name;
    if (packageData.price !== undefined) updateData.price = packageData.price;
    if (packageData.duration) updateData.duration = packageData.duration;
    if (packageData.features) updateData.features = packageData.features;
    if (packageData.bestFor) updateData.best_for = packageData.bestFor;
    if (packageData.color) updateData.color = packageData.color;
    if (packageData.icon) updateData.icon = packageData.icon;
    if (packageData.recommended !== undefined) updateData.recommended = packageData.recommended;
    if (packageData.popular !== undefined) updateData.popular = packageData.popular;
    if (packageData.adsAllowed !== undefined) updateData.ads_allowed = packageData.adsAllowed;

    const { error } = await supabase
      .from('ad_packages')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  },

  async deletePackage(id: string): Promise<void> {
    const { error } = await supabase
      .from('ad_packages')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  },

  getIconComponent(iconName: string) {
    // Use proper ES6 imports instead of require()
    switch (iconName) {
      case 'Star':
        return Star;
      case 'TrendingUp':
        return TrendingUp;
      case 'Shield':
        return Shield;
      case 'Gift':
        return Gift;
      case 'Zap':
        return Zap;
      default:
        return Star;
    }
  }
};
