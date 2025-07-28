
import { Card, CardContent } from "@/components/ui/card";
import { ProductSubmission } from "@/types/product";

interface ProductDetailsProps {
  product: ProductSubmission;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3">Product Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Condition:</span>
            <span className="font-medium">{product.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{product.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{product.phone}</span>
          </div>
          {product.negotiable && (
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-green-600">Negotiable</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
