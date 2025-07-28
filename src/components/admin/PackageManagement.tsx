
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star, TrendingUp, Shield, Gift, Zap } from "lucide-react";
import { AdPackage } from "@/types/adPackage";
import { packageService } from "@/services/packageService";

const iconOptions = [
  { value: "Star", label: "Star", component: Star },
  { value: "TrendingUp", label: "Trending Up", component: TrendingUp },
  { value: "Shield", label: "Shield", component: Shield },
  { value: "Gift", label: "Gift", component: Gift },
  { value: "Zap", label: "Zap", component: Zap }
];

const featureOptions = [
  "Basic placement",
  "Priority placement",
  "Top search ranking",
  "Highlighted listings",
  "Featured in category sections",
  "Enhanced visibility in search results",
  "Promoted in category listings",
  "Email support",
  "Priority support",
  "24/7 Priority support",
  "Light analytics (views count)",
  "Ad performance dashboard",
  "Advanced analytics",
  "Weekly performance insights",
  "One 'Urgent' tag per ad",
  "Verified Business Badge",
  "Premium Verification Badge ✅",
  "Storefront URL",
  "Customer reviews section",
  "Auto-renewing ads",
  "Dedicated account manager",
  "Ads featured across homepage and top banners"
];

export const PackageManagement = () => {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    duration: "",
    features: [] as string[],
    bestFor: "",
    color: "border-blue-400",
    icon: "Star",
    adsAllowed: 1,
    recommended: false,
    popular: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      duration: "",
      features: [],
      bestFor: "",
      color: "border-blue-400",
      icon: "Star",
      adsAllowed: 1,
      recommended: false,
      popular: false
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.duration || !formData.bestFor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const packageData = {
        id: editingPackage || `custom-${Date.now()}`,
        name: formData.name,
        price: formData.price,
        duration: formData.duration,
        features: formData.features,
        bestFor: formData.bestFor,
        color: formData.color,
        icon: formData.icon,
        recommended: formData.recommended,
        popular: formData.popular,
        adsAllowed: formData.adsAllowed === 0 ? null : formData.adsAllowed
      };

      if (editingPackage) {
        await packageService.updatePackage(editingPackage, packageData);
        toast({
          title: "Success",
          description: "Package updated successfully"
        });
      } else {
        await packageService.createPackage(packageData);
        toast({
          title: "Success",
          description: "Package added successfully"
        });
      }

      await loadPackages();
      setIsAddingPackage(false);
      setEditingPackage(null);
      resetForm();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (pkg: AdPackage) => {
    setFormData({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      features: pkg.features,
      bestFor: pkg.bestFor,
      color: pkg.color,
      icon: iconOptions.find(icon => icon.component === pkg.icon)?.value || "Star",
      adsAllowed: pkg.adsAllowed || 0,
      recommended: pkg.recommended || false,
      popular: pkg.popular || false
    });
    setEditingPackage(pkg.id);
    setIsAddingPackage(true);
  };

  const handleDelete = async (packageId: string) => {
    try {
      await packageService.deletePackage(packageId);
      toast({
        title: "Success",
        description: "Package deleted successfully"
      });
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "FREE";
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Manage ad packages and pricing plans</p>
        </div>
        <Button onClick={() => setIsAddingPackage(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Package</span>
        </Button>
      </div>

      {/* Add/Edit Package Form */}
      {isAddingPackage && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPackage ? "Edit Package" : "Add New Package"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Plan"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (GHS) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0 for free"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 1 Month"
                />
              </div>
              <div>
                <Label htmlFor="adsAllowed">Ads Allowed</Label>
                <Input
                  id="adsAllowed"
                  type="number"
                  value={formData.adsAllowed}
                  onChange={(e) => setFormData(prev => ({ ...prev, adsAllowed: Number(e.target.value) }))}
                  placeholder="0 for unlimited"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center space-x-2">
                          <icon.component className="h-4 w-4" />
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Border Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="border-blue-400">Blue</SelectItem>
                    <SelectItem value="border-green-400">Green</SelectItem>
                    <SelectItem value="border-purple-400">Purple</SelectItem>
                    <SelectItem value="border-yellow-400">Yellow</SelectItem>
                    <SelectItem value="border-red-400">Red</SelectItem>
                    <SelectItem value="border-indigo-400">Indigo</SelectItem>
                    <SelectItem value="border-orange-400">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bestFor">Best For *</Label>
              <Textarea
                id="bestFor"
                value={formData.bestFor}
                onChange={(e) => setFormData(prev => ({ ...prev, bestFor: e.target.value }))}
                placeholder="Describe who this package is best for"
              />
            </div>

            <div className="space-y-2">
              <Label>Package Flags</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommended"
                    checked={formData.recommended}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recommended: !!checked }))}
                  />
                  <Label htmlFor="recommended">Recommended</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="popular"
                    checked={formData.popular}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: !!checked }))}
                  />
                  <Label htmlFor="popular">Popular</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {featureOptions.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={`feature-${feature}`} className="text-sm">{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSubmit}>
                {editingPackage ? "Update Package" : "Add Package"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingPackage(false);
                  setEditingPackage(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Ads Allowed</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <pkg.icon className="h-4 w-4" />
                      <span className="font-medium">{pkg.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(pkg.price)}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell>{pkg.adsAllowed || "Unlimited"}</TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600">
                      {pkg.features.length} features
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {pkg.recommended && <Badge variant="secondary">Recommended</Badge>}
                      {pkg.popular && <Badge variant="outline">Popular</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
