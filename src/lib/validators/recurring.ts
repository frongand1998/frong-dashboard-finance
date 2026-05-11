import { z } from "zod";

export const recurringFrequencySchema = z.enum(["daily", "weekly", "monthly"]);

export const recurringRuleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(100),
  amount: z.coerce.number().positive(),
  frequency: recurringFrequencySchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(300).optional(),
  isActive: z.boolean().optional().default(true),
});

export type RecurringRuleFormData = z.infer<typeof recurringRuleSchema>;
