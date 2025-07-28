
export interface OptimizedImage {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetSizeKB?: { min: number; max: number };
  format?: 'webp' | 'jpeg' | 'png';
}

class ImageOptimizationService {
  private defaultOptions: ImageOptimizationOptions = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8,
    targetSizeKB: { min: 150, max: 250 },
    format: 'webp'
  };

  // Supported file types
  private supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private unsupportedTypes = ['image/heic', 'image/heif'];

  isFileTypeSupported(file: File): boolean {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Check for HEIC/HEIF files by extension if MIME type is not set
    if (fileName.endsWith('.heic') || fileName.endsWith('.heif') || 
        this.unsupportedTypes.includes(fileType)) {
      return false;
    }
    
    return this.supportedTypes.includes(fileType) || fileType.startsWith('image/');
  }

  async optimizeImage(file: File, options?: Partial<ImageOptimizationOptions>): Promise<OptimizedImage> {
    // Check if file type is supported
    if (!this.isFileTypeSupported(file)) {
      throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please use JPEG, PNG, or WebP files. HEIC/HEIF files are not supported.`);
    }

    const opts = { ...this.defaultOptions, ...options };
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set up timeout for image loading
      const timeout = setTimeout(() => {
        reject(new Error('Image loading timeout. Please try with a smaller file.'));
      }, 10000); // 10 second timeout

      img.onload = async () => {
        clearTimeout(timeout);
        try {
          // Calculate optimal dimensions
          const { width, height } = this.calculateOptimalDimensions(
            img.width, 
            img.height, 
            opts.maxWidth!, 
            opts.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to hit target file size
          const optimizedFile = await this.compressToTargetSize(canvas, file.name, opts);
          
          resolve({
            file: optimizedFile,
            originalSize: file.size,
            optimizedSize: optimizedFile.size,
            compressionRatio: Math.round((1 - optimizedFile.size / file.size) * 100),
            dimensions: { width, height }
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image. Please ensure the file is a valid image format.'));
      };

      // Create object URL with error handling
      try {
        img.src = URL.createObjectURL(file);
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Failed to process image file.'));
      }
    });
  }

  async optimizeImages(files: File[], options?: Partial<ImageOptimizationOptions>): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const optimized = await this.optimizeImage(file, options);
        results.push(optimized);
      } catch (error) {
        console.error(`Failed to optimize ${file.name}:`, error);
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (results.length === 0 && errors.length > 0) {
      throw new Error(`All images failed to optimize:\n${errors.join('\n')}`);
    }

    return results;
  }

  generateBlurPlaceholder(file: File): Promise<string> {
    // Check if file type is supported before generating placeholder
    if (!this.isFileTypeSupported(file)) {
      return Promise.reject(new Error('Unsupported file type for blur placeholder'));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Blur placeholder generation timeout'));
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          // Create very small version for blur placeholder
          const smallSize = 20;
          canvas.width = smallSize;
          canvas.height = smallSize;
          
          ctx.filter = 'blur(2px)';
          ctx.drawImage(img, 0, 0, smallSize, smallSize);
          
          resolve(canvas.toDataURL('image/jpeg', 0.1));
        } catch (error) {
          reject(new Error('Failed to generate blur placeholder'));
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to generate blur placeholder'));
      };

      try {
        img.src = URL.createObjectURL(file);
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Failed to process file for blur placeholder'));
      }
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Scale down if larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
      const widthRatio = maxWidth / width;
      const heightRatio = maxHeight / height;
      const ratio = Math.min(widthRatio, heightRatio);
      
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    return { width, height };
  }

  private async compressToTargetSize(
    canvas: HTMLCanvasElement, 
    originalName: string, 
    options: ImageOptimizationOptions
  ): Promise<File> {
    const { targetSizeKB, quality: initialQuality, format } = options;
    let quality = initialQuality || 0.8;
    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
      const blob = await this.canvasToBlob(canvas, format!, quality);
      const sizeKB = blob.size / 1024;
      
      // If size is within target range, we're done
      if (sizeKB >= targetSizeKB!.min && sizeKB <= targetSizeKB!.max) {
        return this.blobToFile(blob, originalName, format!);
      }
      
      // If too large, reduce quality
      if (sizeKB > targetSizeKB!.max) {
        quality = Math.max(0.1, quality - 0.1);
      } 
      // If too small, increase quality (but don't go above initial)
      else {
        quality = Math.min(initialQuality!, quality + 0.05);
      }
      
      attempt++;
    }

    // If we can't hit the target, return the best attempt
    const finalBlob = await this.canvasToBlob(canvas, format!, quality);
    return this.blobToFile(finalBlob, originalName, format!);
  }

  private canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }

  private blobToFile(blob: Blob, originalName: string, format: string): File {
    const extension = format === 'webp' ? 'webp' : format === 'jpeg' ? 'jpg' : 'png';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const newName = `${nameWithoutExt}_optimized.${extension}`;
    
    return new File([blob], newName, { 
      type: `image/${format}`,
      lastModified: Date.now()
    });
  }
}

export const imageOptimizationService = new ImageOptimizationService();
