import { z } from "zod";

export const milestoneInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").default(""),
  amount: z.coerce.number().min(1, "Amount must be at least $1").max(1000000, "Amount too large"),
  dueDate: z.string().optional(),
});

export const createContractSchema = z.object({
  jobId: z.string().cuid("Invalid job ID"),
  freelancerProfileId: z.string().cuid("Invalid freelancer profile ID"),
  amount: z.coerce.number().min(1, "Amount must be at least $1").max(1000000, "Amount too large"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description too long"),
  milestones: z.array(milestoneInputSchema).optional(),
});

export const updateContractStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUBMITTED", "COMPLETED", "CANCELLED"], {
    error: "Invalid status",
  }),
});

export const updateMilestoneStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "SUBMITTED", "APPROVED"], {
    error: "Invalid milestone status",
  }),
});

export type MilestoneInput = z.infer<typeof milestoneInputSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>;
export type UpdateMilestoneStatusInput = z.infer<typeof updateMilestoneStatusSchema>;
