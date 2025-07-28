
import { PublicProductService } from "@/services/product/publicProductService";
import { ProductSubmission } from "@/types/product";

class OptimizedProductService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private publicProductService = new PublicProductService();

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private getCacheKey(method: string, params?: any): string {
    return `${method}_${params ? JSON.stringify(params) : ''}`;
  }

  async getFeaturedProducts(): Promise<ProductSubmission[]> {
    const cacheKey = this.getCacheKey('getFeaturedProducts');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.publicProductService.getFeaturedProducts();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getProductsByCategory(category: string): Promise<ProductSubmission[]> {
    const cacheKey = this.getCacheKey('getProductsByCategory', { category });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.publicProductService.getProductsByCategory(category);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getProductById(id: string): Promise<ProductSubmission | null> {
    const cacheKey = this.getCacheKey('getProductById', { id });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.publicProductService.getProductById(id);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // Clear specific cache entries when data is updated
  invalidateCache(method?: string, params?: any): void {
    if (method) {
      const cacheKey = this.getCacheKey(method, params);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (!this.isValidCache(value.timestamp)) {
        this.cache.delete(key);
      }
    }
  }
}

export const optimizedProductService = new OptimizedProductService();

// Clear expired cache every 10 minutes
setInterval(() => {
  optimizedProductService.clearExpiredCache();
}, 10 * 60 * 1000);
