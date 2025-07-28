
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Phone, Mail, Star, Shield } from "lucide-react";
import { storefrontService } from "@/services/storefrontService";
import { productService } from "@/services/productService";
import { ProductImages } from "@/components/product/ProductImages";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { adAnalyticsService } from "@/services/adAnalyticsService";

const StorefrontProductDetail = () => {
  const { storefrontUrl, productId } = useParams<{ 
    storefrontUrl: string; 
    productId: string; 
  }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: storefront, isLoading: storefrontLoading } = useQuery({
    queryKey: ['storefront', storefrontUrl],
    queryFn: () => storefrontService.getStorefrontByUrl(storefrontUrl!),
    enabled: !!storefrontUrl
  });

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['storefront-product', productId],
    queryFn: () => productService.getProductById(productId!),
    enabled: !!productId
  });

  // Track view when product loads
  useEffect(() => {
    if (product && productId) {
      const packageData = product.package as any;
      const packageId = packageData?.id;
      
      adAnalyticsService.trackView(
        productId,
        product.user_id || '',
        packageId
      ).catch(error => {
        console.error('Error tracking storefront view:', error);
      });
    }
  }, [product, productId]);

  const handleContactClick = () => {
    const isMobile = window.innerWidth < 768;
    
    // Track contact click for analytics
    if (productId) {
      adAnalyticsService.trackClick(productId).catch(error => {
        console.error('Error tracking contact click:', error);
      });
    }
    
    if (isMobile && storefront?.contact_info?.phone) {
      window.location.href = `tel:${storefront.contact_info.phone}`;
    } else {
      // Redirect to storefront chat page for desktop
      window.location.href = `/${storefrontUrl}/chat`;
    }
  };

  const handleBackToStorefront = () => {
    navigate(`/store/${storefrontUrl}`);
  };

  if (storefrontLoading || productLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="animate-pulse">
          <div className="h-20 bg-primary/10"></div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-2/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!storefront || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link to={`/store/${storefrontUrl}`}>Back to Storefront</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleBackToStorefront}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Button>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-sm bg-primary/10 text-primary">
                  {storefront.business_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {storefront.business_name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={handleContactClick}
              className="bg-primary/90 hover:bg-primary shadow-md"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Seller
            </Button>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <ProductImages images={product.images || []} title={product.title} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="capitalize">
                  {product.condition}
                </Badge>
                <Badge variant="secondary">
                  {product.category}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-primary">
                  GHS {parseFloat(product.price?.toString() || '0').toFixed(2)}
                </span>
                {product.originalPrice && parseFloat(product.originalPrice.toString()) > parseFloat(product.price.toString()) && (
                  <span className="text-xl text-muted-foreground line-through">
                    GHS {parseFloat(product.originalPrice.toString()).toFixed(2)}
                  </span>
                )}
              </div>
              {product.negotiable && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Negotiable
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Location:</span>
                <span>{product.location}</span>
              </div>
              {storefront.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{storefront.phone}</span>
                </div>
              )}
              {storefront.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{storefront.email}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleContactClick}
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorefrontProductDetail;
