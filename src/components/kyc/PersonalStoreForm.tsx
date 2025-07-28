
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Store } from "lucide-react";

interface PersonalStoreFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, field: string) => void;
  onContinue: () => void;
}

export const PersonalStoreForm = ({ 
  formData, 
  onInputChange, 
  onSelectChange, 
  onContinue 
}: PersonalStoreFormProps) => {
  const productCategories = [
    'Fashion',
    'Electronics',
    'Groceries',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Services'
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = formData.productCategory ? formData.productCategory.split(',') : [];
    
    if (checked) {
      if (!currentCategories.includes(category)) {
        const updatedCategories = [...currentCategories, category];
        onSelectChange(updatedCategories.join(','), 'productCategory');
      }
    } else {
      const updatedCategories = currentCategories.filter((cat: string) => cat !== category);
      onSelectChange(updatedCategories.join(','), 'productCategory');
    }
  };

  const isFormValid = () => {
    return formData.fullName && 
           formData.phoneNumber && 
           formData.address && 
           formData.storeName && 
           formData.storeDescription && 
           formData.productCategory && 
           formData.location;
  };

  const selectedCategories = formData.productCategory ? formData.productCategory.split(',') : [];

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name (as on ID) *</Label>
            <Input 
              id="fullName" 
              value={formData.fullName}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input 
                id="phoneNumber" 
                type="tel"
                value={formData.phoneNumber}
                onChange={onInputChange}
                placeholder="Phone number (OTP verification required)"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address (optional but recommended)</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={onInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Residential Address *</Label>
            <Textarea 
              id="address" 
              value={formData.address}
              onChange={onInputChange}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name / Brand Name *</Label>
            <Input 
              id="storeName" 
              value={formData.storeName}
              onChange={onInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="storeDescription">Short Store Description *</Label>
            <Textarea 
              id="storeDescription" 
              value={formData.storeDescription}
              onChange={onInputChange}
              placeholder="What do you sell? Example: Kids wear & accessories"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Main Product Categories * (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 p-4 border rounded-md">
                {productCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`category-${category}`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedCategories.join(', ')}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location (City/Town) *</Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!isFormValid()}
      >
        Continue to ID Verification
      </Button>
    </div>
  );
};
