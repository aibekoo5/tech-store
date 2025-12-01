import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { ShoppingCart, Heart, User, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">TW</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground hidden sm:block">
              TechWave
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              end
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <NavLink
              to="/catalog"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Catalog
            </NavLink>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <NavLink to="/profile" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Heart className="h-5 w-5" />
              </Button>
            </NavLink>
            
            <NavLink to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </NavLink>

            <NavLink to="/profile" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <User className="h-5 w-5" />
              </Button>
            </NavLink>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 bg-muted/50"
              />
            </div>
            <NavLink
              to="/"
              end
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/catalog"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Catalog
            </NavLink>
            <NavLink
              to="/profile"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};
