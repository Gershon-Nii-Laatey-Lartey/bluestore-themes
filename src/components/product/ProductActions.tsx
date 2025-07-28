
import { Share2, MessageCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareModal } from "@/components/ShareModal";
import { ReportAdModal } from "@/components/ReportAdModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { adAnalyticsService } from "@/services/adAnalyticsService";

interface ProductActionsProps {
  productId: string;
  sellerId: string;
  productTitle: string;
  isOwner: boolean;
}

export const ProductActions = ({ productId, sellerId, productTitle, isOwner }: ProductActionsProps) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChatWithSeller = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Track message click for analytics
    adAnalyticsService.trackMessage(productId).catch(error => {
      console.error('Error tracking message click:', error);
    });
    
    // Navigate to chat page with seller and product info, but don't create room yet
    navigate(`/chat/${sellerId}?productId=${productId}&createOnMessage=true`);
  };

  const handleShareClick = () => {
    // Track share click for analytics
    adAnalyticsService.trackClick(productId).catch(error => {
      console.error('Error tracking share click:', error);
    });
    
    setShareModalOpen(true);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FavoriteButton productId={productId} />
      
      {!isOwner && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleChatWithSeller}
          className="flex items-center gap-1"
        >
          <MessageCircle className="h-4 w-4" />
          Chat with Seller
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShareClick}
        className="flex items-center gap-1"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      {!isOwner && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReportModalOpen(true)}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      )}

      <ShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        productTitle={productTitle}
        productUrl={window.location.href}
      />
      
      <ReportAdModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        productId={productId}
        productTitle={productTitle}
      />
    </div>
  );
};
