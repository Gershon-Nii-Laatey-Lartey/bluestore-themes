
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";

interface PricingFormProps {
  formData: {
    price: string;
    originalPrice: string;
    negotiable: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const PricingForm = ({ formData, onInputChange }: PricingFormProps) => {
  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const current = parseFloat(formData.price);
    
    if (original && current && original > current) {
      const discount = ((original - current) / original) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discountPercentage = calculateDiscount();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Current Price (GHS) *</Label>
            <Input 
              id="price" 
              name="price"
              type="number" 
              placeholder="0.00" 
              className="mt-1"
              value={formData.price}
              onChange={onInputChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the selling price for your product
            </p>
          </div>
          
          <div>
            <Label htmlFor="originalPrice">Original Price (Optional)</Label>
            <Input 
              id="originalPrice" 
              name="originalPrice"
              type="number" 
              placeholder="0.00" 
              className="mt-1"
              value={formData.originalPrice}
              onChange={onInputChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Show customers the original price if on sale
            </p>
          </div>
        </div>

        {discountPercentage > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Your customers will see a 
              <Badge variant="secondary" className="mx-1 bg-green-100 text-green-800">
                {discountPercentage}% OFF
              </Badge>
              discount badge
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 p-3 border rounded-lg">
          <input 
            type="checkbox" 
            id="negotiable" 
            name="negotiable"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={formData.negotiable}
            onChange={onInputChange}
          />
          <Label htmlFor="negotiable" className="text-sm font-medium cursor-pointer">
            Price is negotiable
          </Label>
          <p className="text-xs text-gray-500 ml-2">
            Allow buyers to negotiate the price
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
