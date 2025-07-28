
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";

const Sports = () => {
  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sports</h1>
          <p className="text-gray-600 mt-1">Sports equipment and gear</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Sports products coming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default Sports;
