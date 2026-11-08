import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/context/StoreContext";
import { cartTotals } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthLoading, cart: cartItems, isCartLoading, updateQuantity: setQuantity, removeFromCart } = useStore();

  // Errors are reported by the store via toast
  const updateQuantity = (productId: number, delta: number) => {
    const item = cartItems.find((i) => i.product.id === productId);
    if (item) setQuantity(productId, item.quantity + delta).catch(() => {});
  };

  const removeItem = (productId: number) => {
    removeFromCart(productId).catch(() => {});
  };

  const { subtotal, shipping, tax, total } = cartTotals(cartItems);
  const { t, tv } = useI18n();

  const handleCheckout = () => navigate("/checkout");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="font-heading text-4xl font-bold mb-8">{t("cart.title")}</h1>

        {!user && !isAuthLoading ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-semibold mb-2">{t("cart.signInTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("cart.signInText")}</p>
            <Button asChild>
              <NavLink to="/profile">{t("cart.signIn")}</NavLink>
            </Button>
          </div>
        ) : isAuthLoading || isCartLoading ? (
          <p className="text-muted-foreground py-16 text-center">{t("cart.loading")}</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-semibold mb-2">{t("cart.empty")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("cart.emptyText")}
            </p>
            <Button asChild>
              <NavLink to="/catalog">{t("cart.continue")}</NavLink>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-card rounded-lg border border-border p-4 flex gap-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tv("category", item.product.category)}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${item.product.price}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-20">
                <h2 className="font-heading text-xl font-bold mb-4">{t("cart.summary")}</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.shipping")}</span>
                    <span className="font-semibold">
                      {shipping === 0 ? t("cart.free") : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.tax")}</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="font-heading font-semibold text-lg">{t("cart.total")}</span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full btn-gradient" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    {t("cart.checkout")}
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <NavLink to="/catalog">{t("cart.continue")}</NavLink>
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    {shipping === 0 ? (
                      t("cart.freeShippingOk")
                    ) : (
                      t("cart.freeShippingMore", { amount: `$${(50 - subtotal).toFixed(2)}` })
                    )}
                  </p>
                </div>

                {/* Promo Code */}
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">{t("cart.promo")}</label>
                  <div className="flex gap-2">
                    <Input placeholder={t("cart.promoPlaceholder")} />
                    <Button variant="secondary">{t("cart.apply")}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
