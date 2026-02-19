import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
export function getSupabaseAdmin(){
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(config.supabaseUrl, key, { auth: { persistSession: false }});
}
