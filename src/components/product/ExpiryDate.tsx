import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { ProductSubmission } from "@/types/product";

interface ExpiryDateProps {
  product: ProductSubmission;
}

export const ExpiryDate = ({ product }: ExpiryDateProps) => {
  const calculateExpiryDate = (product: ProductSubmission): Date | null => {
    if (product.status === 'expired' || product.status === 'closed' || product.status === 'rejected') {
      return null;
    }

    const createdDate = new Date(product.submittedAt);
    const packageId = product.package?.id;

    // Calculate expiry based on package type
    switch (packageId) {
      case 'free':
        return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'starter':
        return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      case 'standard':
        return new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
      case 'rising':
        return new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
      case 'pro':
        return new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
      case 'business':
        return new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
      case 'premium':
        return null; // Unlimited
      default:
        // Default to free package duration if no package specified
        return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  };

  const getTimeRemaining = (expiryDate: Date): { days: number; hours: number; isExpiringSoon: boolean } => {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return { days: 0, hours: 0, isExpiringSoon: true };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isExpiringSoon = days <= 1;

    return { days, hours, isExpiringSoon };
  };

  const formatExpiryDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const expiryDate = calculateExpiryDate(product);

  // Don't show expiry for non-active ads or unlimited plans
  if (!expiryDate) {
    if (product.package?.id === 'premium') {
      return (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <Calendar className="h-4 w-4" />
          <span>Never expires</span>
        </div>
      );
    }
    return null;
  }

  const timeRemaining = getTimeRemaining(expiryDate);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-gray-600">Expires: {formatExpiryDate(expiryDate)}</span>
      </div>
      
      {product.status === 'approved' && (
        <Badge 
          variant={timeRemaining.isExpiringSoon ? "destructive" : "secondary"}
          className={`flex items-center gap-1 ${
            timeRemaining.isExpiringSoon 
              ? "bg-red-100 text-red-800 border-red-200" 
              : "bg-blue-100 text-blue-800 border-blue-200"
          }`}
        >
          {timeRemaining.isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
          <Clock className="h-3 w-3" />
          {timeRemaining.days > 0 
            ? `${timeRemaining.days}d ${timeRemaining.hours}h left`
            : `${timeRemaining.hours}h left`
          }
        </Badge>
      )}
    </div>
  );
};
