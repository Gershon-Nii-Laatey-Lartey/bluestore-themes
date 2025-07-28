
import { useState, useEffect } from 'react';
import { favoritesService } from '@/services/favoritesService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      try {
        const favorites = await favoritesService.getUserFavorites();
        setFavoriteProducts(favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: "Error",
          description: "Failed to load favorites",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, toast]);

  const addToFavorites = async (productId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      await favoritesService.addToFavorites(productId);
      setFavoriteProducts(prev => [...prev, productId]);
      toast({
        title: "Added to Favorites",
        description: "Product has been added to your favorites",
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (productId: string) => {
    try {
      await favoritesService.removeFromFavorites(productId);
      setFavoriteProducts(prev => prev.filter(id => id !== productId));
      toast({
        title: "Removed from Favorites",
        description: "Product has been removed from your favorites",
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (productId: string) => {
    return favoriteProducts.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  };

  return {
    favoriteProducts,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
};
