
import { ProductSubmission } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface ProductBadgesProps {
  product: ProductSubmission;
}

export const ProductBadges = ({ product }: ProductBadgesProps) => {
  const getStatusBadge = () => {
    switch (product.status) {
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse">
            Processing Payment
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Live
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            Rejected
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {product.status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {getStatusBadge()}
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        {product.condition}
      </Badge>
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        {product.category}
      </Badge>
    </div>
  );
};
