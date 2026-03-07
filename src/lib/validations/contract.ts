import { z } from "zod";

export const createContractSchema = z.object({
  jobId: z.string().cuid("Invalid job ID"),
  freelancerProfileId: z.string().cuid("Invalid freelancer profile ID"),
  amount: z.coerce.number().min(1, "Amount must be at least $1").max(1000000, "Amount too large"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description too long"),
});

export const updateContractStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUBMITTED", "COMPLETED", "CANCELLED"], {
    error: "Invalid status",
  }),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>;
