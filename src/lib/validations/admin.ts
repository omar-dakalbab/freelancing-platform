import { z } from "zod";

export const adminUserActionSchema = z.object({
  action: z.enum(["SUSPEND", "ACTIVATE"], { error: "Invalid action" }),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(1000, "Reason too long"),
});

export const adminJobActionSchema = z.object({
  action: z.enum(["REMOVE", "RESTORE"], { error: "Invalid action" }),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(1000, "Reason too long"),
});

export const adminReviewActionSchema = z.object({
  action: z.enum(["DELETE"], { error: "Invalid action" }),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(1000, "Reason too long"),
});

export type AdminUserActionInput = z.infer<typeof adminUserActionSchema>;
export type AdminJobActionInput = z.infer<typeof adminJobActionSchema>;
export type AdminReviewActionInput = z.infer<typeof adminReviewActionSchema>;
