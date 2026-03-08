"use client";

import { cn } from "@/lib/utils";

interface SuccessCheckmarkProps {
  show: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { container: "h-12 w-12", icon: "h-5 w-5", stroke: 2.5 },
  md: { container: "h-16 w-16", icon: "h-7 w-7", stroke: 2.5 },
  lg: { container: "h-20 w-20", icon: "h-9 w-9", stroke: 3 },
};

export function SuccessCheckmark({ show, className, size = "md" }: SuccessCheckmarkProps) {
  const s = sizes[size];

  if (!show) return null;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-emerald-500",
          s.container
        )}
        style={{
          animation: "success-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Pulse ring */}
        <div
          className={cn("absolute inset-0 rounded-full bg-emerald-400")}
          style={{
            animation: "success-ring 0.8s ease-out forwards",
          }}
        />
        {/* Checkmark */}
        <svg
          className={cn("relative z-10 text-white", s.icon)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline
            points="20 6 9 17 4 12"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
              animation: "success-draw 0.4s ease-out 0.3s forwards",
            }}
          />
        </svg>
      </div>
      <style jsx>{`
        @keyframes success-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes success-ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes success-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
