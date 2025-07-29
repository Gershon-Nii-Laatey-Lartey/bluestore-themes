import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ShareModal } from "@/components/ShareModal";
import { EditProductForm } from "@/components/EditProductForm";
import { ProductGrid } from "@/components/ProductGrid";
import { ExpiryDate } from "@/components/product/ExpiryDate";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Share, Edit, Trash2, Archive, AlertTriangle, RotateCcw, Lightbulb, TrendingUp, Zap, MoreVertical, Star, Plus } from "lucide-react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyAds = () => {
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [viewingAd, setViewingAd] = useState<ProductSubmission | null>(null);
  const [editingAd, setEditingAd] = useState<ProductSubmission | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAdForShare, setSelectedAdForShare] = useState<ProductSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadMyProducts();
    }
  }, [user]);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const userProducts = await productService.getProductSubmissions();
      setProducts(userProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAd = async (productId: string) => {
    try {
      await productService.updateProductSubmission(productId, { status: 'closed' });
      toast({
        title: "Success",
        description: "Ad has been closed successfully",
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error closing ad:', error);
      toast({
        title: "Error",
        description: "Failed to close ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleReactivateAd = async (productId: string) => {
    try {
      await productService.reactivateProductSubmission(productId);
      toast({
        title: "Success",
        description: "Ad has been reactivated successfully",
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error reactivating ad:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAd = async (productId: string) => {
    try {
      await productService.deleteProductSubmission(productId);
      toast({
        title: "Success",
        description: "Ad has been deleted successfully",
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Error",
        description: "Failed to delete ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleBoostAd = async (productId: string, boostLevel: 'boost' | '2x_boost') => {
    try {
      await productService.boostProductSubmission(productId, boostLevel);
      toast({
        title: "Success",
        description: `Ad has been ${boostLevel === 'boost' ? 'boosted' : '2x boosted'} successfully`,
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error boosting ad:', error);
      toast({
        title: "Error",
        description: "Failed to boost ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleEditSave = async (updates: Partial<ProductSubmission>) => {
    if (!editingAd) return;
    
    try {
      setEditSubmitting(true);
      await productService.updateProductSubmission(editingAd.id, updates);
      toast({
        title: "Success",
        description: "Ad has been updated successfully",
      });
      setEditingAd(null);
      loadMyProducts();
    } catch (error) {
      console.error('Error updating ad:', error);
      toast({
        title: "Error",
        description: "Failed to update ad. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleShare = (product: ProductSubmission) => {
    setSelectedAdForShare(product);
    setShareModalOpen(true);
  };

  const handleEditProduct = (product: ProductSubmission) => {
    setEditingAd(product);
  };

  const getBoostStatus = (product: ProductSubmission) => {
    if (product.boost_level === '2x_boost') {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
          <Zap className="h-3 w-3 mr-1" />
          2x Boost
        </Badge>
      );
    } else if (product.boost_level === 'boost') {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          Boosted
        </Badge>
      );
    }
    return null;
  };

  const MobileSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DesktopSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="animate-fade-in">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Ads</h1>
              <p className="text-gray-600 mt-1">Manage your product listings</p>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              isMobile ? <MobileSkeleton key={index} /> : <DesktopSkeleton key={index} />
            ))}
          </div>
        </div>
      </Layout>
    );
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
      
      <div className="animate-fade-in">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Ads</h1>
            <p className="text-gray-600 mt-1">Manage your product listings</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        </div>
        
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads yet</h3>
                <p className="text-gray-600 mb-4">You haven't published any ads yet. Start by creating your first listing to reach potential buyers!</p>
                <Button onClick={() => navigate("/publish-ad")} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ProductGrid 
                products={products} 
                loading={loading}
                showEditButtons={true}
                onEdit={handleEditProduct}
              />
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    {isMobile ? (
                      // Mobile Layout - Rectangular cards with dropdown menu
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`text-2xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                📱
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                                  {product.title}
                                  {product.edited && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                      Edited
                                    </Badge>
                                  )}
                                  {getBoostStatus(product)}
                                </h3>
                                <p className="text-sm text-gray-500 capitalize">{product.category} • {product.condition}</p>
                                <p className="text-lg font-semibold text-green-600 mt-1">GHS {product.price}</p>
                                {product.negotiable && (
                                  <span className="text-xs text-gray-500">(Negotiable)</span>
                                )}
                              </div>
                              
                              {/* Status Badge and Actions Menu */}
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(product.status)}>
                                  {product.status}
                                </Badge>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48" align="end">
                                    <div className="space-y-1">
                                      <Link to={`/product/${product.id}`}>
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </Button>
                                      </Link>

                                      {(product.status === 'approved' || product.status === 'closed') && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => handleShare(product)}
                                        >
                                          <Share className="h-4 w-4 mr-2" />
                                          Share
                                        </Button>
                                      )}

                                      {(product.status === 'approved' || product.status === 'pending' || product.status === 'rejected') && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => setEditingAd(product)}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </Button>
                                      )}

                                      {product.status === 'approved' && (
                                        <>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start text-orange-600"
                                            onClick={() => handleBoostAd(product.id, 'boost')}
                                          >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Boost
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start text-purple-600"
                                            onClick={() => handleBoostAd(product.id, '2x_boost')}
                                          >
                                            <Zap className="h-4 w-4 mr-2" />
                                            2x Boost
                                          </Button>
                                        </>
                                      )}

                                      {product.status === 'approved' && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                              <Archive className="h-4 w-4 mr-2" />
                                              Close
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Close this ad?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will remove the ad from public view but keep it in your ads list. You can reactivate it later.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleCloseAd(product.id)}>
                                                Close Ad
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}

                                      {product.status === 'closed' && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-start text-green-600">
                                              <RotateCcw className="h-4 w-4 mr-2" />
                                              Reactivate
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Reactivate this ad?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will make your ad visible to the public again and mark it as approved.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleReactivateAd(product.id)}>
                                                Reactivate Ad
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}

                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="w-full justify-start text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2">
                                              <AlertTriangle className="h-5 w-5 text-red-500" />
                                              Delete this ad permanently?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently delete your ad and remove all associated data.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => handleDeleteAd(product.id)}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Delete Permanently
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            
                            {/* Additional Info */}
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                              <p><strong>Location:</strong> {product.location}</p>
                              <p><strong>Listed:</strong> {formatDate(product.submittedAt)}</p>
                              <ExpiryDate product={product} />
                            </div>
                            
                            {/* Show rejection reason if present */}
                            {product.status === 'rejected' && product.rejection_reason && (
                              <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                                <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                                <p className="text-xs text-red-700">{product.rejection_reason}</p>
                              </div>
                            )}
                            
                            {/* Show suggestions if present */}
                            {product.suggestions && (
                              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                                <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Admin Suggestions:
                                </p>
                                <p className="text-xs text-yellow-700">{product.suggestions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    ) : (
                      // Desktop Layout - Original design
                      <>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {product.title}
                                {product.edited && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                                    Edited
                                  </Badge>
                                )}
                                {getBoostStatus(product)}
                              </CardTitle>
                              <p className="text-gray-600 capitalize">{product.category} • {product.condition}</p>
                            </div>
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-4">
                            {/* Product Image */}
                            <div className="md:col-span-1">
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`text-4xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                  📱
                                </div>
                              </div>
                            </div>
                            
                            {/* Product Details */}
                            <div className="md:col-span-2 space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">{product.description.substring(0, 100)}...</p>
                                <p className="text-lg font-semibold text-green-600">GHS {product.price}</p>
                                {product.negotiable && (
                                  <span className="text-sm text-gray-500">(Negotiable)</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-2">
                                <p><strong>Location:</strong> {product.location}</p>
                                <p><strong>Listed:</strong> {formatDate(product.submittedAt)}</p>
                                <ExpiryDate product={product} />
                              </div>
                              
                              {/* Show rejection reason if present */}
                              {product.status === 'rejected' && product.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                                  <p className="text-sm text-red-700">{product.rejection_reason}</p>
                                </div>
                              )}
                              
                              {/* Show suggestions if present */}
                              {product.suggestions && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    Admin Suggestions:
                                  </p>
                                  <p className="text-sm text-yellow-700">{product.suggestions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Link to={`/product/${product.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>

                            {(product.status === 'approved' || product.status === 'closed') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShare(product)}
                              >
                                <Share className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            )}

                            {/* Edit button for all editable statuses */}
                            {(product.status === 'approved' || product.status === 'pending' || product.status === 'rejected') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingAd(product)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}

                            {/* Boost buttons - Only for approved ads */}
                            {product.status === 'approved' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleBoostAd(product.id, 'boost')}
                                  className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                                >
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  Boost
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleBoostAd(product.id, '2x_boost')}
                                  className="text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  2x Boost
                                </Button>
                              </>
                            )}

                            {product.status === 'approved' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Archive className="h-4 w-4 mr-1" />
                                    Close
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Close this ad?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove the ad from public view but keep it in your ads list. You can reactivate it later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCloseAd(product.id)}>
                                      Close Ad
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {product.status === 'closed' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reactivate this ad?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will make your ad visible to the public again and mark it as approved.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReactivateAd(product.id)}>
                                      Reactivate Ad
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Delete this ad permanently?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your ad and remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteAd(product.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Share Modal */}
        {selectedAdForShare && (
          <ShareModal 
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false);
              setSelectedAdForShare(null);
            }}
            productTitle={selectedAdForShare.title}
            productUrl={`${window.location.origin}/product/${selectedAdForShare.id}`}
          />
        )}
      </div>
    </Layout>
  );
};

export default MyAds;
