import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { LANGUAGES, LOCALES, translations, type Lang, type TranslationKey } from "./translations";

const STORAGE_KEY = "arzanall_lang";

type Vars = Record<string, string | number>;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
  /** Translate a dynamic value (category, badge, status) with fallback to the raw value */
  tv: (prefix: "category" | "badge" | "status" | "err", value: string) => string;
  formatDate: (iso: string) => string;
}

const isLang = (v: string | null): v is Lang => LANGUAGES.some((l) => l.code === v);

const detectLang = (): Lang => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (isLang(saved)) return saved;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === "kk") return "kk";
  if (browser === "en") return "en";
  return "ru";
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => {
      let text = translations[lang][key] ?? translations.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
      return text;
    },
    [lang]
  );

  const tv = useCallback(
    (prefix: "category" | "badge" | "status" | "err", value: string) =>
      translations[lang][`${prefix}.${value}` as TranslationKey] ?? value,
    [lang]
  );

  const formatDate = useCallback((iso: string) => new Date(iso).toLocaleDateString(LOCALES[lang]), [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t, tv, formatDate }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
};
