
import { supabase } from "@/integrations/supabase/client";

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  location?: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  topSearchTerms: Array<{ query: string; count: number }>;
  searchesByLocation: Array<{ location: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
}

class SearchService {
  private readonly STORAGE_KEY = 'bluestore_search_history';
  private readonly MAX_MOBILE_HISTORY = 4;
  private readonly MAX_DESKTOP_HISTORY = 10;

  // Get search history from localStorage (for quick access)
  getSearchHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const history: SearchHistoryItem[] = JSON.parse(stored);
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Add search query to both localStorage and database
  async addToHistory(query: string, location?: string): Promise<void> {
    if (!query.trim()) return;

    try {
      // Add to localStorage for quick access
      const history = this.getSearchHistory();
      const existingIndex = history.findIndex(item => 
        item.query.toLowerCase() === query.toLowerCase()
      );

      // Remove existing entry if found
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }

      // Add new entry at the beginning
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
        location
      };

      history.unshift(newItem);

      // Limit history size based on screen size
      const maxHistory = window.innerWidth < 768 ? this.MAX_MOBILE_HISTORY : this.MAX_DESKTOP_HISTORY;
      const trimmedHistory = history.slice(0, maxHistory);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));

      // Also store in database for analytics
      await this.storeSearchInDatabase(query, location);
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  // Store search in database for analytics
  private async storeSearchInDatabase(query: string, location?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: user?.id || null,
          search_query: query.trim(),
          location: location || null,
          results_count: 0 // This will be updated when we get search results
        });

      if (error) {
        console.error('Error storing search in database:', error);
      }
    } catch (error) {
      console.error('Error storing search in database:', error);
    }
  }

  // Remove item from search history
  removeFromHistory(id: string): void {
    try {
      const history = this.getSearchHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  // Clear all search history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Get search analytics for admin
  async getSearchAnalytics(days: number = 30): Promise<SearchAnalytics> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const searches = data || [];
      
      // Calculate analytics
      const totalSearches = searches.length;
      const uniqueQueries = new Set(searches.map(s => s.search_query.toLowerCase())).size;
      
      // Top search terms
      const queryCount = searches.reduce((acc, search) => {
        const query = search.search_query.toLowerCase();
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSearchTerms = Object.entries(queryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // Searches by location
      const locationCount = searches.reduce((acc, search) => {
        if (search.location) {
          acc[search.location] = (acc[search.location] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const searchesByLocation = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }));

      // Search trends (daily)
      const trends = searches.reduce((acc, search) => {
        const date = new Date(search.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const searchTrends = Object.entries(trends)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

      return {
        totalSearches,
        uniqueQueries,
        topSearchTerms,
        searchesByLocation,
        searchTrends
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        topSearchTerms: [],
        searchesByLocation: [],
        searchTrends: []
      };
    }
  }

  // Search products with location filtering
  async searchProducts(query: string, location?: string, filters?: any) {
    try {
      // Add to search history
      await this.addToHistory(query, location);
      
      // This is a placeholder for actual search implementation
      // In a real implementation, this would search through products
      // and filter by location if provided
      
      return {
        products: [],
        totalCount: 0,
        location: location
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        products: [],
        totalCount: 0,
        location: location
      };
    }
  }
}

export const searchService = new SearchService();
