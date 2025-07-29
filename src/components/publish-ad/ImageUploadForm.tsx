import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Star, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { imageOptimizationService } from "@/services/imageOptimizationService";
import { LazyOptimizedImage } from "@/components/ui/lazy-optimized-image";

interface ImageUploadFormProps {
  images: File[];
  onImageUpload: (files: File[]) => void; // Changed to accept files directly
  onRemoveImage: (index: number) => void;
  getImagePreview: (file: File) => string;
  mainImageIndex?: number;
  onSetMainImage?: (index: number) => void;
}

export const ImageUploadForm = ({ 
  images, 
  onImageUpload, 
  onRemoveImage, 
  getImagePreview,
  mainImageIndex = 0,
  onSetMainImage
}: ImageUploadFormProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [blurPlaceholders, setBlurPlaceholders] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images",
        variant: "destructive"
      });
      return;
    }

    if (files.length === 0) return;

    // Check for unsupported file types
    const unsupportedFiles = files.filter(file => !imageOptimizationService.isFileTypeSupported(file));
    if (unsupportedFiles.length > 0) {
      toast({
        title: "Unsupported File Types",
        description: `The following files are not supported: ${unsupportedFiles.map(f => f.name).join(', ')}. Please use JPEG, PNG, or WebP files. HEIC/HEIF files are not supported.`,
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    
    try {
      // Generate blur placeholders for new images
      const newPlaceholders: { [key: number]: string } = {};
      const supportedFiles = files.filter(file => imageOptimizationService.isFileTypeSupported(file));
      
      // Generate placeholders only for supported files
      const placeholderPromises = supportedFiles.map(async (file, index) => {
        try {
          const placeholder = await imageOptimizationService.generateBlurPlaceholder(file);
          newPlaceholders[images.length + index] = placeholder;
        } catch (error) {
          console.error('Failed to generate blur placeholder:', error);
        }
      });
      
      await Promise.allSettled(placeholderPromises);
      setBlurPlaceholders(prev => ({ ...prev, ...newPlaceholders }));

      // Optimize images
      const optimizedImages = await imageOptimizationService.optimizeImages(supportedFiles);
      
      if (optimizedImages.length > 0) {
        // Pass optimized files directly to the parent component
        const optimizedFiles = optimizedImages.map(img => img.file);
        onImageUpload(optimizedFiles);
      } else {
        throw new Error('No images could be optimized');
      }
    } catch (error) {
      console.error('Image optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize images. Please try with different files.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Product Images *
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload up to 10 high-quality images. Supported formats: JPEG, PNG, WebP. Images will be automatically optimized for faster loading.
        </p>
        <p className="text-xs text-orange-600">
          Note: HEIC/HEIF files are not supported. Please convert them to JPEG or PNG first.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            className="flex-1"
            disabled={isOptimizing}
          />
          <Button type="button" variant="outline" disabled={isOptimizing}>
            <Upload className="h-4 w-4 mr-2" />
            {isOptimizing ? "Optimizing..." : "Upload Images"}
          </Button>
        </div>

        {isOptimizing && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Optimizing images for faster loading...</span>
          </div>
        )}
        
        {images.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                {images.length}/10 images uploaded
                {onSetMainImage && " • Click the star to set main image"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-300 transition-colors">
                    <LazyOptimizedImage
                      src={getImagePreview(image)}
                      alt={`Product ${index + 1}`}
                      blurPlaceholder={blurPlaceholders[index]}
                      aspectRatio="square"
                      className="w-full h-full"
                      loadingStrategy="lazy"
                    />
                  </div>
                  
                  {/* Main image badge */}
                  {index === mainImageIndex && (
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                      Main
                    </Badge>
                  )}
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {onSetMainImage && index !== mainImageIndex && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        onClick={() => onSetMainImage(index)}
                        title="Set as main image"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => onRemoveImage(index)}
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Image number */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="text-xs bg-white/80">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>


          </div>
        )}
        
        {images.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No images uploaded yet</p>
            <p className="text-sm text-gray-500">Upload at least one image to continue</p>
            <p className="text-xs text-blue-600 mt-2">Images will be automatically optimized for faster loading</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
