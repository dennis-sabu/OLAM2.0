/**
 * Supabase browser client.
 *
 * Uses the NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (safe for client-side code).
 * Never use SUPABASE_SERVICE_ROLE_KEY here.
 */
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY/PUBLISHABLE_KEY environment variable."
  );
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

/** Singleton client for use outside React components (data layer functions). */
export const supabase = createClient();
