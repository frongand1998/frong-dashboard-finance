import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  target_amount: z.number().positive("Target must be positive"),
  current_amount: z.number().min(0, "Current amount cannot be negative").default(0),
  due_date: z.string().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;
