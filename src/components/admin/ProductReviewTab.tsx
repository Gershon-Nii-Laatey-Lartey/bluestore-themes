
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, TrendingUp, CheckCircle, XCircle, Eye, Calendar, Lightbulb, Filter, Star, Shield } from "lucide-react";
import { ProductSubmission } from "@/services/dataService";
import { DocumentImage } from "./DocumentImage";
import { ProductDetailModal } from "./ProductDetailModal";
import { ProductSuggestionModal } from "./ProductSuggestionModal";
import { useState } from "react";

interface ProductReviewTabProps {
  pendingSubmissions: ProductSubmission[];
  approvedProducts: ProductSubmission[];
  rejectedProducts: ProductSubmission[];
  totalSubmissions: number;
  onApproval: (submissionId: string, approved: boolean, rejectionReason?: string, suggestions?: string) => void;
}

export const ProductReviewTab = ({ 
  pendingSubmissions, 
  approvedProducts, 
  rejectedProducts, 
  totalSubmissions,
  onApproval 
}: ProductReviewTabProps) => {
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedProductForSuggestion, setSelectedProductForSuggestion] = useState<ProductSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'package'>('none');

  const handleSuggestionSubmit = async (suggestion: string) => {
    if (!selectedProductForSuggestion) return;
    
    setIsSubmitting(true);
    await onApproval(selectedProductForSuggestion.id, true, undefined, suggestion);
    setIsSubmitting(false);
    setSuggestionModalOpen(false);
    setSelectedProductForSuggestion(null);
  };

  const handleSkipSuggestion = async () => {
    if (!selectedProductForSuggestion) return;
    
    setIsSubmitting(true);
    await onApproval(selectedProductForSuggestion.id, true);
    setIsSubmitting(false);
    setSuggestionModalOpen(false);
    setSelectedProductForSuggestion(null);
  };

  const handleSuggestAndApprove = (product: ProductSubmission) => {
    setSelectedProductForSuggestion(product);
    setSuggestionModalOpen(true);
  };

  const getPackageIcon = (packageId?: string) => {
    switch (packageId) {
      case 'pro':
      case 'business':
      case 'premium':
        return Shield;
      default:
        return Star;
    }
  };

  const getPackageColor = (packageId?: string) => {
    switch (packageId) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'starter':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rising':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'business':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'premium':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const groupedSubmissions = groupBy === 'package' 
    ? pendingSubmissions.reduce((groups, submission) => {
        const packageId = submission.package?.id || 'no-package';
        if (!groups[packageId]) {
          groups[packageId] = [];
        }
        groups[packageId].push(submission);
        return groups;
      }, {} as Record<string, ProductSubmission[]>)
    : { 'all': pendingSubmissions };

  const renderProductCard = (submission: ProductSubmission) => {
    const packageInfo = submission.package;
    const PackageIcon = getPackageIcon(packageInfo?.id);

    return (
      <div key={submission.id} className="border rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
            {submission.images && submission.images.length > 0 ? (
              <DocumentImage 
                src={submission.images[0]} 
                alt={submission.title} 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <div className="text-2xl">📱</div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{submission.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="capitalize font-medium">{submission.category}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="capitalize">{submission.condition}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending Review
                  </Badge>
                  {packageInfo && (
                    <Badge variant="outline" className={`flex items-center gap-1 ${getPackageColor(packageInfo.id)}`}>
                      <PackageIcon className="h-3 w-3" />
                      {packageInfo.name} - GHS {packageInfo.price}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">GHS {submission.price}</p>
                {submission.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">GHS {submission.originalPrice}</p>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed line-clamp-2">{submission.description}</p>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> {submission.location}
                {submission.negotiable && (
                  <Badge variant="outline" className="ml-3">Negotiable</Badge>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <ProductDetailModal product={submission} onApproval={onApproval} />
                </Dialog>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => onApproval(submission.id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quick Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => handleSuggestAndApprove(submission)}
                  disabled={isSubmitting}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggest & Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Product Approval Progress */}
      {totalSubmissions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Product Approval Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Products Processed</span>
                <span>{approvedProducts.length + rejectedProducts.length} of {totalSubmissions}</span>
              </div>
              <Progress 
                value={(approvedProducts.length + rejectedProducts.length) / totalSubmissions * 100} 
                className="h-2" 
              />
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{approvedProducts.length} Approved</span>
                <span className="text-red-600">{rejectedProducts.length} Rejected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingSubmissions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Pending Product Approvals</span>
                <Badge variant="secondary">{pendingSubmissions.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={groupBy} onValueChange={(value: 'none' | 'package') => setGroupBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    <SelectItem value="package">Group by package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedSubmissions).map(([groupKey, submissions]) => (
                <div key={groupKey}>
                  {groupBy === 'package' && groupKey !== 'all' && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`${getPackageColor(groupKey === 'no-package' ? undefined : groupKey)} text-sm font-medium`}>
                          {groupKey === 'no-package' ? 'No Package Selected' : submissions[0]?.package?.name || groupKey}
                        </Badge>
                        <span className="text-sm text-gray-500">({submissions.length} products)</span>
                      </div>
                      <Separator className="mb-4" />
                    </div>
                  )}
                  
                  {submissions.map((submission, index) => (
                    <div key={submission.id}>
                      {renderProductCard(submission)}
                      {index < submissions.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                  
                  {Object.keys(groupedSubmissions).length > 1 && groupKey !== Object.keys(groupedSubmissions)[Object.keys(groupedSubmissions).length - 1] && (
                    <Separator className="my-8 border-dashed" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Product Reviews</h3>
              <p className="text-gray-600">All product submissions have been processed.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestion Modal */}
      <Dialog open={suggestionModalOpen} onOpenChange={setSuggestionModalOpen}>
        {selectedProductForSuggestion && (
          <ProductSuggestionModal
            productTitle={selectedProductForSuggestion.title}
            onSuggestion={handleSuggestionSubmit}
            onSkip={handleSkipSuggestion}
            onCancel={() => {
              setSuggestionModalOpen(false);
              setSelectedProductForSuggestion(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Dialog>
    </div>
  );
};
