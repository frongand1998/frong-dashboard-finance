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

let supabase: ReturnType<typeof createClient<SupabaseDatabase>> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey);
}

export { supabase };
