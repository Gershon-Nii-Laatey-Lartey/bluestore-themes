import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { promoCodeService, PromoCodeValidation } from "@/services/promoCodeService";

interface PromoCodeFieldProps {
  originalAmount: number;
  onPromoCodeApplied: (discountAmount: number, finalAmount: number) => void;
  onPromoCodeRemoved: () => void;
}

export const PromoCodeField = ({ 
  originalAmount, 
  onPromoCodeApplied, 
  onPromoCodeRemoved 
}: PromoCodeFieldProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<PromoCodeValidation | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim() || !user) return;

    setIsValidating(true);
    try {
      const result = await promoCodeService.validatePromoCode(promoCode.trim(), user.id);
      setValidation(result);

      if (result.is_valid) {
        // Apply the promo code
        const application = await promoCodeService.applyPromoCode(
          promoCode.trim(), 
          user.id, 
          originalAmount
        );

        if (application.success) {
          setAppliedPromoCode(promoCode.trim());
          onPromoCodeApplied(application.discount_amount, application.final_amount);
          toast({
            title: "Promo Code Applied!",
            description: `Discount: GHS ${application.discount_amount.toFixed(2)}`,
          });
        } else {
          toast({
            title: "Error",
            description: application.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid Promo Code",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to validate promo code",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setValidation(null);
    setAppliedPromoCode(null);
    onPromoCodeRemoved();
    toast({
      title: "Promo Code Removed",
      description: "Original price restored",
    });
  };

  const getDiscountDisplay = () => {
    if (!validation?.is_valid) return null;

    switch (validation.discount_type) {
      case 'percentage':
        return `${validation.discount_value}% off`;
      case 'fixed':
        return `GHS ${validation.discount_value} off`;
      case 'free':
        return '100% off';
      default:
        return 'Discount applied';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-gray-500" />
        <Label htmlFor="promo-code" className="text-sm font-medium">
          Promo Code
        </Label>
      </div>

      {appliedPromoCode ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {appliedPromoCode}
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {getDiscountDisplay()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePromoCode}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            id="promo-code"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleValidatePromoCode()}
            className="flex-1"
            disabled={isValidating}
          />
          <Button
            onClick={handleValidatePromoCode}
            disabled={!promoCode.trim() || isValidating}
            size="sm"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      )}

      {validation && !validation.is_valid && !appliedPromoCode && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <XCircle className="h-4 w-4" />
          {validation.message}
        </div>
      )}
    </div>
  );
}; 