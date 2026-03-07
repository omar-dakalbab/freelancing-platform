"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface UserActionModalProps {
  userId: string;
  userEmail: string;
  currentlySuspended: boolean;
  onClose: () => void;
  onSuccess: (userId: string, suspended: boolean) => void;
}

export function UserActionModal({
  userId,
  userEmail,
  currentlySuspended,
  onClose,
  onSuccess,
}: UserActionModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const action = currentlySuspended ? "ACTIVATE" : "SUSPEND";
  const actionLabel = currentlySuspended ? "Activate" : "Suspend";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Action failed");

      toast.success(json.message);
      onSuccess(userId, action === "SUSPEND");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{actionLabel} User</DialogTitle>
          <DialogDescription>
            {action === "SUSPEND"
              ? `Suspending ${userEmail} will prevent them from logging in.`
              : `Activating ${userEmail} will restore their access.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Textarea
            label="Reason"
            placeholder="Explain why you are taking this action..."
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              loading={submitting}
              variant={action === "SUSPEND" ? "destructive" : "success"}
            >
              {actionLabel} User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
