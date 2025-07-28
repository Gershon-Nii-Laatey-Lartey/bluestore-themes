
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { ProductSubmission } from "@/services/dataService";
import { DocumentImage } from "./DocumentImage";
import { ProductRejectionModal } from "./ProductRejectionModal";
import { ProductSuggestionModal } from "./ProductSuggestionModal";
import { useState } from "react";

interface ProductDetailModalProps {
  product: ProductSubmission;
  onApproval: (submissionId: string, approved: boolean, rejectionReason?: string, suggestions?: string) => void;
}

export const ProductDetailModal = ({ product, onApproval }: ProductDetailModalProps) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDirectApprove = async () => {
    setIsSubmitting(true);
    await onApproval(product.id, true);
    setIsSubmitting(false);
  };

  const handleSuggestionSubmit = async (suggestion: string) => {
    setIsSubmitting(true);
    await onApproval(product.id, true, undefined, suggestion);
    setIsSubmitting(false);
    setShowSuggestionModal(false);
  };

  const handleSkipSuggestion = async () => {
    setIsSubmitting(true);
    await onApproval(product.id, true);
    setIsSubmitting(false);
    setShowSuggestionModal(false);
  };

  const handleReject = async (reason: string) => {
    setIsSubmitting(true);
    await onApproval(product.id, false, reason);
    setIsSubmitting(false);
    setShowRejectionModal(false);
  };

  return (
    <>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
              {product.images && product.images.length > 0 ? (
                <DocumentImage 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <div className="text-4xl">📱</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(1, 4).map((img, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    <DocumentImage 
                      src={img} 
                      alt={`${product.title} - ${index + 2}`} 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                    <div className="text-2xl hidden">📱</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Product Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-green-600">GHS {product.price}</span>
                </div>
                {product.originalPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="text-gray-500 line-through">GHS {product.originalPrice}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{product.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Negotiable:</span>
                  <span className="font-medium">{product.negotiable ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700" 
                onClick={handleDirectApprove}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? "Approving..." : "Quick Approve"}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => setShowSuggestionModal(true)}
                disabled={isSubmitting}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggest & Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => setShowRejectionModal(true)}
                disabled={isSubmitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <ProductRejectionModal
          productTitle={product.title}
          onReject={handleReject}
          onCancel={() => setShowRejectionModal(false)}
          isSubmitting={isSubmitting}
        />
      </Dialog>

      <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
        <ProductSuggestionModal
          productTitle={product.title}
          onSuggestion={handleSuggestionSubmit}
          onSkip={handleSkipSuggestion}
          onCancel={() => setShowSuggestionModal(false)}
          isSubmitting={isSubmitting}
        />
      </Dialog>
    </>
  );
};
