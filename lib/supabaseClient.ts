import { createClient } from "@supabase/supabase-js";

let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);

  return supabaseClientInstance;
};