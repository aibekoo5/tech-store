import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, CreditCard, Truck, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, cartTotals } from "@/lib/api";
import { useStore } from "@/context/StoreContext";
import { useI18n } from "@/i18n/I18nContext";

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthLoading, cart, isCartLoading, refreshCart } = useStore();
  const { t, tv } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStep, setOrderStep] = useState<"form" | "processing" | "verifying" | "success">("form");
  const [paidTotal, setPaidTotal] = useState(0);

  const totals = cartTotals(cart);
  // After a successful order the cart is empty, so the success screen shows the server total
  const checkoutData = orderStep === "form" ? totals : { ...totals, total: paidTotal };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setOrderStep("processing");
    try {
      // Card details are not sent anywhere: payment is simulated, the order is real
      const order = await api.checkout();
      setPaidTotal(order.total);
      setOrderStep("verifying");
      refreshCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setTimeout(() => {
        setOrderStep("success");
        toast({
          title: t("checkout.successTitle"),
          description: t("checkout.successText", { id: order.id, total: `$${order.total.toFixed(2)}` }),
        });
        setTimeout(() => navigate("/profile"), 2500);
      }, 1000);
    } catch (err) {
      setOrderStep("form");
      setIsProcessing(false);
      toast({
        title: t("checkout.failed"),
        description: err instanceof Error ? tv("err", err.message) : t("store.error"),
        variant: "destructive",
      });
    }
  };

  if (!isAuthLoading && !user) return <Navigate to="/profile" replace />;
  if (orderStep === "form" && !isCartLoading && !isAuthLoading && cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  if (orderStep !== "form") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
              {orderStep === "processing" && (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="text-lg text-muted-foreground">{t("checkout.processingPayment")}</p>
                </>
              )}
              
              {orderStep === "verifying" && (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="text-lg text-muted-foreground">{t("checkout.verifying")}</p>
                </>
              )}
              
              {orderStep === "success" && (
                <>
                  <CheckCircle2 className="h-20 w-20 text-green-500 animate-scale-in" />
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">{t("checkout.confirmed")}</h2>
                    <p className="text-lg font-semibold text-primary">
                      ${checkoutData.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("checkout.thanks")}
                    </p>
                    <p className="text-xs text-muted-foreground pt-4">
                      {t("checkout.redirect")}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="font-heading text-4xl font-bold mb-8">{t("checkout.title")}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t("checkout.shippingInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("checkout.firstName")}</Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("checkout.lastName")}</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("checkout.email")}</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("checkout.address")}</Label>
                    <Input id="address" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("checkout.city")}</Label>
                      <Input id="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">{t("checkout.zip")}</Label>
                      <Input id="zip" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("checkout.phone")}</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t("checkout.payment")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">{t("checkout.cardNumber")}</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">{t("checkout.expiry")}</Label>
                      <Input id="expiry" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">{t("checkout.cvv")}</Label>
                      <Input id="cvv" placeholder="123" required />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>{t("checkout.secure")}</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full btn-gradient" 
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("checkout.processing")}
                  </>
                ) : (
                  t("checkout.placeOrder")
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>{t("cart.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="font-semibold">${checkoutData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.shipping")}</span>
                    <span className="font-semibold">
                      {checkoutData.shipping === 0 ? t("cart.free") : `$${checkoutData.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.tax")}</span>
                    <span className="font-semibold">${checkoutData.tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-heading font-semibold text-lg">{t("cart.total")}</span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    ${checkoutData.total.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
