
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { FavoriteButton } from "@/components/FavoriteButton";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
}

export const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await productService.getFeaturedProducts();
        
        // Filter out current product and get products from same category (if specified)
        let filtered = allProducts.filter(product => product.id !== currentProductId);
        
        if (category) {
          const sameCategory = filtered.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
          );
          
          // If we have products in the same category, use them, otherwise use all products
          if (sameCategory.length > 0) {
            filtered = sameCategory;
          }
        }
        
        // Get up to 4 random products
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No related products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <Link to={`/product/${product.id}`}>
                <OptimizedImage
                  src={product.images?.[0] || ''}
                  alt={product.title}
                  aspectRatio="square"
                  className="mb-3 group-hover:scale-105 transition-transform duration-200"
                  fallback={
                    <div className="text-4xl flex items-center justify-center h-full">📱</div>
                  }
                />
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-blue-600">
                    GHS {parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Sale
                    </span>
                  )}
                </div>
                <FavoriteButton productId={product.id} />
              </div>
              
              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                <span className="text-sm text-gray-500 line-through">
                  GHS {parseFloat(product.originalPrice).toFixed(2)}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
