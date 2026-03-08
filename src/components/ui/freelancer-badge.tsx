"use client";

import { cn } from "@/lib/utils";
import { getBadgeInfo, type BadgeTier } from "@/lib/freelancer-badges";

interface FreelancerBadgeProps {
  tier: NonNullable<BadgeTier>;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export function FreelancerBadge({
  tier,
  size = "sm",
  showDescription = false,
  className,
}: FreelancerBadgeProps) {
  const badge = getBadgeInfo(tier);
  const Icon = badge.icon;

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
          badge.color.bg,
          badge.color.text,
          `border ${badge.color.border}`,
          className
        )}
        title={badge.description}
      >
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  }

  if (size === "md") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
          badge.color.bg,
          badge.color.text,
          `border ${badge.color.border}`,
          className
        )}
        title={badge.description}
      >
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-md", badge.color.iconBg)}>
          <Icon className="h-3 w-3" />
        </span>
        {badge.label}
      </span>
    );
  }

  // lg — used on profile pages
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        badge.color.bg,
        badge.color.border,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            badge.color.gradient
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className={cn("text-sm font-bold", badge.color.text)}>{badge.label}</p>
          {showDescription && (
            <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
          )}
        </div>
      </div>
      {showDescription && (
        <div className="mt-3 space-y-1">
          {badge.criteria.map((c) => (
            <div key={c} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={cn("h-1 w-1 rounded-full", badge.color.text.replace("text-", "bg-"))} />
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
