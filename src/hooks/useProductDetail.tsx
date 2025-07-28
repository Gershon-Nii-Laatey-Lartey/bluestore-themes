import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { productService } from "@/services/productService";
import { vendorService } from "@/services/vendorService";
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { VendorProfile } from "@/types/vendor";

export const useProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductSubmission | null>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [vendorName, setVendorName] = useState<string>("");
  const [vendorId, setVendorId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) {
        setError("Product ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const foundProduct = await productService.getProductById(id);
        
        if (!foundProduct) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        const isOwner = user && foundProduct.user_id === user.id;

        if (foundProduct.status !== 'approved' && !isOwner) {
          setError("Product not available");
          setLoading(false);
          return;
        }

        setProduct(foundProduct);

        // Get vendor/seller information
        if (foundProduct.user_id) {
          try {
            // First try to get vendor profile using user_id
            const { data: vendorProfile, error: vendorError } = await supabase
              .from('vendor_profiles')
              .select('*')
              .eq('user_id', foundProduct.user_id)
              .single();

            if (vendorProfile && !vendorError) {
              // Transform database response to VendorProfile interface
              const transformedVendor: VendorProfile = {
                id: vendorProfile.id,
                businessName: vendorProfile.business_name,
                description: vendorProfile.description || '',
                location: vendorProfile.location || '',
                phone: vendorProfile.phone || '',
                email: vendorProfile.email || '',
                categories: vendorProfile.categories || [],
                shippingPolicy: vendorProfile.shipping_policy || '',
                returnPolicy: vendorProfile.return_policy || '',
                warrantyInfo: vendorProfile.warranty_info || '',
                createdAt: vendorProfile.created_at,
                verified: vendorProfile.verified || false,
                totalProducts: 0, // This would need to be calculated
                user_id: vendorProfile.user_id
              };
              
              setVendor(transformedVendor);
              setVendorName(vendorProfile.business_name);
              setVendorId(vendorProfile.id); // Use the vendor profile ID for linking
              console.log('Vendor profile found:', {
                vendorId: vendorProfile.id,
                businessName: vendorProfile.business_name,
                userId: vendorProfile.user_id
              });
            } else {
              console.log('No vendor profile found, falling back to user profile');
              // Fallback to user profile
              const { data: userProfile, error: userError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', foundProduct.user_id)
                .single();

              if (userProfile && !userError) {
                setVendorName(userProfile.full_name || 'Anonymous Seller');
              } else {
                setVendorName('Anonymous Seller');
              }
              // Don't set vendorId if there's no vendor profile
              setVendorId(undefined);
            }
          } catch (error) {
            console.log("Error fetching seller info:", error);
            setVendorName('Anonymous Seller');
            setVendorId(undefined);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, user]);

  const refreshProduct = async () => {
    if (!product) return;
    try {
      const updatedProduct = await productService.getProductById(product.id);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    } catch (error) {
      console.error("Error refreshing product:", error);
    }
  };

  const handleCloseAd = async () => {
    if (!product) return;
    try {
      await productService.updateProductSubmission(product.id, { status: 'closed' });
      toast({
        title: "Success",
        description: "Ad has been closed successfully",
      });
      await refreshProduct();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close ad",
        variant: "destructive"
      });
    }
  };

  const handleReactivateAd = async () => {
    if (!product) return;
    try {
      await productService.reactivateProductSubmission(product.id);
      toast({
        title: "Success",
        description: "Ad has been reactivated successfully",
      });
      await refreshProduct();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reactivate ad",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAd = async () => {
    if (!product) return;
    try {
      await productService.deleteProductSubmission(product.id);
      toast({
        title: "Success",
        description: "Ad has been deleted successfully",
      });
      return true; // Signal successful deletion
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive"
      });
      return false;
    }
  };

  const isOwner = user && product && product.user_id === user.id;

  return {
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
  };
};
