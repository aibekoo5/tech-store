import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, type Product } from "@/data/products";
import type { ProductInput } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

const BADGES = ["Best Seller", "New", "Recommended", "Sale"];
const NO_BADGE = "__none__"; // Radix Select does not allow an empty-string value

interface FormState {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  stock: string;
  category: string;
  badge: string;
  rating: string;
  reviews: string;
  specs: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  imageUrl: "",
  stock: "10",
  category: "Smartphones",
  badge: NO_BADGE,
  rating: "0",
  reviews: "0",
  specs: "",
};

const fromProduct = (p: Product): FormState => ({
  name: p.name,
  description: p.description,
  price: String(p.price),
  originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
  imageUrl: p.image === "/placeholder.svg" ? "" : p.image,
  stock: String(p.stock),
  category: p.category,
  badge: p.badge ?? NO_BADGE,
  rating: String(p.rating),
  reviews: String(p.reviews),
  specs: Object.entries(p.specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n"),
});

const parseSpecs = (text: string): Record<string, string> =>
  Object.fromEntries(
    text
      .split("\n")
      .map((line) => {
        const i = line.indexOf(":");
        return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : null;
      })
      .filter((e): e is [string, string] => !!e && !!e[0] && !!e[1])
  );

const toInput = (f: FormState): ProductInput | null => {
  const price = Number(f.price);
  if (!f.name.trim() || !f.category || !Number.isFinite(price) || price <= 0) return null;
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    price,
    originalPrice: f.originalPrice.trim() ? Number(f.originalPrice) || null : null,
    imageUrl: f.imageUrl.trim(),
    stock: Math.max(0, Math.floor(Number(f.stock) || 0)),
    category: f.category,
    badge: f.badge === NO_BADGE ? null : f.badge,
    rating: clamp(Number(f.rating) || 0, 0, 5),
    reviews: Math.max(0, Math.floor(Number(f.reviews) || 0)),
    specs: parseSpecs(f.specs),
  };
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Product to edit; null = create a new one */
  product: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
}

export const ProductFormDialog = ({ open, onOpenChange, product, onSubmit }: Props) => {
  const { t, tv } = useI18n();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(product ? fromProduct(product) : emptyForm);
      setShowError(false);
    }
  }, [open, product]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = toInput(form);
    if (!input) {
      setShowError(true);
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit(input);
      onOpenChange(false);
    } catch {
      /* parent shows a toast */
    } finally {
      setIsSaving(false);
    }
  };

  const optional = <span className="text-muted-foreground font-normal">({t("admin.optional")})</span>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t("admin.editProduct") : t("admin.newProduct")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">{t("admin.fieldName")}</Label>
            <Input id="p-name" value={form.name} onChange={set("name")} required maxLength={256} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-desc">
              {t("admin.fieldDescription")} {optional}
            </Label>
            <Textarea id="p-desc" rows={3} value={form.description} onChange={set("description")} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">{t("admin.fieldPrice")}</Label>
              <Input id="p-price" type="number" min="0.01" step="0.01" value={form.price} onChange={set("price")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-old">
                {t("admin.fieldOldPrice")} {optional}
              </Label>
              <Input id="p-old" type="number" min="0" step="0.01" value={form.originalPrice} onChange={set("originalPrice")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">{t("admin.fieldStock")}</Label>
              <Input id="p-stock" type="number" min="0" step="1" value={form.stock} onChange={set("stock")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("admin.fieldCategory")}</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {tv("category", c)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.fieldBadge")}</Label>
              <Select value={form.badge} onValueChange={(v) => setForm((f) => ({ ...f, badge: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BADGE}>{t("admin.noBadge")}</SelectItem>
                  {BADGES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {tv("badge", b)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="p-img">
                {t("admin.fieldImage")} {optional}
              </Label>
              <Input id="p-img" type="url" placeholder="https://..." value={form.imageUrl} onChange={set("imageUrl")} />
            </div>
            <img
              src={form.imageUrl || "/placeholder.svg"}
              alt={t("admin.preview")}
              className="h-10 w-10 rounded object-cover border border-border"
              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-rating">{t("admin.fieldRating")}</Label>
              <Input id="p-rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={set("rating")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-reviews">{t("admin.fieldReviews")}</Label>
              <Input id="p-reviews" type="number" min="0" step="1" value={form.reviews} onChange={set("reviews")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-specs">
              {t("admin.fieldSpecs")} {optional}
            </Label>
            <Textarea
              id="p-specs"
              rows={5}
              className="font-mono text-sm"
              placeholder={t("admin.specsHint")}
              value={form.specs}
              onChange={set("specs")}
            />
            <p className="text-xs text-muted-foreground">{t("admin.specsHint")}</p>
          </div>

          {showError && <p className="text-sm text-destructive">{t("admin.invalid")}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("admin.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("admin.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
