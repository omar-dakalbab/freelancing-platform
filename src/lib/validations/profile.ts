import { z } from "zod";

export const clientProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  companyDescription: z.string().max(1000).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().max(100).optional(),
});

export const freelancerProfileSchema = z.object({
  title: z.string().min(1, "Professional title is required").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000),
  hourlyRate: z.coerce.number().min(1, "Hourly rate must be at least $1").max(10000, "Hourly rate cannot exceed $10,000"),
  skills: z.array(z.string()).min(1, "At least one skill is required").max(20),
});

export const portfolioItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  imageUrl: z.string().optional(),
});

export type ClientProfileInput = z.infer<typeof clientProfileSchema>;
export type FreelancerProfileInput = z.infer<typeof freelancerProfileSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
