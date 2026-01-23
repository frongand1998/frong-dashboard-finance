import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
