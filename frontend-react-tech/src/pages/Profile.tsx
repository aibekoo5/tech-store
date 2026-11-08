import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/NavLink";
import { User, Heart, Package, Settings, LogOut, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const TABS = ["profile", "orders", "favorites", "settings"] as const;
type Tab = (typeof TABS)[number];

const AuthForm = () => {
  const { login, register } = useStore();
  const { t, tv } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, email, password);
      toast({
        title: mode === "login" ? t("auth.welcome") : t("auth.created"),
        description: t("auth.signedInAs", { name: username }),
      });
    } catch (err) {
      toast({
        title: mode === "login" ? t("auth.loginFailed") : t("auth.registerFailed"),
        description: err instanceof Error ? tv("err", err.message) : t("store.error"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "login" ? t("auth.signIn") : t("auth.createAccount")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("auth.username")}</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 6 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? t("auth.register") : t("auth.signInLink")}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "In Transit":
      return "bg-blue-100 text-blue-800";
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const EmptyState = ({ icon: Icon, title, text }: { icon: typeof Heart; title: string; text?: string }) => {
  const { t } = useI18n();
  return (
    <div className="text-center py-12 bg-card rounded-lg border border-border">
      <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="font-heading text-xl font-semibold mb-2">{title}</h3>
      {text && <p className="text-muted-foreground mb-4">{text}</p>}
      <Button asChild>
        <NavLink to="/catalog">{t("common.browse")}</NavLink>
      </Button>
    </div>
  );
};

const Profile = () => {
  const { user, isAuthLoading, logout, favorites, isFavoritesLoading } = useStore();
  const { t, tv, formatDate } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "orders";

  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: api.getOrders, enabled: !!user });
  const orders = ordersQuery.data ?? [];

  const tabs: { value: Tab; icon: typeof User; label: string }[] = [
    { value: "profile", icon: User, label: t("profile.tabProfile") },
    { value: "orders", icon: Package, label: t("profile.tabOrders") },
    { value: "favorites", icon: Heart, label: t("profile.tabFavorites") },
    { value: "settings", icon: Settings, label: t("profile.tabSettings") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">{t("profile.title")}</h1>
          <p className="text-muted-foreground">{t("profile.subtitle")}</p>
        </div>

        {isAuthLoading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : !user ? (
          <AuthForm />
        ) : (
          <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              {tabs.map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="bg-card rounded-lg border border-border p-6 max-w-2xl">
                <h2 className="font-heading text-2xl font-bold mb-6">{t("profile.info")}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t("profile.username")}</label>
                    <p className="text-lg">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t("profile.email")}</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <Button variant="outline" className="mt-4" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("profile.signOut")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-4">
                <h2 className="font-heading text-2xl font-bold">{t("profile.orderHistory")}</h2>
                {ordersQuery.isLoading ? (
                  <p className="text-muted-foreground">{t("profile.loadingOrders")}</p>
                ) : orders.length === 0 ? (
                  <EmptyState icon={Package} title={t("profile.noOrders")} />
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex flex-wrap items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{t("profile.order", { id: order.id })}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t("profile.placedOn", { date: formatDate(order.createdAt) })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(order.status)}>{tv("status", order.status)}</Badge>
                          <p className="font-bold text-xl text-primary">${order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {order.items.map((item) => (
                          <NavLink key={item.product.id} to={`/product/${item.product.id}`} className="flex gap-3">
                            <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} × ${item.price}
                              </p>
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <div>
                <h2 className="font-heading text-2xl font-bold mb-6">{t("profile.myFavorites")}</h2>
                {isFavoritesLoading ? (
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                ) : favorites.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Heart} title={t("profile.noFavorites")} text={t("profile.noFavoritesText")} />
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-card rounded-lg border border-border p-6 max-w-2xl">
                <h2 className="font-heading text-2xl font-bold mb-6">{t("profile.settings")}</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">{t("profile.notifications")}</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">{t("profile.notifOrders")}</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">{t("profile.notifPromo")}</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">{t("profile.notifRecs")}</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button>{t("profile.save")}</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
