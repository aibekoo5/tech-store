import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, ApiError, tokenStorage, type CartItem, type User } from "@/lib/api";
import type { Product } from "@/data/products";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";

interface StoreContextValue {
  user: User | null;
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  cart: CartItem[];
  cartCount: number;
  isCartLoading: boolean;
  /** Returns false if the user had to be sent to the login page */
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  refreshCart: () => void;

  favorites: Product[];
  isFavoritesLoading: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t, tv } = useI18n();
  const [token, setToken] = useState(tokenStorage.get());

  const errorMessage = (e: unknown) => (e instanceof Error && e.message ? tv("err", e.message) : t("store.error"));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    for (const key of ["me", "cart", "orders", "favorites", "admin"]) queryClient.removeQueries({ queryKey: [key] });
  }, [queryClient]);

  const meQuery = useQuery({
    queryKey: ["me", token],
    queryFn: api.me,
    enabled: !!token,
    retry: false,
  });

  // Expired/invalid token -> log out silently
  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) logout();
  }, [meQuery.error, logout]);

  const user = token ? meQuery.data ?? null : null;

  const requireLogin = (description: string) => {
    toast({ title: t("store.signInTitle"), description });
    navigate("/profile");
  };

  // ---- cart ----
  const cartQuery = useQuery({ queryKey: ["cart", token], queryFn: api.getCart, enabled: !!user });

  const cartMutation = useMutation({
    mutationFn: (fn: () => Promise<CartItem[]>) => fn(),
    onSuccess: (items) => queryClient.setQueryData(["cart", token], items),
    onError: (e) => toast({ title: t("store.cartError"), description: errorMessage(e), variant: "destructive" }),
  });

  const addToCart = async (productId: number, quantity = 1) => {
    if (!token) {
      requireLogin(t("store.signInCart"));
      return false;
    }
    await cartMutation.mutateAsync(() => api.addToCart(productId, quantity));
    return true;
  };

  const cart = cartQuery.data ?? [];

  // ---- favorites ----
  const favoritesQuery = useQuery({ queryKey: ["favorites", token], queryFn: api.getFavorites, enabled: !!user });
  const favorites = useMemo(() => favoritesQuery.data ?? [], [favoritesQuery.data]);
  const favoriteIds = useMemo(() => new Set(favorites.map((p) => p.id)), [favorites]);

  const favoriteMutation = useMutation({
    mutationFn: ({ productId, add }: { productId: number; add: boolean }) =>
      add ? api.addFavorite(productId) : api.removeFavorite(productId),
    // Optimistic update: heart reacts instantly, rolled back on error
    onMutate: async ({ productId, add }) => {
      const key = ["favorites", token];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Product[]>(key);
      if (!add) queryClient.setQueryData<Product[]>(key, (old = []) => old.filter((p) => p.id !== productId));
      return { previous };
    },
    onSuccess: (list) => queryClient.setQueryData(["favorites", token], list),
    onError: (e, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["favorites", token], ctx.previous);
      toast({ title: t("store.favError"), description: errorMessage(e), variant: "destructive" });
    },
  });

  const toggleFavorite = async (productId: number) => {
    if (!token) {
      requireLogin(t("store.signInFav"));
      return;
    }
    await favoriteMutation.mutateAsync({ productId, add: !favoriteIds.has(productId) }).catch(() => {});
  };

  // ---- auth ----
  const login = async (username: string, password: string) => {
    const { access_token } = await api.login(username, password);
    tokenStorage.set(access_token);
    setToken(access_token);
  };

  const register = async (username: string, email: string, password: string) => {
    await api.register(username, email, password);
    await login(username, password);
  };

  const value: StoreContextValue = {
    user,
    isAuthLoading: !!token && meQuery.isLoading,
    login,
    register,
    logout,

    cart,
    cartCount: cart.reduce((n, i) => n + i.quantity, 0),
    isCartLoading: cartQuery.isLoading,
    addToCart,
    updateQuantity: async (productId, quantity) => {
      await cartMutation.mutateAsync(() => api.updateCartItem(productId, quantity));
    },
    removeFromCart: async (productId) => {
      await cartMutation.mutateAsync(() => api.removeFromCart(productId));
    },
    refreshCart: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),

    favorites,
    isFavoritesLoading: favoritesQuery.isLoading,
    isFavorite: (productId) => favoriteIds.has(productId),
    toggleFavorite,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
};
