
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { transformProductData } from "@/services/product/productTransforms";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, TrendingDown, Percent } from "lucide-react";

const Clearance = () => {
  const { toast } = useToast();

  const {
    data: clearanceProducts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['clearance-products'],
    queryFn: async () => {
      console.log('Fetching clearance products...');
      
      // Fetch products that have been edited with price reductions
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('status', 'approved')
        .eq('edited', true)
        .not('previous_price', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching clearance products:', error);
        throw error;
      }

      console.log('Raw clearance data:', data);

      // Filter products where previous_price > current_price (actual price reductions)
      const reducedPriceProducts = (data || []).filter(item => {
        const previousPrice = parseFloat(String(item.previous_price || '0'));
        const currentPrice = parseFloat(String(item.price || '0'));
        return previousPrice > currentPrice;
      });

      console.log('Filtered clearance products:', reducedPriceProducts.length);

      return reducedPriceProducts.map(transformProductData);
    }
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load clearance products",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const calculateSavings = (currentPrice: string, previousPrice: string) => {
    const current = parseFloat(String(currentPrice));
    const previous = parseFloat(String(previousPrice));
    const savings = previous - current;
    const percentage = (savings / previous * 100).toFixed(0);
    return { savings, percentage };
  };

  const totalSavingsAvailable = clearanceProducts.reduce((total, product) => {
    if (product.previous_price) {
      const { savings } = calculateSavings(product.price, product.previous_price);
      return total + savings;
    }
    return total;
  }, 0);

  const averageDiscount = clearanceProducts.length > 0 
    ? (clearanceProducts.reduce((total, product) => {
        if (product.previous_price) {
          const { percentage } = calculateSavings(product.price, product.previous_price);
          return total + parseFloat(percentage);
        }
        return total;
      }, 0) / clearanceProducts.length).toFixed(0)
    : '0';

  return (
    <Layout>
      {/* Mobile Header - only show on mobile */}
      <div className="md:hidden w-full">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6 w-full px-4 md:px-0">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Tag className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Clearance Sale
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals on products with reduced prices. Limited time offers you don't want to miss!
          </p>
        </div>

        {/* Stats Cards */}
        {clearanceProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products on Sale</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clearanceProducts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Items with reduced prices
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHS {totalSavingsAvailable.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Available savings across all items
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageDiscount}%</div>
                <p className="text-xs text-muted-foreground">
                  Average price reduction
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Discounted Products ({clearanceProducts.length})
          </h2>
          
          {isLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : clearanceProducts.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No clearance items yet</h3>
              <p className="text-gray-500">
                Check back later for amazing deals and price reductions!
              </p>
            </div>
          ) : (
            <ProductGrid products={clearanceProducts} loading={isLoading} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Clearance;
