
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { paymentExpirationService } from "@/services/paymentExpirationService";
import { useAuth } from "@/hooks/useAuth";
import { AdPackage } from "@/types/adPackage";

interface InlinePaymentCheckoutProps {
  selectedPackage: AdPackage;
  onSuccess: () => void;
  onCancel: () => void;
  productData?: any;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const InlinePaymentCheckout = ({ 
  selectedPackage, 
  onSuccess, 
  onCancel,
  productData 
}: InlinePaymentCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFreePackage = async () => {
    try {
      setIsProcessing(true);
      
      // For free packages, directly proceed with success
      toast({
        title: "Free Package Selected!",
        description: "You can now publish your ad with the free package.",
      });
      
      onSuccess();
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

  const handleInlinePayment = async () => {
    if (!user?.email || !paystackLoaded) {
      toast({
        title: "Error",
        description: "Payment system not ready. Please try again.",
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
          product_data: productData
        }
      };

      const response = await paymentService.initializePayment(paymentData);

      if (response.status && response.data) {
        const handler = window.PaystackPop.setup({
          key: response.data.public_key || 'pk_test_0d4e4b6c6b82e5e72cfe9cf92d6f5e6c5f7a2c3d', // fallback for testing
          email: user.email,
          amount: selectedPackage.price * 100,
          currency: 'GHS',
          ref: response.data.reference,
          metadata: paymentData.metadata,
          callback: async (response: any) => {
            console.log('Payment successful:', response);
            
            // Verify payment
            try {
              const verifyResponse = await paymentService.verifyPayment(response.reference);
              if (verifyResponse.status) {
                toast({
                  title: "Payment Successful!",
                  description: "Your ad has been submitted for review.",
                });
                onSuccess();
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Payment Error",
                description: "Payment verification failed. Please contact support.",
                variant: "destructive"
              });
            }
          },
          onClose: () => {
            console.log('Payment popup closed');
            setIsProcessing(false);
          }
        });

        handler.openIframe();
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  // Check for expired payments periodically
  useEffect(() => {
    const interval = setInterval(() => {
      paymentExpirationService.expirePendingPayments();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isFreePackage = selectedPackage.price === 0;

  if (!paystackLoaded && !isFreePackage) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading payment system...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <selectedPackage.icon className="h-6 w-6 text-blue-600" />
          {selectedPackage.name}
        </CardTitle>
        <div className="text-3xl font-bold text-gray-900">
          {isFreePackage ? (
            <span className="text-green-600">FREE</span>
          ) : (
            formatPrice(selectedPackage.price)
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <Button 
            onClick={isFreePackage ? handleFreePackage : handleInlinePayment}
            disabled={isProcessing}
            className={`w-full ${isFreePackage ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {isFreePackage ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Ad Now
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay & Publish Ad
                  </>
                )}
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full mt-2"
          >
            Cancel
          </Button>
        </div>

        {!isFreePackage && (
          <div className="text-xs text-center text-gray-500 space-y-1">
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Payment will expire in 1 minute if not completed</span>
            </div>
            <div>Secure payment powered by Paystack</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
