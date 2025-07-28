
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, Clock, Gift, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import { AdPackage } from "@/types/adPackage";

interface PaymentCheckoutProps {
  selectedPackage: AdPackage;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentCheckout = ({ selectedPackage, onSuccess, onCancel }: PaymentCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFreePackage = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate a brief processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Free Package Selected!",
        description: "You can now publish your ad with the free package.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing free package:', error);
      toast({
        title: "Error",
        description: "Failed to process free package selection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        email: user.email,
        amount: selectedPackage.price,
        currency: 'GHS',
        metadata: {
          plan_id: selectedPackage.id,
          plan_name: selectedPackage.name,
          user_id: user.id,
        },
        callback_url: `${window.location.origin}/publish-ad?payment=success`,
      };

      const response = await paymentService.initializePayment(paymentData);

      if (response.status && response.data?.authorization_url) {
        // Show success message before redirect
        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to complete your payment securely.",
        });
        
        // Small delay to show the toast before redirect
        setTimeout(() => {
          window.location.href = response.data.authorization_url;
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      
      let errorMessage = "Failed to initialize payment. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('authentication')) {
          errorMessage = "Authentication error. Please log in and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isFreePackage = selectedPackage.price === 0;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <selectedPackage.icon className="h-6 w-6 text-blue-600" />
          {selectedPackage.name}
          {isFreePackage && <Gift className="h-4 w-4 text-green-600" />}
        </CardTitle>
        <div className="text-3xl font-bold text-gray-900">
          {isFreePackage ? (
            <span className="text-green-600">FREE</span>
          ) : (
            formatPrice(selectedPackage.price)
          )}
        </div>
        <p className="text-sm text-gray-600">{selectedPackage.duration}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className={`${isFreePackage ? 'bg-green-50' : 'bg-blue-50'} rounded-lg p-4`}>
          <h4 className={`font-semibold ${isFreePackage ? 'text-green-900' : 'text-blue-900'} mb-2`}>
            Package Features:
          </h4>
          <ul className="space-y-1">
            {selectedPackage.features.map((feature, index) => (
              <li key={index} className={`text-sm ${isFreePackage ? 'text-green-800' : 'text-blue-800'} flex items-center`}>
                <div className={`w-1 h-1 ${isFreePackage ? 'bg-green-600' : 'bg-blue-600'} rounded-full mr-2`} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {!isFreePackage && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2" />
              Secure payment powered by Paystack
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Supports cards, mobile money & bank transfer
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              Instant activation upon payment
            </div>
          </div>
        )}

        {isFreePackage && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              No payment required
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              Instant activation
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="h-4 w-4 mr-2 text-green-600" />
              Perfect for testing the platform
            </div>
          </div>
        )}

        <div className="pt-4 space-y-2">
          <Button 
            onClick={isFreePackage ? handleFreePackage : handlePayment}
            disabled={isProcessing}
            className={`w-full ${isFreePackage ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isFreePackage ? 'Processing...' : 'Processing...'}
              </>
            ) : (
              <>
                {isFreePackage ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Select Free Package
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {formatPrice(selectedPackage.price)}
                  </>
                )}
              </>
            )}
          </Button>

          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  );
};
