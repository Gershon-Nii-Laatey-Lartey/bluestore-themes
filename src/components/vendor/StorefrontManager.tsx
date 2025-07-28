import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { storefrontService } from "@/services/storefrontService";
import { Store, Copy, ExternalLink, Settings, Palette, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StorefrontCustomizer } from "./StorefrontCustomizer";

interface StorefrontManagerProps {
  vendorProfile: any;
  userActivePackage?: any;
  onStorefrontEnabled?: () => void;
}

export const StorefrontManager = ({ 
  vendorProfile, 
  userActivePackage,
  onStorefrontEnabled 
}: StorefrontManagerProps) => {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const { toast } = useToast();
  
  const hasStorefrontAccess = userActivePackage && 
    (userActivePackage.plan_type === 'business' || userActivePackage.plan_type === 'premium');
  
  const storefrontUrl = vendorProfile?.storefront_url;
  const storefrontEnabled = vendorProfile?.storefront_enabled;
  const fullStorefrontUrl = storefrontUrl ? `${window.location.origin}/store/${storefrontUrl}` : '';

  const enableStorefront = async () => {
    if (!vendorProfile?.business_name) {
      toast({
        title: "Error",
        description: "Business name is required to create a storefront",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsEnabling(true);
      const url = await storefrontService.enableStorefront(
        vendorProfile.user_id, 
        vendorProfile.business_name
      );
      
      toast({
        title: "Storefront Created!",
        description: `Your storefront is now available at /${url}`
      });
      
      onStorefrontEnabled?.();
    } catch (error) {
      console.error('Error enabling storefront:', error);
      toast({
        title: "Error",
        description: "Failed to create storefront. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const copyStorefrontUrl = () => {
    navigator.clipboard.writeText(fullStorefrontUrl);
    toast({
      title: "Copied!",
      description: "Storefront URL copied to clipboard"
    });
  };

  const handleCustomizationSave = (customization: any) => {
    console.log('Saving customization:', customization);
    toast({
      title: "Customization Saved",
      description: "Your storefront has been updated with your custom design."
    });
    setIsCustomizerOpen(false);
  };

  if (!hasStorefrontAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Storefront
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Upgrade to Get Your Storefront</h3>
            <p className="text-gray-600 mb-4">
              Get your own custom storefront with Business or Premium packages
            </p>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Available with Business (GHS 250) & Premium (GHS 500) plans
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          My Storefront
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Premium Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!storefrontEnabled ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Create your custom storefront to showcase all your products in one place
            </p>
            <Button
              onClick={enableStorefront}
              disabled={isEnabling}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEnabling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Storefront...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  Create My Storefront
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Your Storefront URL</span>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-sm flex-1 truncate">
                  {fullStorefrontUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyStorefrontUrl}
                  className="flex-shrink-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(fullStorefrontUrl, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit
              </Button>
              <Button
                variant="default"
                onClick={() => window.location.href = '/storefront-manager'}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              <Dialog open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Palette className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Customize Your Storefront</DialogTitle>
                  </DialogHeader>
                  <StorefrontCustomizer 
                    vendorProfile={vendorProfile}
                    onSave={handleCustomizationSave}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="flex-1"
                disabled
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
