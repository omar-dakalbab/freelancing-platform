"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, generateInitials, getAvatarUrl } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-8 w-8", text: "text-xs" },
  md: { container: "h-10 w-10", text: "text-sm" },
  lg: { container: "h-12 w-12", text: "text-base" },
  xl: { container: "h-16 w-16", text: "text-xl" },
};

export function Avatar({ src, alt, email, size = "md", className }: AvatarProps) {
  const { container, text } = sizeMap[size];
  const avatarSrc = src || (email ? getAvatarUrl(src, email) : null);
  const [imgError, setImgError] = useState(false);

  if (avatarSrc && !imgError) {
    return (
      <div className={cn("relative overflow-hidden rounded-full bg-gray-100", container, className)}>
        <Image
          src={avatarSrc}
          alt=""
          fill
          className="object-cover"
          unoptimized
          aria-hidden="true"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-brand-800 font-semibold text-white",
        container,
        text,
        className
      )}
      aria-hidden="true"
    >
      {generateInitials(alt)}
    </div>
  );
}
