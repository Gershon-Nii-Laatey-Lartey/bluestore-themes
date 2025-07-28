
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Palette, Save, Eye, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storefrontService } from "@/services/storefrontService";
import { useAuth } from "@/hooks/useAuth";

interface StorefrontCustomizerProps {
  vendorProfile: any;
  onSave?: (customization: any) => void;
}

const colorThemes = [
  { name: "Ocean Blue", primary: "#2563eb", secondary: "#1d4ed8", accent: "#3b82f6" },
  { name: "Forest Green", primary: "#059669", secondary: "#047857", accent: "#10b981" },
  { name: "Sunset Orange", primary: "#ea580c", secondary: "#c2410c", accent: "#f97316" },
  { name: "Royal Purple", primary: "#7c3aed", secondary: "#6d28d9", accent: "#8b5cf6" },
  { name: "Rose Pink", primary: "#e11d48", secondary: "#be185d", accent: "#f43f5e" },
  { name: "Slate Gray", primary: "#475569", secondary: "#334155", accent: "#64748b" },
];

export const StorefrontCustomizer = ({ vendorProfile, onSave }: StorefrontCustomizerProps) => {
  const [customization, setCustomization] = useState({
    businessName: vendorProfile?.business_name || "",
    description: vendorProfile?.description || "",
    colorTheme: colorThemes[0],
    customColors: {
      primary: "#2563eb",
      secondary: "#1d4ed8",
      accent: "#3b82f6"
    },
    bannerImage: null as File | null,
    logoImage: null as File | null,
    showContactInfo: true,
    showCategories: true,
    layoutStyle: "grid", // grid, list, masonry
    productsPerRow: 4,
    enableSearch: true,
    enableFilters: true,
    customCSS: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      whatsapp: ""
    }
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadCustomization();
    }
  }, [user?.id]);

  const loadCustomization = async () => {
    try {
      const data = await storefrontService.getStorefrontCustomization(user!.id);
      if (data?.settings) {
        setCustomization(prev => ({
          ...prev,
          businessName: data.business_name || prev.businessName,
          description: data.description || prev.description,
          ...data.settings
        }));
      }
    } catch (error) {
      console.error('Error loading customization:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      await storefrontService.saveStorefrontCustomization(user.id, customization);
      onSave?.(customization);
      toast({
        title: "Customization Saved",
        description: "Your storefront customization has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Error",
        description: "Failed to save customization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (type: 'banner' | 'logo', file: File) => {
    setCustomization(prev => ({
      ...prev,
      [`${type}Image`]: file
    }));
  };

  const removeImage = (type: 'banner' | 'logo') => {
    setCustomization(prev => ({
      ...prev,
      [`${type}Image`]: null
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Storefront Customization
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Premium Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={customization.businessName}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  businessName: e.target.value
                }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={customization.description}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Tell customers about your business..."
              />
            </div>
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Color Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorThemes.map((theme) => (
              <div
                key={theme.name}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  customization.colorTheme.name === theme.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCustomization(prev => ({
                  ...prev,
                  colorTheme: theme,
                  customColors: {
                    primary: theme.primary,
                    secondary: theme.secondary,
                    accent: theme.accent
                  }
                }))}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: theme.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <p className="text-sm font-medium">{theme.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Logo Image</Label>
              <div className="mt-2">
                {customization.logoImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(customization.logoImage)}
                      alt="Logo preview"
                      className="w-full h-24 object-contain bg-gray-50 rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage('logo')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('logo', file);
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer text-sm text-gray-600">
                      Upload Logo
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Banner Image</Label>
              <div className="mt-2">
                {customization.bannerImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(customization.bannerImage)}
                      alt="Banner preview"
                      className="w-full h-24 object-cover bg-gray-50 rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage('banner')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('banner', file);
                      }}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload" className="cursor-pointer text-sm text-gray-600">
                      Upload Banner
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Layout Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Layout Style</Label>
              <Select 
                value={customization.layoutStyle} 
                onValueChange={(value) => setCustomization(prev => ({
                  ...prev,
                  layoutStyle: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                  <SelectItem value="list">List Layout</SelectItem>
                  <SelectItem value="masonry">Masonry Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Products Per Row</Label>
              <Select 
                value={customization.productsPerRow.toString()} 
                onValueChange={(value) => setCustomization(prev => ({
                  ...prev,
                  productsPerRow: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Products</SelectItem>
                  <SelectItem value="3">3 Products</SelectItem>
                  <SelectItem value="4">4 Products</SelectItem>
                  <SelectItem value="5">5 Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Display Options</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showContactInfo">Show Contact Information</Label>
              <Switch
                id="showContactInfo"
                checked={customization.showContactInfo}
                onCheckedChange={(checked) => setCustomization(prev => ({
                  ...prev,
                  showContactInfo: checked
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showCategories">Show Categories</Label>
              <Switch
                id="showCategories"
                checked={customization.showCategories}
                onCheckedChange={(checked) => setCustomization(prev => ({
                  ...prev,
                  showCategories: checked
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableSearch">Enable Product Search</Label>
              <Switch
                id="enableSearch"
                checked={customization.enableSearch}
                onCheckedChange={(checked) => setCustomization(prev => ({
                  ...prev,
                  enableSearch: checked
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableFilters">Enable Product Filters</Label>
              <Switch
                id="enableFilters"
                checked={customization.enableFilters}
                onCheckedChange={(checked) => setCustomization(prev => ({
                  ...prev,
                  enableFilters: checked
                }))}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Storefront Preview</DialogTitle>
              </DialogHeader>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div 
                  className="text-white p-6 rounded-t-lg"
                  style={{ backgroundColor: customization.customColors.primary }}
                >
                  <h2 className="text-2xl font-bold">{customization.businessName}</h2>
                  <p className="text-white/80">{customization.description}</p>
                </div>
                <div className="bg-white p-4 rounded-b-lg">
                  <p className="text-gray-600">Your products will be displayed here with the selected layout and styling.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
