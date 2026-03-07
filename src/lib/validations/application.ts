import { z } from "zod";

export const createApplicationSchema = z.object({
  jobId: z.string().cuid("Invalid job ID"),
  proposalText: z
    .string()
    .min(50, "Proposal must be at least 50 characters")
    .max(5000),
  bidAmount: z.coerce.number().min(1, "Bid amount must be at least $1").max(1000000),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["SHORTLISTED", "REJECTED", "HIRED"], {
    error: "Status is required",
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
