import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "LetsWork";
export const LOGO_ICON = "/logo.png";

interface LogoProps {
  className?: string;
  variant?: "dark" | "white";
  size?: "sm" | "md";
}

/** Standalone logomark icon */
export function Logomark({ className, variant = "dark", size = "md" }: LogoProps) {
  const boxSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl shrink-0",
        boxSize,
        variant === "dark" ? "bg-brand-900" : "bg-white/15 backdrop-blur-sm",
        className
      )}
      aria-hidden="true"
    >
      <MousePointerClick className={cn(iconSize, variant === "dark" ? "text-white" : "text-white")} />
    </div>
  );
}

/** Full logo: logomark + wordmark */
export function Logo({ className, variant = "dark", size = "md" }: LogoProps) {
  const textColor = variant === "dark" ? "text-gray-900" : "text-white";
  const accentColor = variant === "dark" ? "text-accent-600" : "text-accent-400";
  const textSize = size === "sm" ? "text-base" : "text-[17px]";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logomark variant={variant} size={size} />
      <span className={cn("font-bold tracking-tight", textSize, textColor)}>
        Lets<span className={accentColor}>Work</span>
      </span>
    </div>
  );
}
