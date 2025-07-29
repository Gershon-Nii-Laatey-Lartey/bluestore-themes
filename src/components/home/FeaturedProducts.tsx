
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformProductData } from "@/services/product/productTransforms";
import React from "react";
import { memo } from "react";

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  previous_price?: string;
  category: string;
  condition: string;
  description: string;
  location: string;
  phone: string;
  negotiable: boolean;
  images?: string[];
  edited?: boolean;
}

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
}

export const FeaturedProducts = memo(({ products, loading = false }: FeaturedProductsProps) => {
  const getDisplayPrice = (product: Product) => {
    // Priority 1: If the product has been edited and has a previous price (clearance item)
    if (product.edited && product.previous_price) {
      const previousPrice = parseFloat(product.previous_price);
      const currentPrice = parseFloat(product.price);
      if (previousPrice > currentPrice) {
        return {
          currentPrice: `GHS ${currentPrice.toFixed(2)}`,
          previousPrice: `GHS ${previousPrice.toFixed(2)}`,
          showDiscount: true,
          isClearance: true
        };
      }
    }

    // Priority 2: Regular sale pricing with originalPrice
    if (product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price)) {
      return {
        currentPrice: product.price.startsWith('GHS') ? product.price : `GHS ${parseFloat(product.price).toFixed(2)}`,
        previousPrice: product.originalPrice.startsWith('GHS') ? product.originalPrice : `GHS ${parseFloat(product.originalPrice).toFixed(2)}`,
        showDiscount: false,
        isClearance: false
      };
    }

    // Default: Just show current price
    return {
      currentPrice: product.price.startsWith('GHS') ? product.price : `GHS ${parseFloat(product.price).toFixed(2)}`,
      previousPrice: null,
      showDiscount: false,
      isClearance: false
    };
  };

  const ProductSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4 px-[10px]">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
      </CardContent>
    </Card>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">Featured Products</h3>
        <Link to="/search">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See all →
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : products.length === 0 ? (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 text-gray-500">
            No products available. Start by publishing your first ad!
          </div>
        ) : (
          products.map(product => {
            const priceInfo = getDisplayPrice(product);
            
            return (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardContent className="p-4 px-[10px]">
                    <OptimizedImage
                      src={product.images?.[0] || ''}
                      alt={product.title}
                      aspectRatio="square"
                      className="mb-3 group-hover:scale-105 transition-transform duration-200"
                      fallback={<span>📱</span>}
                    />
                    <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-blue-600">
                          {priceInfo.currentPrice}
                        </span>
                        {priceInfo.previousPrice && (
                          <span className={`text-sm line-through ${priceInfo.isClearance ? 'text-red-500' : 'text-gray-500'}`}>
                            {priceInfo.previousPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {product.location}
                    </div>
                    {priceInfo.isClearance && (
                      <div className="mt-1">
                        <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                          Price Reduced!
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
});

FeaturedProducts.displayName = 'FeaturedProducts';
