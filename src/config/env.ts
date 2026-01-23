import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env = envSchema.safeParse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const getEnvOrThrow = () => {
  if (!env.success) {
    throw new Error("Environment variables are missing or invalid");
  }
  return env.data;
};
