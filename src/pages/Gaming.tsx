
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";

const Gaming = () => {
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const gamingProducts = await productService.getProductsByCategory('gaming');
        setProducts(gamingProducts);
      } catch (err) {
        console.error('Error fetching gaming products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gaming</h1>
            <p className="text-gray-600 mt-1">Gaming consoles, accessories, and gear</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">Sort</span>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </Layout>
  );
};

export default Gaming;
