
import { useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentImageProps {
  src: string;
  alt: string;
  className: string;
}

export const DocumentImage = ({ src, alt, className }: DocumentImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.error(`Failed to load image: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Function to get the proper image URL
  const getImageUrl = (imageSrc: string): string => {
    // If it's already a complete URL (starts with http/https), return as is
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc;
    }

    // If it looks like a file path (contains userId/filename pattern), construct Supabase public URL
    // This handles old file paths stored in the database
    if (imageSrc.includes('/') && !imageSrc.startsWith('data:')) {
      // Determine the correct bucket based on the file path pattern
      // KYC documents have patterns like: userId/id-document-timestamp.ext, userId/selfie-with-id-timestamp.ext
      const isKycDocument = imageSrc.includes('id-document') || imageSrc.includes('selfie-with-id');
      const bucketName = isKycDocument ? 'kyc-documents' : 'product-images';
      
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(imageSrc);
      
      console.log(`Converting file path to public URL: ${imageSrc} -> ${data.publicUrl} (bucket: ${bucketName})`);
      return data.publicUrl;
    }

    // For any other case, try to use it as is
    return imageSrc;
  };

  const imageUrl = getImageUrl(src);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-400 text-sm`}>
        <div className="text-center">
          <FileText className="h-6 w-6 mx-auto mb-1" />
          <span>Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400`}>
          Loading...
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={alt} 
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};
