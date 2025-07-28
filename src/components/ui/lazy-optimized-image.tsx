
import { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyOptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  blurPlaceholder?: string;
  aspectRatio?: "square" | "video" | "auto";
  loadingStrategy?: "lazy" | "eager";
}

export const LazyOptimizedImage = forwardRef<HTMLImageElement, LazyOptimizedImageProps>(
  ({ 
    src, 
    alt, 
    className, 
    fallback, 
    blurPlaceholder,
    aspectRatio = "auto",
    loadingStrategy = "lazy",
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isIntersecting, setIsIntersecting] = useState(loadingStrategy === "eager");
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Set up intersection observer for lazy loading
    useEffect(() => {
      if (loadingStrategy === "eager") return;

      const currentImgRef = imgRef.current;
      if (!currentImgRef) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observerRef.current?.disconnect();
          }
        },
        {
          rootMargin: '50px', // Start loading 50px before the image enters viewport
          threshold: 0.1
        }
      );

      observerRef.current.observe(currentImgRef);

      return () => {
        observerRef.current?.disconnect();
      };
    }, [loadingStrategy]);

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
              filter: 'blur(10px)',
              transform: 'scale(1.1)', // Slightly scale up to hide blur edges
            }}
          />
        )}
        
        {/* Loading skeleton */}
        {isLoading && !blurPlaceholder && (
          <Skeleton className={cn("absolute inset-0 rounded-lg", aspectRatioClass)} />
        )}

        {/* Loading indicator overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Main image */}
        <img
          ref={(node) => {
            imgRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          src={isIntersecting ? src : undefined}
          alt={alt}
          loading={loadingStrategy}
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />

        {/* Fade-in overlay for smooth transition */}
        {!imageLoaded && isIntersecting && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-50 animate-pulse" />
        )}
      </div>
    );
  }
);

LazyOptimizedImage.displayName = "LazyOptimizedImage";
