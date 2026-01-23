import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = () => {
  if (browserClient) return browserClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials are not set; using mock client.");
  }

  browserClient = createClient(
    supabaseUrl || "https://example.supabase.co",
    supabaseAnonKey || "public-anon-key"
  );

  return browserClient;
};

export const isEnvValid = env.success;
