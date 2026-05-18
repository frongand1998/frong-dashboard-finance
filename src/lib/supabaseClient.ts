import { createClient } from "@supabase/supabase-js";

export type SupabaseDatabase = {
  public: {
    Tables: {
      [tableName: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient<SupabaseDatabase>> | null = null;

if (supabaseUrl) {
  const isServer = typeof window === "undefined";
  const key =
    isServer && supabaseServiceRoleKey
      ? supabaseServiceRoleKey
      : supabaseAnonKey;

  if (key) {
    supabase = createClient<SupabaseDatabase>(supabaseUrl, key);
  }
}

export { supabase };
