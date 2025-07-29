
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, Package, Shield, Edit, MessageCircle, Calendar } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { dataService, VendorProfile as VendorProfileType } from "@/services/dataService";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { paymentService } from "@/services/paymentService";

const VendorProfile = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor-profile', vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error('Vendor ID is required');
      
      console.log('Fetching vendor profile for ID:', vendorId);
      
      // Debug: Let's see what vendor profiles exist in the database
      const { data: allVendors, error: debugError } = await supabase
        .from('vendor_profiles')
        .select('id, user_id, business_name')
        .limit(5);
      
      if (!debugError) {
        console.log('Available vendor profiles:', allVendors);
      }
      
      // Try multiple approaches to find the vendor profile
      let vendorData = null;
      let vendorError = null;

      // First try: Look for vendor profile by ID (vendor profile UUID)
      try {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('id', vendorId)
          .single();
        
        if (data && !error) {
          vendorData = data;
          console.log('Found vendor profile by ID:', vendorData);
        }
      } catch (error) {
        console.log('Vendor profile not found by ID, trying user_id...');
      }

      // Second try: Look for vendor profile by user_id (if vendorId is actually a user ID)
      if (!vendorData) {
        try {
          const { data, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', vendorId)
            .single();
          
          if (data && !error) {
            vendorData = data;
            console.log('Found vendor profile by user_id:', vendorData);
          }
        } catch (error) {
          console.log('Vendor profile not found by user_id either');
        }
      }

      // If still no vendor data found, throw an error
      if (!vendorData) {
        vendorError = {
          code: 'PGRST116',
          message: 'Vendor profile not found by ID or user_id',
          details: 'The result contains 0 rows'
        };
        throw vendorError;
      }

      // Then get the associated user profile separately
      let userProfile = null;
      if (vendorData?.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', vendorData.user_id)
          .single();

        if (!profileError) {
          userProfile = profileData;
        }
      }
      
      console.log('Vendor profile data:', vendorData);
      console.log('User profile data:', userProfile);
      
      return {
        ...vendorData,
        profiles: userProfile
      };
    },
    enabled: !!vendorId
  });

  const { data: vendorProducts } = useQuery({
    queryKey: ['vendor-products', vendor?.user_id],
    queryFn: async () => {
      if (!vendor?.user_id) return [];
      
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('user_id', vendor.user_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!vendor?.user_id
  });

  // Check if this is the current user's own profile
  const isOwnProfile = vendor?.user_id === user?.id;

  // Get user's active package if it's their own profile
  const { data: userActivePackage } = useQuery({
    queryKey: ['user-active-package', user?.id],
    queryFn: async () => {
      if (!user?.id || !isOwnProfile) return null;
      
      try {
        return await paymentService.getUserActivePackage(user.id);
      } catch (error) {
        console.error('Error loading active package:', error);
        return null;
      }
    },
    enabled: !!user?.id && isOwnProfile
  });

  // Helper functions
  const getVerificationBadge = () => {
    if (!vendor) return null;
    
    if (vendor.verification_status === 'verified') {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    } else if (vendor.verification_status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>;
    }
  };

  const getProfileImageUrl = () => {
    if (vendor?.profile_image) {
      return vendor.profile_image;
    }
    return null;
  };

  const getActivePackageInfo = () => {
    if (!userActivePackage) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <Package className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">
          {userActivePackage.package_name} Package
        </span>
      </div>
    );
  };

  // SEO data for vendor profile
  const vendorName = vendor?.business_name || vendor?.profiles?.full_name || 'Vendor';
  const vendorTitle = `${vendorName} | BlueStore | Vendor`;
  const vendorDescription = `Visit ${vendorName}'s store on BlueStore Ghana. Browse their products and contact them directly. Trusted vendor with quality products.`;
  const vendorKeywords = `${vendorName} Ghana, ${vendorName} BlueStore, vendor Ghana, online store Ghana, ${vendorName} products`;

  // Structured data for vendor profile
  const vendorStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": vendorName,
    "description": vendorDescription,
    "url": `https://bluestoregh.web.app/vendor/${vendorId}`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": vendor?.phone || "",
      "email": vendor?.email || vendor?.profiles?.email || "",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GH",
      "addressRegion": vendor?.location || "Ghana"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${vendorName}'s Products`,
      "itemListElement": vendorProducts?.map((product, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": product.title,
          "description": product.description,
          "image": product.images?.[0] || ""
        },
        "price": product.price,
        "priceCurrency": "GHS"
      })) || []
    }
  };

  const VendorSkeleton = () => (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="text-center">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
          
          {/* Profile Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );

  if (isLoading) {
    return <VendorSkeleton />;
  }

  if (error || !vendor) {
    // For error cases, we can't determine if it's the user's own profile without vendor data
    // So we'll show the create profile option for any authenticated user
    const isOwnProfile = !!user?.id;
    
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
            <p className="text-gray-600">The vendor you're looking for doesn't exist or has been removed.</p>
            {isOwnProfile && (
              <div className="mt-4">
                <Button onClick={() => navigate('/create-vendor-profile')} className="bg-blue-600 hover:bg-blue-700">
                  Create Vendor Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEOHead
        title={vendorTitle}
        description={vendorDescription}
        keywords={vendorKeywords}
        url={`https://bluestoregh.web.app/vendor/${vendorId}`}
        structuredData={vendorStructuredData}
      />
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-20 w-20 mr-4">
                  <AvatarImage src={getProfileImageUrl() || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {vendor.business_name?.charAt(0) || vendor.profiles?.full_name?.charAt(0) || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.business_name || vendor.profiles?.full_name}</h1>
                  <p className="text-gray-600 mb-2">{vendor.profiles?.full_name && vendor.business_name ? `${vendor.profiles.full_name} • ` : ''}BlueStore Vendor</p>
                  <div className="flex items-center space-x-2">
                    {getVerificationBadge()}
                    {isOwnProfile && getActivePackageInfo()}
                  </div>
                </div>
              </div>
              
              {/* Action buttons for own profile */}
              {isOwnProfile && (
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button 
                    onClick={() => navigate('/edit-vendor-profile')} 
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/my-ads')} 
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>My Ads</span>
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Package className="h-3 w-3" />
                  <span>{vendorProducts?.length || 0} Products</span>
                </Badge>
                {vendor.verified && (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {(vendor.business_name || vendor.profiles?.full_name || 'V').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{vendor.business_name || vendor.profiles?.full_name}</h2>
                    <p className="text-sm text-gray-500">Vendor Profile</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{vendor.location || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Contact</p>
                        <p className="text-gray-600">{vendor.phone || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">{vendor.profiles?.email || vendor.email || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Verification</p>
                        <Badge variant={vendor.verified ? "default" : "secondary"}>
                          {vendor.verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {vendor.description && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-gray-600">{vendor.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Products Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Products by this Vendor</h2>
              {vendorProducts && vendorProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vendorProducts.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">📱</span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">
                          {product.title}
                        </h4>
                        <p className="text-lg font-bold text-blue-600 mb-2">
                          GHS {product.price}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {product.category} • {product.condition}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No products available from this vendor yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default VendorProfile;
