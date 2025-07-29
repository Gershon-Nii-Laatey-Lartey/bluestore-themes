
import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  skeleton?: boolean;
  aspectRatio?: "square" | "video" | "auto";
  blurPlaceholder?: string;
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ 
    src, 
    alt, 
    className, 
    fallback, 
    skeleton = true, 
    aspectRatio = "auto", 
    blurPlaceholder,
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleLoad = () => {
      setIsLoading(false);
      setImageLoaded(true);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const aspectRatioClass = {
      square: "aspect-square",
      video: "aspect-video", 
      auto: ""
    }[aspectRatio];

    if (hasError) {
      return (
        <div className={cn(
          "bg-gray-100 rounded-lg flex items-center justify-center text-4xl",
          aspectRatioClass,
          className
        )}>
          {fallback || "📱"}
        </div>
      );
    }

    return (
      <div className={cn("relative overflow-hidden", aspectRatioClass, className)}>
        {/* Blur placeholder background */}
        {blurPlaceholder && !imageLoaded && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
            style={{
              backgroundImage: `url(${blurPlaceholder})`,
              filter: 'blur(8px)',
              transform: 'scale(1.05)',
            }}
          />
        )}

        {/* Loading skeleton */}
        {isLoading && skeleton && !blurPlaceholder && (
          <Skeleton className={cn("absolute inset-0 rounded-lg", aspectRatioClass)} />
        )}

        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
