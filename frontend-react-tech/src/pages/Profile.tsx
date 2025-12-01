import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/products";
import { User, Heart, Package, Settings } from "lucide-react";

const Profile = () => {
  const [favorites] = useState([products[0], products[2], products[4], products[6]]);

  const orders = [
    {
      id: "ORD-2024-001",
      date: "2024-03-15",
      status: "Delivered",
      total: 2698,
      items: [products[0], products[4]],
    },
    {
      id: "ORD-2024-002",
      date: "2024-03-10",
      status: "In Transit",
      total: 2499,
      items: [products[1]],
    },
    {
      id: "ORD-2024-003",
      date: "2024-02-28",
      status: "Delivered",
      total: 1299,
      items: [products[2]],
    },
  ];

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and favorites</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card rounded-lg border border-border p-6 max-w-2xl">
              <h2 className="font-heading text-2xl font-bold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <p className="text-lg">John Doe</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <p className="text-lg">john.doe@example.com</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <p className="text-lg">+1 (555) 123-4567</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Address</label>
                  <p className="text-lg">123 Tech Street, Digital City, TC 12345</p>
                </div>
                <Button className="mt-4">Edit Profile</Button>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-bold">Order History</h2>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <p className="font-bold text-xl text-primary">${order.total}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {order.status === "Delivered" && (
                      <Button variant="outline" size="sm">
                        Buy Again
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">My Favorites</h2>
              {favorites.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {favorites.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-heading text-xl font-semibold mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding products to your favorites!
                  </p>
                  <Button>Browse Products</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-card rounded-lg border border-border p-6 max-w-2xl">
              <h2 className="font-heading text-2xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Email Notifications</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Order updates</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Promotions and deals</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Product recommendations</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Privacy</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Show profile publicly</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Share purchase history for recommendations</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="mr-2">Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
