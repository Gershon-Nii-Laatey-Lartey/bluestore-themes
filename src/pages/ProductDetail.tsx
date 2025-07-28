
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { EditProductForm } from "@/components/EditProductForm";
import { ProductDetailLoading } from "@/components/product/ProductDetailLoading";
import { ProductDetailError } from "@/components/product/ProductDetailError";
import { ProductDetailHeader } from "@/components/product/ProductDetailHeader";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { useProductDetail } from "@/hooks/useProductDetail";
import { adAnalyticsService } from "@/services/adAnalyticsService";
import { useAuth } from "@/hooks/useAuth";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    id,
    product,
    vendor,
    vendorName,
    vendorId,
    loading,
    error,
    isOwner,
    handleCloseAd,
    handleReactivateAd,
    handleDeleteAd,
    refreshProduct
  } = useProductDetail();

  const [editingAd, setEditingAd] = useState<ProductSubmission | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Track analytics when product loads
  useEffect(() => {
    if (product && !isOwner && user) {
      // Track view for analytics
      const packageData = product.package as any;
      const packageId = packageData?.id;
      
      adAnalyticsService.trackView(
        product.id,
        product.user_id || '',
        packageId
      ).catch(error => {
        console.error('Error tracking view:', error);
      });
    }
  }, [product, isOwner, user]);

  const handleDeleteAdWithNavigation = async () => {
    const success = await handleDeleteAd();
    if (success) {
      navigate('/my-ads');
    }
  };

  const handleEditSave = async (updates: Partial<ProductSubmission>) => {
    if (!editingAd) return;
    
    try {
      setEditSubmitting(true);
      await productService.editProductSubmission(editingAd.id, updates);
      toast({
        title: "Success",
        description: "Changes saved and ad sent for review.",
      });
      setEditingAd(null);
      await refreshProduct();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return <ProductDetailLoading />;
  }

  if (error || !product) {
    return <ProductDetailError error={error || "Product not found"} />;
  }

  // Show edit form if editing
  if (editingAd) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="animate-fade-in">
          <EditProductForm
            product={editingAd}
            onSave={handleEditSave}
            onCancel={() => setEditingAd(null)}
            isSubmitting={editSubmitting}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <ProductDetailHeader product={product} isOwner={isOwner} />
      
      <ProductDetailContent
        product={product}
        vendorName={vendorName}
        vendorId={vendorId}
        isOwner={isOwner}
        onEdit={() => setEditingAd(product)}
        onClose={handleCloseAd}
        onReactivate={handleReactivateAd}
        onDelete={handleDeleteAdWithNavigation}
      />
    </Layout>
  );
};

export default ProductDetail;
