
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { transformProductData } from "@/services/product/productTransforms";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  // Query for products with price reductions (edited products with previous_price)
  const { data: clearanceProducts = [] } = useQuery({
    queryKey: ['clearance-products-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('status', 'approved')
        .eq('edited', true)
        .not('previous_price', 'is', null)
        .limit(3);

      if (error) throw error;
      
      // Filter products where previous_price > current_price (actual price reductions)
      const reducedPriceProducts = (data || []).filter(item => {
        const previousPrice = parseFloat(String(item.previous_price || '0'));
        const currentPrice = parseFloat(String(item.price || '0'));
        return previousPrice > currentPrice;
      });
      
      return reducedPriceProducts.map(transformProductData);
    }
  });

  // Calculate discount percentage for the best deal
  const getBestDiscount = () => {
    if (clearanceProducts.length === 0) return "50%";
    
    let bestDiscount = 0;
    clearanceProducts.forEach(product => {
      if (product.previous_price) {
        const previousPrice = parseFloat(String(product.previous_price));
        const currentPrice = parseFloat(String(product.price));
        const discount = ((previousPrice - currentPrice) / previousPrice) * 100;
        if (discount > bestDiscount) {
          bestDiscount = discount;
        }
      }
    });
    
    return bestDiscount > 0 ? `${Math.round(bestDiscount)}%` : "50%";
  };

  return (
    <section className="w-full mb-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden max-w-full">
        <div className="relative z-10">

          <h2 className="text-2xl md:text-4xl font-bold mb-2">
            Clearance
            <br />
            Sales
          </h2>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block mb-4">
            <span className="text-sm font-medium">
              📊 Up to {getBestDiscount()} Off
              {clearanceProducts.length > 0 && (
                <span className="ml-2">• {clearanceProducts.length} items</span>
              )}
            </span>
          </div>
          <br />
          <Link to="/clearance">
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-6">
              See all →
            </Button>
          </Link>
        </div>
        
        {/* Gaming Console Illustration */}
        <div className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-20 h-28 md:w-32 md:h-40 bg-black/30 rounded-lg flex items-center justify-center">
            <div className="text-3xl md:text-4xl">🎮</div>
          </div>
        </div>
      </div>
    </section>
  );
};
