import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useStore } from "@/context/StoreContext";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(Number(id));
  const { data: products = [] } = useProducts();
  const { addToCart, isFavorite: checkFavorite, toggleFavorite } = useStore();
  const { t, tv } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <p className="container mx-auto px-4 py-16 flex-1 text-muted-foreground">{t("product.loading")}</p>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return <Navigate to="/catalog" replace />;
  }

  const handleAdd = async (goToCart = false) => {
    setIsAdding(true);
    try {
      if (await addToCart(product.id, quantity)) {
        if (goToCart) navigate("/cart");
        else toast({ title: t("product.added"), description: `${quantity} × ${product.name}` });
      }
    } catch {
      /* toast already shown */
    } finally {
      setIsAdding(false);
    }
  };

  const isFavorite = checkFavorite(product.id);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  {tv("badge", product.badge)}
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {tv("category", product.category)}
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({t("product.reviews", { count: product.reviews })})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-4xl font-bold text-primary">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {t("product.inStock")}
                  </Badge>
                ) : (
                  <Badge variant="destructive">{t("product.outOfStock")}</Badge>
                )}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 btn-gradient"
                  disabled={!product.inStock || isAdding}
                  onClick={() => handleAdd()}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t("common.addToCart")}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={t("nav.favorites")}
                  aria-pressed={isFavorite}
                  className={cn(isFavorite && "text-red-500")}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </Button>
              </div>

              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                disabled={!product.inStock || isAdding}
                onClick={() => handleAdd(true)}
              >
                {t("product.buyNow")}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">{t("product.freeShipping")}</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">{t("product.warranty")}</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">{t("product.returns")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mb-16">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="specs">{t("product.specs")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("product.reviewsTab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">
                {t("product.techSpecs")}
              </h3>
              <dl className="grid gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex border-b border-border pb-3">
                    <dt className="font-semibold w-1/3">{key}</dt>
                    <dd className="text-muted-foreground w-2/3">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">
                {t("product.customerReviews")}
              </h3>
              <p className="text-muted-foreground">
                {t("product.reviewsSoon", { count: product.reviews })}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">{t("product.related")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
