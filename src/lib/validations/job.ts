import { z } from "zod";

export const JOB_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design & Creative",
  "Writing & Translation",
  "Data Science & Analytics",
  "Marketing & SEO",
  "Video & Animation",
  "Business & Finance",
  "Engineering & Architecture",
  "IT & Networking",
  "Customer Service",
  "Other",
] as const;

export const JOB_TIMELINES = [
  "Less than 1 month",
  "1-3 months",
  "3-6 months",
  "More than 6 months",
  "Ongoing",
] as const;

export const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(10000),
  category: z.enum(JOB_CATEGORIES, {
    error: "Please select a category",
  }),
  skills: z.array(z.string()).min(1, "At least one skill is required").max(15),
  budgetMin: z.coerce.number().min(1).optional(),
  budgetMax: z.coerce.number().min(1).optional(),
  timeline: z.enum(JOB_TIMELINES).optional(),
  status: z.enum(["DRAFT", "OPEN"]).default("OPEN"),
}).refine(
  (data) => {
    if (data.budgetMin && data.budgetMax) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: "Maximum budget must be greater than minimum budget",
    path: ["budgetMax"],
  }
);

// Separate schema for updates (avoids .partial() on refined schema)
export const updateJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150).optional(),
  description: z.string().min(50, "Description must be at least 50 characters").max(10000).optional(),
  category: z.enum(JOB_CATEGORIES).optional(),
  skills: z.array(z.string()).min(1).max(15).optional(),
  budgetMin: z.coerce.number().min(1).optional(),
  budgetMax: z.coerce.number().min(1).optional(),
  timeline: z.enum(JOB_TIMELINES).optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "FILLED"]).optional(),
});

export const jobFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "FILLED"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobFilterInput = z.infer<typeof jobFilterSchema>;
