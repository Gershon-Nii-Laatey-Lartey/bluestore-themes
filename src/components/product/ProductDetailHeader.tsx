
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductSubmission } from "@/types/product";

interface ProductDetailHeaderProps {
  product: ProductSubmission;
  isOwner: boolean;
}

export const ProductDetailHeader = ({ product, isOwner }: ProductDetailHeaderProps) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Status badge for pending/rejected products for owners */}
      {isOwner && product.status !== 'approved' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
              product.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : product.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
            <span className="text-sm text-gray-600">
              {product.status === 'pending' && "Your ad is under review"}
              {product.status === 'rejected' && "Your ad was rejected and needs changes"}
              {product.status === 'closed' && "Your ad is currently closed"}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
