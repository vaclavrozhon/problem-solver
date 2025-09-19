import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://qtsteugcmlmdabngjrxz.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_0NDcI4rOH8L4P-cfPLT3Hw__KQn3KAQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
