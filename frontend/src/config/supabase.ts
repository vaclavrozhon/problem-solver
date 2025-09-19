import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.SUPABASE_URL ||
  "https://qtsteugcmlmdabngjrxz.supabase.co";
const supabasePublishableKey =
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_0NDcI4rOH8L4P-cfPLT3Hw__KQn3KAQ";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
