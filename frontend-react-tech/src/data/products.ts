export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  badge?: string;
  description: string;
  specs: {
    [key: string]: string;
  };
  inStock: boolean;
  stock: number;
}

// Products are loaded from the backend (GET /products), see src/lib/api.ts

export const categories = [
  "All",
  "Smartphones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Wearables",
  "TVs",
];
