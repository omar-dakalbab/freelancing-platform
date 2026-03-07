import { z } from "zod";

export const createReviewSchema = z.object({
  contractId: z.string().cuid("Invalid contract ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().max(2000, "Comment too long").optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
