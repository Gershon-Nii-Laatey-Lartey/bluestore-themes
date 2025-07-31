import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Store, User, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const VerificationSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center border-0 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Verification Successful!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your account has been successfully verified. You can now access all vendor features.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>What's next?</strong> You can now create ads, manage your storefront, and start selling on our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleNavigate('/publish-ad')}
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-600 hover:bg-blue-700"
              >
                <Package className="w-6 h-6" />
                <span className="font-medium">Create Your First Ad</span>
                <span className="text-xs opacity-90">Start selling your products</span>
              </Button>

              <Button
                onClick={() => handleNavigate('/storefront-manager')}
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700"
              >
                <Store className="w-6 h-6" />
                <span className="font-medium">Manage Storefront</span>
                <span className="text-xs opacity-90">Customize your store</span>
              </Button>

              <Button
                onClick={() => handleNavigate('/profile')}
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-600 hover:bg-purple-700"
              >
                <User className="w-6 h-6" />
                <span className="font-medium">View Profile</span>
                <span className="text-xs opacity-90">Manage your account</span>
              </Button>

              <Button
                onClick={() => handleNavigate('/')}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Home className="w-6 h-6" />
                <span className="font-medium">Go Home</span>
                <span className="text-xs opacity-90">Browse the marketplace</span>
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Tips for Success:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Add high-quality photos to your ads for better visibility</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Set competitive prices and offer good customer service</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Respond quickly to customer inquiries</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Keep your storefront updated with fresh inventory</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Need help?</strong> Our support team is available 24/7. 
                <button 
                  onClick={() => handleNavigate('/support')}
                  className="text-blue-600 underline ml-1 hover:text-blue-800"
                >
                  Contact us
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VerificationSuccess; 