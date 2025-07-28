
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ProductImagesProps {
  images?: string[];
  title: string;
  mainImageIndex?: number;
}

export const ProductImages = ({ images, title, mainImageIndex = 0 }: ProductImagesProps) => {
  const [selectedImage, setSelectedImage] = useState(mainImageIndex);

  const handlePrevious = () => {
    if (images && images.length > 0) {
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  };

  const handleNext = () => {
    if (images && images.length > 0) {
      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-8xl">
          📱
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image with Navigation */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <OptimizedImage
          src={images[selectedImage]}
          alt={title}
          aspectRatio="square"
          className="w-full h-full"
          fallback={
            <div className="text-8xl flex items-center justify-center h-full">📱</div>
          }
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-800 p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-800 p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedImage === index 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:opacity-80'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <OptimizedImage
                src={img}
                alt={`${title} - ${index + 1}`}
                aspectRatio="square"
                className="w-full h-full"
                fallback={
                  <div className="text-2xl flex items-center justify-center h-full">📱</div>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
