import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { NavLink } from "@/components/NavLink";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useI18n } from "@/i18n/I18nContext";

const Index = () => {
  const { data: products = [], isLoading, isError } = useProducts();
  const { t } = useI18n();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-lightCyan to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
                {t("home.heroTitle1")}
                <span className="text-primary block">{t("home.heroTitle2")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {t("home.heroText")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="btn-gradient" asChild>
                  <NavLink to="/catalog">
                    {t("home.shopNow")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </NavLink>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <NavLink to="/catalog">{t("home.viewCatalog")}</NavLink>
                </Button>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <img
                src={heroBanner}
                alt={t("home.heroAlt")}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 animate-slide-up">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-1">{t("home.freeShipping")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.freeShippingText")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-1">{t("home.warranty")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.warrantyText")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-1">{t("home.fastDelivery")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.fastDeliveryText")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold mb-2">{t("home.featured")}</h2>
              <p className="text-muted-foreground">{t("home.featuredText")}</p>
            </div>
            <Button variant="outline" asChild>
              <NavLink to="/catalog">
                {t("home.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </NavLink>
            </Button>
          </div>

          {isLoading && <p className="text-muted-foreground">{t("common.loadingProducts")}</p>}
          {isError && <p className="text-destructive">{t("common.loadError")}</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            {t("home.ctaText")}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <NavLink to="/catalog">
              {t("home.startShopping")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </NavLink>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
