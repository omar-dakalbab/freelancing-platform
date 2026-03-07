"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const isInteractive = !readonly && !!onChange;

  const displayRating = isInteractive && hovered > 0 ? hovered : value;

  return (
    <div className={cn("flex items-center gap-0.5", className)} role={isInteractive ? "radiogroup" : "img"} aria-label={!isInteractive ? `Rating: ${value} out of 5 stars` : "Rating"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={() => isInteractive && onChange?.(star)}
          onMouseEnter={() => isInteractive && setHovered(star)}
          onMouseLeave={() => isInteractive && setHovered(0)}
          className={cn(
            "transition-colors",
            isInteractive
              ? "cursor-pointer hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 rounded"
              : "cursor-default"
          )}
          aria-label={isInteractive ? `Rate ${star} out of 5` : undefined}
          aria-hidden={!isInteractive ? "true" : undefined}
          tabIndex={!isInteractive ? -1 : undefined}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= displayRating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200",
              isInteractive && star <= hovered && "fill-amber-500 text-amber-500"
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {value > 0 ? value.toFixed(1) : "No rating"}
        </span>
      )}
    </div>
  );
}
