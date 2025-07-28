
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductDetailErrorProps {
  error: string;
}

export const ProductDetailError = ({ error }: ProductDetailErrorProps) => {
  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error}
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <Link to="/">
            <Button className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
