import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { categories } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { useI18n } from "@/i18n/I18nContext";
import { SlidersHorizontal } from "lucide-react";

const Catalog = () => {
  const { data: products = [], isLoading, isError } = useProducts();
  const { t, tv } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [showFilters, setShowFilters] = useState(true);

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">{t("catalog.title")}</h1>
          <p className="text-muted-foreground">
            {t("catalog.subtitle", { count: products.length })}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-lg">{t("catalog.filters")}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 3000]);
                  }}
                >
                  {t("catalog.clearAll")}
                </Button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">{t("catalog.categories")}</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategory === category}
                        onCheckedChange={() => setSelectedCategory(category)}
                      />
                      <Label
                        htmlFor={category}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {tv("category", category)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">{t("catalog.priceRange")}</h3>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={3000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showFilters ? t("catalog.hideFilters") : t("catalog.showFilters")}
              </Button>
            </div>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("catalog.showing", { shown: filteredProducts.length, total: products.length })}
              </p>
            </div>

            {/* Products */}
            {isLoading ? (
              <p className="text-muted-foreground py-12 text-center">{t("common.loadingProducts")}</p>
            ) : isError ? (
              <p className="text-destructive py-12 text-center">{t("common.loadError")}</p>
            ) : filteredProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("catalog.noResults")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 3000]);
                  }}
                >
                  {t("catalog.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
