
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomeGarden = () => {
  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Home & Garden</h1>
            <p className="text-gray-600 mt-1">Everything for your home and garden</p>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 text-gray-500">
            No home & garden products available yet. Be the first to post!
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomeGarden;
