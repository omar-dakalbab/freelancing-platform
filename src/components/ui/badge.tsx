import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-700 ring-1 ring-brand-200/60",
        secondary: "bg-gray-100 text-gray-600",
        success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
        warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
        destructive: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
        outline: "border border-gray-200 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
