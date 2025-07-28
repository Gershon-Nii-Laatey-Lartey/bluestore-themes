
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VendorRequired = () => {
  const navigate = useNavigate();

  const handleCreateProfile = () => {
    navigate('/create-vendor-profile');
  };

  const benefits = [
    "Publish unlimited product listings",
    "Manage your inventory and orders",
    "Build your brand presence",
    "Connect with customers directly",
    "Access seller analytics and insights"
  ];

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Store className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vendor Profile Required
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            To publish ads and sell products, you need to create a vendor profile first. 
            This helps us verify your business and provides customers with important information.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-left">What you'll get as a vendor:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-left">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={handleCreateProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
          >
            Create Vendor Profile
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <p className="text-sm text-gray-500">
            Creating a vendor profile is free and takes just a few minutes
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default VendorRequired;
