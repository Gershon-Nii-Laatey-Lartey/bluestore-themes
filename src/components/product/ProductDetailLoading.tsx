
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent } from "@/components/ui/card";

export const ProductDetailLoading = () => {
  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              
              {/* Right Column - Product Info */}
              <div className="space-y-6">
                {/* Title and Price */}
                <div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Vendor Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Related Products */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
