import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
});

export const createConversationSchema = z.object({
  jobApplicationId: z.string().cuid("Invalid application ID"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
