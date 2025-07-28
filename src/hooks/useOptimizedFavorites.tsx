
import { useState, useEffect, useCallback, useMemo } from 'react';
import { favoritesService } from '@/services/favoritesService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useOptimizedFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  // Memoize the favorites set for O(1) lookup performance
  const favoritesSet = useMemo(() => new Set(favoriteProducts), [favoriteProducts]);

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

  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to favorites",
        variant: "destructive",
      });
      return;
    }

    if (pendingOperations.has(productId)) {
      return; // Prevent duplicate operations
    }

    // Optimistic update
    setFavoriteProducts(prev => [...prev, productId]);
    setPendingOperations(prev => new Set(prev).add(productId));

    try {
      await favoritesService.addToFavorites(productId);
      toast({
        title: "Added to Favorites",
        description: "Product has been added to your favorites",
      });
    } catch (error) {
      // Revert optimistic update on error
      setFavoriteProducts(prev => prev.filter(id => id !== productId));
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [user, toast, pendingOperations]);

  const removeFromFavorites = useCallback(async (productId: string) => {
    if (pendingOperations.has(productId)) {
      return; // Prevent duplicate operations
    }

    // Optimistic update
    setFavoriteProducts(prev => prev.filter(id => id !== productId));
    setPendingOperations(prev => new Set(prev).add(productId));

    try {
      await favoritesService.removeFromFavorites(productId);
      toast({
        title: "Removed from Favorites",
        description: "Product has been removed from your favorites",
      });
    } catch (error) {
      // Revert optimistic update on error
      setFavoriteProducts(prev => [...prev, productId]);
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [toast, pendingOperations]);

  const isFavorite = useCallback((productId: string) => {
    return favoritesSet.has(productId);
  }, [favoritesSet]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  const isPending = useCallback((productId: string) => {
    return pendingOperations.has(productId);
  }, [pendingOperations]);

  return {
    favoriteProducts,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isPending
  };
};
