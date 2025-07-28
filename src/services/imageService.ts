
import { supabase } from "@/integrations/supabase/client";

class ImageService {
  async uploadImages(files: File[], productId: string): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Generate a unique filename that indicates optimization
      const fileExt = file.name.split('.').pop() || 'webp';
      const isOptimized = file.name.includes('_optimized');
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace('_optimized', '');
      const fileName = `${productId}_${i}_${Date.now()}${isOptimized ? '_opt' : ''}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log(`Uploading ${isOptimized ? 'optimized' : 'original'} image: ${fileName} (${(file.size / 1024).toFixed(1)}KB)`);

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
      
      console.log(`Successfully uploaded: ${fileName} → ${publicUrl}`);
    }

    console.log(`Total images uploaded: ${uploadedUrls.length}`);
    return uploadedUrls;
  }

  async deleteImages(imageUrls: string[]): Promise<void> {
    for (const url of imageUrls) {
      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get 'products/filename.ext'
      
      console.log(`Deleting image: ${filePath}`);
      
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
      } else {
        console.log(`Successfully deleted: ${filePath}`);
      }
    }
  }

  // Helper method to get optimized image URL with additional query parameters for caching
  getOptimizedImageUrl(url: string, options?: { width?: number; quality?: number }): string {
    if (!url) return url;
    
    const urlObj = new URL(url);
    
    // Add optimization query parameters if supported by your CDN/storage
    if (options?.width) {
      urlObj.searchParams.set('w', options.width.toString());
    }
    if (options?.quality) {
      urlObj.searchParams.set('q', options.quality.toString());
    }
    
    // Add cache busting for optimized images
    urlObj.searchParams.set('opt', '1');
    
    return urlObj.toString();
  }
}

export const imageService = new ImageService();
