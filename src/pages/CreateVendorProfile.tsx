import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Upload, Store } from "lucide-react";
import { dataService } from "@/services/dataService";
import { supabase } from "@/integrations/supabase/client";

const CreateVendorProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    categories: [] as string[],
    profileImage: null as File | null,
    coverImage: null as File | null,
    shipping_policy: '',
    return_policy: '',
    warranty_info: ''
  });

  const categoryOptions = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 
    'Smartphones', 'Laptops', 'Headphones', 'Gaming', 'Automotive'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one category",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await dataService.createVendorProfile({
        user_id: user.id,
        business_name: formData.business_name,
        description: formData.description,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        categories: formData.categories,
        shipping_policy: formData.shipping_policy,
        return_policy: formData.return_policy,
        warranty_info: formData.warranty_info,
        verified: false
      });
      
      toast({
        title: "Vendor Profile Created",
        description: "Your vendor profile has been created successfully!"
      });
      
              navigate(`/vendor/${user?.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create vendor profile",
        variant: "destructive"
      });
    }
  };

  const getImagePreview = (file: File | null) => {
    return file ? URL.createObjectURL(file) : null;
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Set up your business profile to start selling</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input 
                  id="business_name" 
                  placeholder="Enter your business name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Business Description *</Label>
                <Textarea 
                  id="description" 
                  rows={4}
                  placeholder="Describe your business and what you sell..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location" 
                    placeholder="City, Region"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    placeholder="+233 XX XXX XXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profileImage">Profile Image</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="profileImage"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'profileImage')}
                    className="hidden"
                  />
                  <label htmlFor="profileImage" className="cursor-pointer">
                    {formData.profileImage ? (
                      <div className="flex items-center space-x-3">
                        <img 
                          src={getImagePreview(formData.profileImage) || ''} 
                          alt="Profile preview" 
                          className="h-16 w-16 object-cover rounded-full"
                        />
                        <span className="text-sm text-gray-600">{formData.profileImage.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Upload Profile Image (JPG, PNG)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="coverImage">Cover Image</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="coverImage"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'coverImage')}
                    className="hidden"
                  />
                  <label htmlFor="coverImage" className="cursor-pointer">
                    {formData.coverImage ? (
                      <div className="space-y-2">
                        <img 
                          src={getImagePreview(formData.coverImage) || ''} 
                          alt="Cover preview" 
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        <span className="text-sm text-gray-600">{formData.coverImage.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Upload Cover Image (JPG, PNG)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Select the categories you sell in *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {categoryOptions.map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shipping_policy">Shipping Policy</Label>
                <Textarea 
                  id="shipping_policy" 
                  rows={3}
                  placeholder="Describe your shipping terms and delivery times..."
                  value={formData.shipping_policy}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="return_policy">Return Policy</Label>
                <Textarea 
                  id="return_policy" 
                  rows={3}
                  placeholder="Describe your return and refund policy..."
                  value={formData.return_policy}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="warranty_info">Warranty Information</Label>
                <Textarea 
                  id="warranty_info" 
                  rows={3}
                  placeholder="Describe warranty terms for your products..."
                  value={formData.warranty_info}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Create Vendor Profile
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateVendorProfile;
