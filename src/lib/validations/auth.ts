import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
  callbackUrl: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
