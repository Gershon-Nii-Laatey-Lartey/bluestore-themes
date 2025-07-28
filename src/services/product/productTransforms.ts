
import { ProductSubmission } from "@/types/product";
import { adPackages } from "@/types/adPackage";

export const transformProductData = (dbProduct: any): ProductSubmission => {
  // Find the matching package from our adPackages array to restore the full AdPackage object
  let packageData = null;
  if (dbProduct.package && dbProduct.package.id) {
    packageData = adPackages.find(pkg => pkg.id === dbProduct.package.id) || null;
  }

  return {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    category: dbProduct.category,
    condition: dbProduct.condition,
    price: dbProduct.price?.toString() || '0',
    originalPrice: dbProduct.original_price?.toString(),
    negotiable: dbProduct.negotiable || false,
    phone: dbProduct.phone,
    location: dbProduct.location,
    status: dbProduct.status as 'pending' | 'approved' | 'rejected' | 'closed' | 'processing' | 'expired',
    submittedAt: dbProduct.created_at,
    images: dbProduct.images || [],
    user_id: dbProduct.user_id,
    edited: dbProduct.edited || false,
    previous_price: dbProduct.previous_price?.toString(),
    package: packageData,
    rejection_reason: dbProduct.rejection_reason,
    suggestions: dbProduct.suggestions,
    main_image_index: dbProduct.main_image_index || 0,
    boost_level: dbProduct.boost_level || 'none'
  };
};
