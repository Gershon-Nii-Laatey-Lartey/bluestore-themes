
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useOptimizedFavorites } from "@/hooks/useOptimizedFavorites";
import { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { ProductGrid } from "@/components/ProductGrid";

const Favorites = () => {
  const navigate = useNavigate();
  const { favoriteProducts, loading: favoritesLoading } = useOptimizedFavorites();
  const [favoriteProductDetails, setFavoriteProductDetails] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favoriteProducts.length === 0) {
        setFavoriteProductDetails([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allProducts = await productService.getFeaturedProducts();
        const favoriteDetails = allProducts.filter(product => 
          favoriteProducts.includes(product.id)
        );
        setFavoriteProductDetails(favoriteDetails);
      } catch (error) {
        console.error("Error fetching favorite products:", error);
        setFavoriteProductDetails([]);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteProducts();
    }
  }, [favoriteProducts, favoritesLoading]);

  const totalLoading = favoritesLoading || loading;

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            My Favorites
          </h1>
          <span className="text-sm text-gray-500">
            {totalLoading ? "..." : `${favoriteProductDetails.length} items`}
          </span>
        </div>

        {totalLoading ? (
          <ProductGrid products={[]} loading={true} />
        ) : favoriteProductDetails.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-4">Start adding products to your favorites</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/')}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <ProductGrid products={favoriteProductDetails} loading={false} />
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
