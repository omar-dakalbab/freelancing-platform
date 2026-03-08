"use client";

import { AlertTriangle, Info, AlertCircle, Trash2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DialogIntent = "destructive" | "warning" | "info";

const intentConfig: Record<
  DialogIntent,
  { icon: typeof AlertTriangle; iconBg: string; iconColor: string; buttonVariant: ButtonProps["variant"] }
> = {
  destructive: {
    icon: Trash2,
    iconBg: "bg-red-50 ring-1 ring-red-100",
    iconColor: "text-red-600",
    buttonVariant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50 ring-1 ring-amber-100",
    iconColor: "text-amber-600",
    buttonVariant: "warning",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50 ring-1 ring-blue-100",
    iconColor: "text-blue-600",
    buttonVariant: "default",
  },
};

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: DialogIntent;
  variant?: ButtonProps["variant"];
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "destructive",
  variant,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const config = intentConfig[intent];
  const Icon = config.icon;
  const buttonVariant = variant ?? config.buttonVariant;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* Body */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full mb-4",
                config.iconBg
              )}
              aria-hidden="true"
            >
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle className="text-center">{title}</DialogTitle>
              <DialogDescription className="text-center mt-1.5 leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 border-t border-gray-100 px-6 py-4 sm:flex-row gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="flex-1 sm:flex-initial">
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={buttonVariant}
            loading={loading}
            onClick={onConfirm}
            className="flex-1 sm:flex-initial"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
