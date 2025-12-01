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
}

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
    price: 1199,
    originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1696446702183-cbd50c640baa?w=800&q=80",
    rating: 4.8,
    reviews: 1247,
    category: "Smartphones",
    badge: "Best Seller",
    description: "Experience the pinnacle of smartphone technology with the iPhone 15 Pro Max. Featuring the powerful A17 Pro chip, revolutionary camera system, and stunning titanium design.",
    specs: {
      "Display": "6.7-inch Super Retina XDR",
      "Processor": "A17 Pro chip",
      "Storage": "256GB",
      "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      "Battery": "Up to 29 hours video playback",
    },
    inStock: true,
  },
  {
    id: 2,
    name: "MacBook Pro 16\" M3 Pro",
    price: 2499,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    rating: 4.9,
    reviews: 856,
    category: "Laptops",
    badge: "New",
    description: "Supercharged by the M3 Pro chip, the MacBook Pro delivers exceptional performance for demanding workflows. Perfect for professionals and creators.",
    specs: {
      "Display": "16.2-inch Liquid Retina XDR",
      "Processor": "Apple M3 Pro chip",
      "Memory": "18GB unified memory",
      "Storage": "512GB SSD",
      "Battery": "Up to 22 hours",
    },
    inStock: true,
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    price: 1299,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    rating: 4.7,
    reviews: 934,
    category: "Smartphones",
    description: "The ultimate Android flagship with S Pen, powerful AI features, and a stunning 200MP camera system.",
    specs: {
      "Display": "6.8-inch Dynamic AMOLED 2X",
      "Processor": "Snapdragon 8 Gen 3",
      "Storage": "256GB",
      "Camera": "200MP Main + 50MP Periscope + 12MP Ultra Wide",
      "Battery": "5000mAh",
    },
    inStock: true,
  },
  {
    id: 4,
    name: "Dell XPS 15 Laptop",
    price: 1899,
    originalPrice: 2199,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
    rating: 4.6,
    reviews: 542,
    category: "Laptops",
    badge: "Sale",
    description: "Premium Windows laptop with stunning OLED display and powerful performance for creative professionals.",
    specs: {
      "Display": "15.6-inch OLED 3.5K",
      "Processor": "Intel Core i7-13700H",
      "Memory": "16GB DDR5",
      "Storage": "512GB SSD",
      "Graphics": "NVIDIA RTX 4050",
    },
    inStock: true,
  },
  {
    id: 5,
    name: "Sony WH-1000XM5 Headphones",
    price: 399,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    rating: 4.8,
    reviews: 2134,
    category: "Accessories",
    badge: "Recommended",
    description: "Industry-leading noise cancellation with exceptional sound quality and all-day comfort.",
    specs: {
      "Type": "Over-ear, Wireless",
      "Noise Cancellation": "Industry-leading ANC",
      "Battery": "Up to 30 hours",
      "Connectivity": "Bluetooth 5.2, Multi-point",
      "Features": "LDAC, 360 Reality Audio",
    },
    inStock: true,
  },
  {
    id: 6,
    name: "iPad Pro 12.9\" M2",
    price: 1099,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    rating: 4.7,
    reviews: 678,
    category: "Tablets",
    description: "The ultimate iPad experience with M2 chip, stunning Liquid Retina XDR display, and Apple Pencil support.",
    specs: {
      "Display": "12.9-inch Liquid Retina XDR",
      "Processor": "Apple M2 chip",
      "Storage": "256GB",
      "Camera": "12MP Wide + 10MP Ultra Wide",
      "Connectivity": "Wi-Fi 6E + 5G",
    },
    inStock: true,
  },
  {
    id: 7,
    name: "Apple Watch Series 9",
    price: 429,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80",
    rating: 4.6,
    reviews: 1523,
    category: "Wearables",
    description: "Your ultimate health and fitness companion with advanced sensors and all-day battery life.",
    specs: {
      "Display": "Always-On Retina LTPO OLED",
      "Processor": "S9 SiP",
      "Size": "45mm",
      "Sensors": "Blood Oxygen, ECG, Heart Rate",
      "Water Resistance": "50 meters",
    },
    inStock: true,
  },
  {
    id: 8,
    name: "Samsung 65\" QLED 4K TV",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
    rating: 4.5,
    reviews: 432,
    category: "TVs",
    badge: "Sale",
    description: "Immersive 4K entertainment with Quantum Dot technology and smart TV features.",
    specs: {
      "Display": "65-inch QLED 4K",
      "Refresh Rate": "120Hz",
      "HDR": "HDR10+, Quantum HDR",
      "Smart TV": "Tizen OS",
      "Gaming": "Game Mode Pro, FreeSync",
    },
    inStock: true,
  },
];

export const categories = [
  "All",
  "Smartphones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Wearables",
  "TVs",
];
