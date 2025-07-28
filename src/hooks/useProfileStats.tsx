
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileStats {
  publishedAds: number;
  favorites: number;
  loading: boolean;
}

export const useProfileStats = (): ProfileStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    publishedAds: 0,
    favorites: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats({ publishedAds: 0, favorites: 0, loading: false });
        return;
      }

      try {
        // Fetch published ads count
        const { count: adsCount } = await supabase
          .from('product_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved');

        // Fetch favorites count
        const { count: favoritesCount } = await supabase
          .from('user_favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          publishedAds: adsCount || 0,
          favorites: favoritesCount || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        setStats({ publishedAds: 0, favorites: 0, loading: false });
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};
