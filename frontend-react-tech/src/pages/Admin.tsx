import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/context/StoreContext";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "@/hooks/use-toast";
import { adminApi, ORDER_STATUSES, type OrderStatus, type ProductInput } from "@/lib/api";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

const TABS = ["dashboard", "products", "orders", "users"] as const;
type Tab = (typeof TABS)[number];

const STATUS_COLORS: Record<string, string> = {
  Processing: "bg-yellow-100 text-yellow-800",
  "In Transit": "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-200 text-gray-700",
};

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Shows backend errors as a translated toast */
const useErrorToast = () => {
  const { t, tv } = useI18n();
  return (e: unknown) =>
    toast({
      title: t("admin.error"),
      description: e instanceof Error ? tv("err", e.message) : t("store.error"),
      variant: "destructive",
    });
};

// ---------------- Dashboard ----------------
const Dashboard = () => {
  const { t, tv } = useI18n();
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: adminApi.stats });

  if (isLoading || !stats) return <p className="text-muted-foreground">{t("common.loading")}</p>;

  const cards = [
    { icon: DollarSign, label: t("admin.revenue"), value: money(stats.revenue), hint: t("admin.revenueHint") },
    { icon: ShoppingBag, label: t("admin.ordersCount"), value: stats.orders },
    { icon: Package, label: t("admin.productsCount"), value: stats.products },
    { icon: Users, label: t("admin.usersCount"), value: stats.users },
  ];
  const maxStatus = Math.max(1, ...Object.values(stats.orders_by_status));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, hint }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("admin.ordersByStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ORDER_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-32 text-sm shrink-0">{tv("status", s)}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(stats.orders_by_status[s] / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold tabular-nums">{stats.orders_by_status[s]}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(stats.low_stock > 0 && "border-amber-300")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className={cn("p-3 rounded-lg", stats.low_stock > 0 ? "bg-amber-100" : "bg-primary/10")}>
              <AlertTriangle className={cn("h-5 w-5", stats.low_stock > 0 ? "text-amber-600" : "text-primary")} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.lowStock")}</p>
              <p className="text-2xl font-bold">{stats.low_stock}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---------------- Products ----------------
const ProductsTab = () => {
  const { t, tv } = useI18n();
  const showError = useErrorToast();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...products]
      .sort((a, b) => a.id - b.id)
      .filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, search]);

  const handleSubmit = async (input: ProductInput) => {
    try {
      if (editing) await adminApi.updateProduct(editing.id, input);
      else await adminApi.createProduct(input);
      toast({ title: editing ? t("admin.saved") : t("admin.created"), description: input.name });
      refresh();
    } catch (e) {
      showError(e);
      throw e; // keep the dialog open
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (p: Product) => adminApi.deleteProduct(p.id),
    onSuccess: (_, p) => {
      toast({ title: t("admin.deleted"), description: p.name });
      refresh();
    },
    onError: showError,
    onSettled: () => setToDelete(null),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={t("admin.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addProduct")}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.colProduct")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("admin.colCategory")}</TableHead>
              <TableHead className="text-right">{t("admin.colPrice")}</TableHead>
              <TableHead className="text-right">{t("admin.colStock")}</TableHead>
              <TableHead className="text-right">{t("admin.colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  {t("common.loading")}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center py-8">
                  {t("admin.noProducts")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <NavLink to={`/product/${p.id}`} className="flex items-center gap-3 hover:text-primary">
                      <img src={p.image} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[220px] lg:max-w-[360px]">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          #{p.id}
                          {p.badge && <> · {tv("badge", p.badge)}</>}
                        </p>
                      </div>
                    </NavLink>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{tv("category", p.category)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="font-semibold">${p.price}</span>
                    {p.originalPrice && <span className="block text-xs text-muted-foreground line-through">${p.originalPrice}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "tabular-nums",
                        p.stock === 0 && "border-destructive text-destructive",
                        p.stock > 0 && p.stock <= 5 && "border-amber-400 text-amber-700"
                      )}
                    >
                      {p.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("admin.edit")}
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      aria-label={t("admin.delete")}
                      onClick={() => setToDelete(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} onSubmit={handleSubmit} />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.deleteText", { name: toDelete?.name ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault(); // keep open until the request finishes
                if (toDelete) deleteMutation.mutate(toDelete);
              }}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ---------------- Orders ----------------
const OrdersTab = () => {
  const { t, tv, formatDate } = useI18n();
  const showError = useErrorToast();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin", "orders"], queryFn: adminApi.orders });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => adminApi.setOrderStatus(id, status),
    onSuccess: (order) => {
      queryClient.setQueryData(["admin", "orders"], (old: typeof orders = []) => old.map((o) => (o.id === order.id ? order : o)));
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: t("admin.statusUpdated", { id: order.id, status: tv("status", order.status) }) });
    },
    onError: showError,
  });

  if (isLoading) return <p className="text-muted-foreground">{t("common.loading")}</p>;
  if (orders.length === 0)
    return <p className="text-muted-foreground text-center py-12 bg-card rounded-lg border border-border">{t("admin.noOrders")}</p>;

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t("admin.colCustomer")}</TableHead>
            <TableHead className="hidden lg:table-cell">{t("admin.colItems")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("admin.colDate")}</TableHead>
            <TableHead className="text-right">{t("admin.colTotal")}</TableHead>
            <TableHead>{t("admin.colStatus")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.id}</TableCell>
              <TableCell>
                <p className="font-medium">{o.username}</p>
                <p className="text-xs text-muted-foreground">{o.email}</p>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="space-y-1">
                  {o.items.map((i) => (
                    <p key={i.product.id} className="text-sm truncate max-w-[280px]">
                      {i.quantity} × {i.product.name}
                    </p>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDate(o.createdAt)}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{money(o.total)}</TableCell>
              <TableCell>
                <Select
                  value={o.status}
                  onValueChange={(status) => statusMutation.mutate({ id: o.id, status: status as OrderStatus })}
                >
                  <SelectTrigger className={cn("w-36 h-8 text-xs border-0", STATUS_COLORS[o.status])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {tv("status", s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ---------------- Users ----------------
const UsersTab = () => {
  const { t, formatDate } = useI18n();
  const showError = useErrorToast();
  const queryClient = useQueryClient();
  const { user: me } = useStore();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: adminApi.users });

  const roleMutation = useMutation({
    mutationFn: ({ id, isAdmin }: { id: number; isAdmin: boolean }) => adminApi.setAdmin(id, isAdmin),
    onSuccess: (u) => {
      queryClient.setQueryData(["admin", "users"], (old: typeof users = []) => old.map((x) => (x.id === u.id ? u : x)));
      toast({ title: t("admin.roleUpdated", { name: u.username }) });
    },
    onError: showError,
  });

  if (isLoading) return <p className="text-muted-foreground">{t("common.loading")}</p>;

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.colUser")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("admin.colRegistered")}</TableHead>
            <TableHead className="text-right">{t("admin.colOrders")}</TableHead>
            <TableHead>{t("admin.colRole")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="font-medium">
                    {u.username} {isMe && <span className="text-xs text-muted-foreground">({t("admin.you")})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDate(u.created_at)}</TableCell>
                <TableCell className="text-right tabular-nums">{u.orders_count}</TableCell>
                <TableCell>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <Switch
                      checked={u.is_admin}
                      disabled={isMe || roleMutation.isPending}
                      onCheckedChange={(v) => roleMutation.mutate({ id: u.id, isAdmin: v })}
                    />
                    <span className={cn("text-sm", u.is_admin && "font-medium text-primary")}>
                      {u.is_admin ? t("admin.roleAdmin") : t("admin.roleCustomer")}
                    </span>
                  </label>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// ---------------- Page ----------------
const Admin = () => {
  const { t } = useI18n();
  const { user, isAuthLoading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "dashboard";

  const tabs: { value: Tab; icon: typeof Package; label: string }[] = [
    { value: "dashboard", icon: LayoutDashboard, label: t("admin.tabDashboard") },
    { value: "products", icon: Package, label: t("admin.tabProducts") },
    { value: "orders", icon: ShoppingBag, label: t("admin.tabOrders") },
    { value: "users", icon: Users, label: t("admin.tabUsers") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        {isAuthLoading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : !user?.is_admin ? (
          <div className="text-center py-16">
            <ShieldCheck className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
            <h1 className="font-heading text-2xl font-bold mb-2">{t("admin.forbidden")}</h1>
            <p className="text-muted-foreground mb-6">{t("admin.forbiddenText")}</p>
            <Button asChild>
              <NavLink to={user ? "/" : "/profile"}>{user ? t("notFound.back") : t("auth.signIn")}</NavLink>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-heading text-4xl font-bold mb-2 flex items-center gap-3">
                <ShieldCheck className="h-9 w-9 text-primary" />
                {t("admin.title")}
              </h1>
              <p className="text-muted-foreground">{t("admin.subtitle")}</p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })} className="space-y-6">
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                {tabs.map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="dashboard">
                <Dashboard />
              </TabsContent>
              <TabsContent value="products">
                <ProductsTab />
              </TabsContent>
              <TabsContent value="orders">
                <OrdersTab />
              </TabsContent>
              <TabsContent value="users">
                <UsersTab />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
