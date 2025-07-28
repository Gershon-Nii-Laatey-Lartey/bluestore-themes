
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Check, AlertCircle, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PaymentCheckout } from "@/components/payment/PaymentCheckout";
import { adPackages, AdPackage } from "@/types/adPackage";
import { paymentService } from "@/services/paymentService";

const PackageSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<string>(adPackages.find(pkg => pkg.recommended)?.id || adPackages[0].id);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Handle payment success callback
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const reference = searchParams.get('reference');
    
    if (paymentStatus === 'success' && reference) {
      handlePaymentSuccess(reference);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (reference: string) => {
    setProcessingPayment(true);
    
    try {
      const verification = await paymentService.verifyPayment(reference);
      
      if (verification.status && verification.data?.status === 'success') {
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated successfully.",
        });
        
        // Clear URL parameters and redirect
        navigate('/my-ads', { replace: true });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if you believe this is an error.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleContinue = () => {
    const selected = adPackages.find(pkg => pkg.id === selectedPackage);
    
    if (!selected) return;
    
    // All packages now require payment
    setShowCheckout(true);
  };

  const handlePaymentSuccess2 = () => {
    setShowCheckout(false);
    toast({
      title: "Payment Successful!",
      description: "Your subscription has been activated. You can now publish premium ads!",
    });
    navigate('/my-ads');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedPkg = adPackages.find(pkg => pkg.id === selectedPackage);

  if (showCheckout && selectedPkg) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">Secure payment powered by Paystack</p>
          </div>
          
          <PaymentCheckout
            selectedPackage={selectedPkg}
            onSuccess={handlePaymentSuccess2}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      </Layout>
    );
  }

  if (processingPayment) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Processing your payment...</p>
            <p className="text-gray-600">Please wait while we verify your transaction.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Choose Your Subscription Plan</h1>
          <p className="text-gray-600 mt-1">Select the best subscription to promote your ads effectively</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {adPackages.map((pkg) => {
            const IconComponent = pkg.icon;
            return (
              <Card 
                key={pkg.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  selectedPackage === pkg.id 
                    ? `${pkg.color} shadow-lg scale-105` 
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                {pkg.popular && (
                  <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-2">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{pkg.duration}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      <strong>Best for:</strong> {pkg.bestFor}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      selectedPackage === pkg.id 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                  >
                    {selectedPackage === pkg.id ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Subscription Benefits</p>
            <p className="text-sm text-blue-700">
              All plans provide ongoing access to premium features with different ad limits. 
              Premium packages include verification badges that build customer trust.
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 flex items-start space-x-3">
          <Crown className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Secure Payment</p>
            <p className="text-sm text-green-700">
              All payments are processed securely through Paystack. We support cards, mobile money, 
              bank transfers, and USSD payments for your convenience.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 px-8" 
            onClick={handleContinue}
          >
            Continue to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PackageSelection;
