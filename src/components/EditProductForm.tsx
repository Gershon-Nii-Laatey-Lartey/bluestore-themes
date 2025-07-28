
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductSubmission } from "@/types/product";
import { Upload, Image as ImageIcon, X, ArrowLeft } from "lucide-react";

interface EditProductFormProps {
  product: ProductSubmission;
  onSave: (updates: Partial<ProductSubmission>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EditProductForm = ({ product, onSave, onCancel, isSubmitting }: EditProductFormProps) => {
  const [formData, setFormData] = useState({
    title: product.title,
    category: product.category,
    condition: product.condition,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice || '',
    negotiable: product.negotiable,
    phone: product.phone,
    location: product.location
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImages] = useState(product.images || []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + images.length + files.length > 10) {
      alert("You can upload a maximum of 10 images");
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.category || !formData.condition || !formData.description || !formData.price || !formData.phone || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-2 border-gray-300 hover:border-gray-400 rounded-sm px-3 py-2 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
        <p className="text-gray-600 mt-1">Update your product details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input 
                id="title" 
                placeholder="Enter product title" 
                className="mt-1" 
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select 
                  id="category" 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={handleInputChange}
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
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={formData.condition}
                  onChange={handleInputChange}
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
              <Textarea 
                id="description" 
                rows={4} 
                placeholder="Describe your product..."
                className="mt-1"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (GHS) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="0.00" 
                  className="mt-1"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                <Input 
                  id="originalPrice" 
                  type="number" 
                  placeholder="0.00" 
                  className="mt-1"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="negotiable" 
                className="w-4 h-4"
                checked={formData.negotiable}
                onChange={handleInputChange}
              />
              <Label htmlFor="negotiable">Price is negotiable</Label>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? 'Main' : `${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add More Images</h3>
                <p className="text-gray-500 mb-4">Upload additional images ({existingImages.length + images.length}/10)</p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={existingImages.length + images.length >= 10}
                />
                <label htmlFor="image-upload">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    disabled={existingImages.length + images.length >= 10}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                      <span>Choose Files</span>
                    </span>
                  </Button>
                </label>
              </div>

              {/* New Images Preview */}
              {images.length > 0 && (
                <div>
                  <Label>New Images to Add</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImagePreview(image)}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          New {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+233 XX XXX XXXX" 
                  className="mt-1 bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={formData.phone}
                  readOnly
                  disabled
                  required
                  tabIndex={-1}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number cannot be edited. Update it in your vendor profile.
                </p>
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  placeholder="City, Region" 
                  className="mt-1"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
