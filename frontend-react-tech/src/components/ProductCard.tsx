import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/context/StoreContext";
import { useI18n } from "@/i18n/I18nContext";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  className?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  badge,
  className,
}: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { addToCart, isFavorite: checkFavorite, toggleFavorite } = useStore();
  const { t, tv } = useI18n();
  const isFavorite = checkFavorite(id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;
    setIsPending(true);
    try {
      if (await addToCart(id)) {
        setIsAddingToCart(true);
        setTimeout(() => setIsAddingToCart(false), 1000);
      }
    } catch {
      /* toast already shown */
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(id);
  };

  return (
    <NavLink to={`/product/${id}`} className={cn("group block", className)}>
      <div className="product-card relative">
        {/* Badge */}
        {badge && (
          <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground">
            {tv("badge", badge)}
          </Badge>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 z-10 bg-white/90 hover:bg-white transition-all",
            isFavorite && "text-red-500"
          )}
          onClick={handleToggleFavorite}
          aria-label={t("nav.favorites")}
          aria-pressed={isFavorite}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </Button>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-primary">${price}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className={cn(
              "w-full transition-all",
              isAddingToCart && "bg-green-600 hover:bg-green-600"
            )}
            onClick={handleAddToCart}
            disabled={isPending}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAddingToCart ? t("common.added") : t("common.addToCart")}
          </Button>
        </div>
      </div>
    </NavLink>
  );
};
