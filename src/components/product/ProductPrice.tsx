
import { ProductSubmission } from "@/types/product";

interface ProductPriceProps {
  product: ProductSubmission;
}

export const ProductPrice = ({ product }: ProductPriceProps) => {
  // Safely convert price to number, handling both string and number types
  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    const parsed = parseFloat(price.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  const currentPrice = parsePrice(product.price);
  const originalPrice = product.originalPrice ? parsePrice(product.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > currentPrice;

  return (
    <div className="flex items-center space-x-3">
      <span className="text-3xl font-bold text-blue-600">
        GHS {currentPrice.toFixed(2)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-lg text-gray-500 line-through">
            GHS {originalPrice.toFixed(2)}
          </span>
          <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
            On Sale
          </span>
        </>
      )}
      {product.negotiable && (
        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          Negotiable
        </span>
      )}
    </div>
  );
};
