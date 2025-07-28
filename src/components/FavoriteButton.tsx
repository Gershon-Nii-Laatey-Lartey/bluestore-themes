
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimizedFavorites } from "@/hooks/useOptimizedFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  variant?: "default" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const FavoriteButton = ({ 
  productId, 
  variant = "ghost", 
  size = "sm",
  className 
}: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite, isPending } = useOptimizedFavorites();
  const isProductFavorite = isFavorite(productId);
  const isOperationPending = isPending(productId);

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={() => toggleFavorite(productId)}
      disabled={isOperationPending}
      className={cn(className)}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-colors duration-200",
          isProductFavorite 
            ? "fill-red-500 text-red-500" 
            : "text-gray-400 hover:text-red-500",
          isOperationPending && "animate-pulse"
        )} 
      />
    </Button>
  );
};
