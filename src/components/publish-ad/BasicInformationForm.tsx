
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BasicInformationFormProps {
  formData: {
    title: string;
    category: string;
    condition: string;
    description: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BasicInformationForm = ({ formData, onInputChange }: BasicInformationFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Product Title *</Label>
          <Input 
            id="title" 
            name="title"
            placeholder="Enter product title" 
            className="mt-1" 
            value={formData.title}
            onChange={onInputChange}
            required
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <select 
              id="category" 
              name="category"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              value={formData.category}
              onChange={onInputChange}
              required
            >
              <option value="">Select Category</option>
              <option value="smartphones">Smartphones</option>
              <option value="laptops">Laptops</option>
              <option value="headphones">Headphones</option>
              <option value="gaming">Gaming</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="automotive">Automotive</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="condition">Condition *</Label>
            <select 
              id="condition" 
              name="condition"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              value={formData.condition}
              onChange={onInputChange}
              required
            >
              <option value="">Select Condition</option>
              <option value="new">New</option>
              <option value="used-excellent">Used - Excellent</option>
              <option value="used-good">Used - Good</option>
              <option value="used-fair">Used - Fair</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <textarea 
            id="description" 
            name="description"
            rows={4} 
            placeholder="Describe your product..."
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            value={formData.description}
            onChange={onInputChange}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
