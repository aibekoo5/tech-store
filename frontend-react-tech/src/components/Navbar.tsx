import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { ShoppingCart, Heart, User, Menu, X, Search, Globe, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";
import { useStore } from "@/context/StoreContext";
import { useI18n } from "@/i18n/I18nContext";
import { LANGUAGES } from "@/i18n/translations";

const CountBadge = ({ count }: { count: number }) =>
  count > 0 ? (
    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 bg-primary text-xs">
      {count > 99 ? "99+" : count}
    </Badge>
  ) : null;

const LanguageSwitcher = () => {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-primary/10 gap-1 px-2" aria-label={t("nav.language")}>
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="gap-2">
            <Check className={l.code === lang ? "h-4 w-4" : "h-4 w-4 invisible"} />
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, favorites, user } = useStore();
  const { t } = useI18n();

  const linkClass = "text-sm font-medium text-muted-foreground hover:text-primary transition-colors";
  const mobileLinkClass = `block py-2 ${linkClass}`;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" aria-label="ArzanAll">
            <Logo compact />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" end className={linkClass} activeClassName="text-primary">
              {t("nav.home")}
            </NavLink>
            <NavLink to="/catalog" className={linkClass} activeClassName="text-primary">
              {t("nav.catalog")}
            </NavLink>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder={t("nav.search")} className="pl-10 bg-muted/50" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <LanguageSwitcher />

            {user?.is_admin && (
              <NavLink to="/admin" className="hidden sm:block" aria-label={t("admin.link")}>
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 gap-1 px-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="hidden lg:inline text-sm font-medium">{t("admin.link")}</span>
                </Button>
              </NavLink>
            )}

            <NavLink to="/profile?tab=favorites" className="relative hidden sm:block" aria-label={t("nav.favorites")}>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Heart className="h-5 w-5" />
                <CountBadge count={favorites.length} />
              </Button>
            </NavLink>

            <NavLink to="/cart" className="relative" aria-label={t("nav.cart")}>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ShoppingCart className="h-5 w-5" />
                <CountBadge count={cartCount} />
              </Button>
            </NavLink>

            <NavLink to="/profile" className="hidden sm:flex items-center gap-2" aria-label={t("nav.account")}>
              <Button variant="ghost" size={user ? "default" : "icon"} className="hover:bg-primary/10">
                <User className="h-5 w-5" />
                {user && <span className="text-sm font-medium">{user.username}</span>}
              </Button>
            </NavLink>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder={t("nav.search")} className="pl-10 bg-muted/50" />
            </div>
            <NavLink to="/" end className={mobileLinkClass} activeClassName="text-primary" onClick={() => setIsMenuOpen(false)}>
              {t("nav.home")}
            </NavLink>
            <NavLink to="/catalog" className={mobileLinkClass} activeClassName="text-primary" onClick={() => setIsMenuOpen(false)}>
              {t("nav.catalog")}
            </NavLink>
            <NavLink to="/profile?tab=favorites" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
              {t("nav.favorites")}
            </NavLink>
            <NavLink to="/profile" className={mobileLinkClass} activeClassName="text-primary" onClick={() => setIsMenuOpen(false)}>
              {t("nav.profile")}
            </NavLink>
            {user?.is_admin && (
              <NavLink to="/admin" className={mobileLinkClass} activeClassName="text-primary" onClick={() => setIsMenuOpen(false)}>
                {t("admin.link")}
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
