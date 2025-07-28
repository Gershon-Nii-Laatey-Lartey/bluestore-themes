
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Calendar, Package, MessageCircle, Edit, Shield, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dataService, VendorProfile, KYCSubmission } from "@/services/dataService";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { StorefrontManager } from "@/components/vendor/StorefrontManager";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";

const MyVendorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCSubmission | null>(null);
  const [vendorProducts, setVendorProducts] = useState<ProductSubmission[]>([]);
  const [userActivePackage, setUserActivePackage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await dataService.getVendorProfile();
      const kyc = await dataService.getKYCSubmission();
      
      setVendorProfile(profile);
      setKycStatus(kyc);

      // Load user's active package
      if (user) {
        try {
          const activePackage = await paymentService.getUserActivePackage(user.id);
          setUserActivePackage(activePackage);
        } catch (error) {
          console.error('Error loading active package:', error);
        }
      }

      // Load vendor's products if profile exists
      if (profile?.user_id) {
        const allProducts = await productService.getProductSubmissions();
        const userProducts = allProducts.filter(product => 
          product.user_id === profile.user_id && product.status === 'approved'
        );
        setVendorProducts(userProducts);
      }
    } catch (error) {
      console.error('Failed to load vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading vendor profile...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!vendorProfile) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="animate-fade-in max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Vendor Profile</h2>
              <p className="text-gray-600 mb-4">You haven't created a vendor profile yet. Create one to start selling your products.</p>
              <Button onClick={() => navigate('/create-vendor-profile')} className="bg-blue-600 hover:bg-blue-700">
                Create Vendor Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getVerificationBadge = () => {
    if (kycStatus?.status === 'approved' || vendorProfile.verified) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    if (kycStatus?.status === 'pending') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Verification Pending
        </Badge>
      );
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/kyc')}
        className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
      >
        <Shield className="h-3 w-3 mr-1" />
        Verify Account
      </Button>
    );
  };

  // Helper function to safely get profile image URL
  const getProfileImageUrl = () => {
    return "/placeholder.svg";
  };

  // Check if any store policies exist
  const hasStorePolicies = vendorProfile.shipping_policy || vendorProfile.return_policy || vendorProfile.warranty_info;

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Business information and products</p>
        </div>
        
        {/* Vendor Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={getProfileImageUrl()} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {vendorProfile.business_name?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{vendorProfile.business_name}</h2>
                  {getVerificationBadge()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{vendorProfile.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Joined {new Date(vendorProfile.created_at).toLocaleDateString()}</span>
                  </div>
                  {showContact && (
                    <>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{vendorProfile.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{vendorProfile.phone}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowContact(!showContact)}
                >
                  {showContact ? (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      {vendorProfile.phone}
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Vendor
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storefront Manager */}
        {userActivePackage && (
          <div className="mb-6">
            <StorefrontManager 
              vendorProfile={vendorProfile}
              userActivePackage={userActivePackage}
              onStorefrontEnabled={loadData}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{vendorProducts.length}</div>
              <div className="text-sm text-gray-500">Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{vendorProfile.categories?.length || 0}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* About & Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{vendorProfile.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendorProfile.categories?.map((category: string) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Products */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Our Products ({vendorProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No products listed yet.</p>
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/publish-ad')}
                >
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vendorProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-3xl mb-3 group-hover:bg-gray-200 transition-colors">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-3xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                            📱
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            GHS {parseFloat(product.price.toString()).toFixed(2)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        {product.originalPrice && parseFloat(product.originalPrice.toString()) > parseFloat(product.price.toString()) && (
                          <span className="text-sm text-gray-500 line-through">
                            GHS {parseFloat(product.originalPrice.toString()).toFixed(2)}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policies - Only show if policies exist */}
        {hasStorePolicies && (
          <Card>
            <CardHeader>
              <CardTitle>Store Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendorProfile.shipping_policy && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Shipping Policy
                  </h4>
                  <p className="text-gray-600 text-sm">{vendorProfile.shipping_policy}</p>
                </div>
              )}
              
              {vendorProfile.return_policy && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Return Policy</h4>
                  <p className="text-gray-600 text-sm">{vendorProfile.return_policy}</p>
                </div>
              )}
              
              {vendorProfile.warranty_info && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Warranty Information</h4>
                  <p className="text-gray-600 text-sm">{vendorProfile.warranty_info}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MyVendorProfile;
