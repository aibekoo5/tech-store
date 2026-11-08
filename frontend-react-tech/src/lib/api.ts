import type { Product } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "techwave_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d: { msg: string }) => d.msg).join(", ");
    } catch {
      /* not JSON */
    }
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// ---- Backend shapes ----
interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock: number;
  category: string | null;
  badge: string | null;
  rating: number;
  reviews: number;
  specs: Record<string, string>;
}

interface ApiCartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: ApiProduct;
}

interface ApiOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: ApiProduct;
}

interface ApiOrder {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items: ApiOrderItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: { product: Product; quantity: number; price: number }[];
}

const toProduct = (p: ApiProduct): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.original_price ?? undefined,
  image: p.image_url ?? "/placeholder.svg",
  rating: p.rating,
  reviews: p.reviews,
  category: p.category ?? "Other",
  badge: p.badge ?? undefined,
  description: p.description ?? "",
  specs: p.specs ?? {},
  inStock: p.stock > 0,
});

const toCart = (c: { items: ApiCartItem[] }): CartItem[] =>
  c.items
    .map((i) => ({ product: toProduct(i.product), quantity: i.quantity }))
    .sort((a, b) => a.product.id - b.product.id);

const toOrder = (o: ApiOrder): Order => ({
  id: o.id,
  total: o.total_price,
  status: o.status,
  createdAt: o.created_at,
  items: o.items.map((i) => ({ product: toProduct(i.product), quantity: i.quantity, price: i.price })),
});

const post = (body?: unknown): RequestInit => ({
  method: "POST",
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  // products
  getProducts: async () => (await request<ApiProduct[]>("/products/")).map(toProduct),
  getProduct: async (id: number) => toProduct(await request<ApiProduct>(`/products/${id}`)),

  // auth
  login: (username: string, password: string) =>
    request<{ access_token: string }>("/users/login", post({ username, password })),
  register: (username: string, email: string, password: string) =>
    request<User>("/users/register", post({ username, email, password })),
  me: () => request<User>("/users/me"),

  // cart
  getCart: async () => toCart(await request("/cart/")),
  addToCart: async (productId: number, quantity = 1) =>
    toCart(await request("/cart/add", post({ product_id: productId, quantity }))),
  updateCartItem: async (productId: number, quantity: number) =>
    toCart(await request("/cart/update", post({ product_id: productId, quantity }))),
  removeFromCart: async (productId: number) =>
    toCart(await request("/cart/remove", post({ product_id: productId, quantity: 0 }))),

  // favorites (each call returns the updated list)
  getFavorites: async () => (await request<ApiProduct[]>("/favorites/")).map(toProduct),
  addFavorite: async (productId: number) =>
    (await request<ApiProduct[]>(`/favorites/${productId}`, { method: "POST" })).map(toProduct),
  removeFavorite: async (productId: number) =>
    (await request<ApiProduct[]>(`/favorites/${productId}`, { method: "DELETE" })).map(toProduct),

  // orders
  getOrders: async () => (await request<ApiOrder[]>("/orders/")).map(toOrder),
  checkout: async () => toOrder(await request<ApiOrder>("/orders/checkout", post())),
};

/** Same rules as the backend /orders/checkout */
export const cartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
};
