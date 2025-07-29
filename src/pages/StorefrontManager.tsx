
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { storefrontService } from "@/services/storefrontService";
import { vendorService } from "@/services/vendorService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Store, 
  Copy, 
  ExternalLink, 
  Settings, 
  Palette, 
  BarChart3,
  Package,
  Users,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StorefrontCustomizer } from "@/components/vendor/StorefrontCustomizer";

const StorefrontManager = () => {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: vendorProfile, isLoading, refetch } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorService.getVendorProfile()
  });

  const { data: products } = useQuery({
    queryKey: ['storefront-products', vendorProfile?.user_id],
    queryFn: () => storefrontService.getStorefrontProducts(vendorProfile!.user_id!),
    enabled: !!vendorProfile?.user_id
  });

  const storefrontUrl = vendorProfile?.storefrontUrl;
  const storefrontEnabled = vendorProfile?.storefrontEnabled;
  const fullStorefrontUrl = storefrontUrl ? `${window.location.origin}/store/${storefrontUrl}` : '';

  const copyStorefrontUrl = () => {
    navigator.clipboard.writeText(fullStorefrontUrl);
    toast({
      title: "Copied!",
      description: "Storefront URL copied to clipboard"
    });
  };

  const handleCustomizationSave = async (customization: any) => {
    try {
      await storefrontService.saveStorefrontCustomization(vendorProfile!.user_id!, customization);
      toast({
        title: "Customization Saved",
        description: "Your storefront has been updated with your custom design."
      });
      setIsCustomizerOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customization",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading storefront...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!vendorProfile || !storefrontEnabled) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="text-center py-16">
              <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Storefront Found</h2>
              <p className="text-muted-foreground mb-4">
                You don't have an active storefront yet. Create one to get started.
              </p>
              <Button asChild>
                <a href={`/vendor/${user?.id}`}>Go to Vendor Profile</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Storefront Manager</h1>
            <p className="text-muted-foreground">
              Manage and customize your online storefront
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(fullStorefrontUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
            <Button
              variant="outline"
              onClick={copyStorefrontUrl}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
          </div>
        </div>

        {/* Storefront URL */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Your Storefront URL</span>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-2 rounded text-sm flex-1 truncate">
                {fullStorefrontUrl}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{products?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">56</p>
                  <p className="text-sm text-muted-foreground">Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="customize" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Storefront Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Customize the look and feel of your storefront to match your brand.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dialog open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Palette className="h-4 w-4 mr-2" />
                        Open Customizer
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
                  <Button variant="outline" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Product management coming soon</h3>
                  <p className="text-muted-foreground">
                    Manage your storefront products directly from here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics & Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Analytics coming soon</h3>
                  <p className="text-muted-foreground">
                    Track your storefront performance and customer insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StorefrontManager;
