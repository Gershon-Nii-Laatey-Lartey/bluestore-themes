
import { ProductImages } from "./ProductImages";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import { ProductOwnerActions } from "./ProductOwnerActions";
import { ProductActions } from "./ProductActions";
import { VendorInfo } from "./VendorInfo";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductSubmission } from "@/types/product";

interface ProductDetailContentProps {
  product: ProductSubmission;
  vendorName: string;
  vendorId?: string;
  isOwner: boolean;
  onEdit: () => void;
  onClose: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export const ProductDetailContent = ({
  product,
  vendorName,
  vendorId,
  isOwner,
  onEdit,
  onClose,
  onReactivate,
  onDelete,
}: ProductDetailContentProps) => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
        {/* Left Column - Images */}
        <div className="w-full order-1">
          <ProductImages images={product.images || []} title={product.title} />
        </div>
        
        {/* Right Column - Product Info */}
        <div className="w-full order-2 space-y-6">
          <ProductInfo 
            product={product}
            vendorName={vendorName}
            vendorId={vendorId}
          />
          
          <div className="flex flex-col gap-4">
            {isOwner ? (
              <ProductOwnerActions
                product={product}
                onEdit={onEdit}
                onClose={onClose}
                onReactivate={onReactivate}
                onDelete={onDelete}
              />
            ) : (
              <ProductActions 
                productId={product.id}
                sellerId={product.user_id || ''}
                productTitle={product.title}
                isOwner={isOwner}
              />
            )}
          </div>
          
          {!isOwner && (
            <VendorInfo vendorName={vendorName} vendorId={vendorId} />
          )}
        </div>
      </div>
      
      {/* Full Width Description */}
      <div className="w-full">
        <ProductDescription description={product.description} />
      </div>
      
      {/* Related Products */}
      <div className="mt-12 w-full">
        <RelatedProducts 
          currentProductId={product.id} 
          category={product.category} 
        />
      </div>
    </div>
  );
};
