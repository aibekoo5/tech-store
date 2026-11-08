import { useId } from "react";
import { cn } from "@/lib/utils";

/** ArzanAll mark: an "A" with a price tag ("arzan" = affordable). Same artwork as public/favicon.svg */
export const LogoMark = ({ className }: { className?: string }) => {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 48 48" className={cn("h-10 w-10 shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3dd6c4" />
          <stop offset="1" stopColor="#008080" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gradientId})`} />
      <path d="M13 36 L22 12 L31 36" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 28 H27" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M30.5 13.5 L37 13.5 L37 20 L33.5 23.5 L27 17 Z" fill="#fff" fillOpacity=".92" />
      <circle cx="34" cy="16.5" r="1.6" fill="#0a9a92" />
    </svg>
  );
};

interface LogoProps {
  className?: string;
  /** Hide the wordmark on small screens */
  compact?: boolean;
  /** Color of the "Arzan" part (e.g. on dark footer) */
  textClassName?: string;
}

export const Logo = ({ className, compact, textClassName }: LogoProps) => (
  <span className={cn("flex items-center gap-2", className)}>
    <LogoMark />
    <span
      className={cn(
        "font-heading font-extrabold text-xl tracking-tight",
        compact && "hidden sm:inline",
        textClassName ?? "text-foreground"
      )}
    >
      Arzan<span className="text-primary">All</span>
    </span>
  </span>
);
