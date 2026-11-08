import { Facebook, Instagram, Youtube, Send, Mail, Phone, MapPin } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const linkClass = "text-sm hover:text-primary transition-colors";

export const Footer = () => {
  const { t } = useI18n();

  const quickLinks: [string, TranslationKey][] = [
    ["/", "nav.home"],
    ["/catalog", "nav.catalog"],
    ["/cart", "footer.cart"],
    ["/profile", "footer.account"],
  ];
  const serviceLinks: TranslationKey[] = ["footer.shipping", "footer.returns", "footer.warranty", "footer.faq"];

  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Logo className="mb-4" textClassName="text-secondary-foreground" />
            <p className="text-sm text-secondary-foreground/80 mb-4">{t("footer.tagline")}</p>
            <div className="flex space-x-4">
              {[Instagram, Send, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="hover:text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map(([to, key]) => (
                <li key={to}>
                  <NavLink to={to} className={linkClass}>
                    {t(key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t("footer.service")}</h3>
            <ul className="space-y-2 text-sm">
              {serviceLinks.map((key) => (
                <li key={key}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>{t("footer.address")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>+7 (700) 000-00-00</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>support@arzanall.kz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} ArzanAll. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};
