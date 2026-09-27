import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service-role privileges.
 * NEVER import this file into client components.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL for admin operations.");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface AuthenticatedDeviceUser {
  userId: string;
  userName: string;
}

/**
 * Authenticates a device request via Bearer <device-token>.
 * Updates device_last_seen on success.
 */
export async function authenticateDevice(
  authHeader: string | null
): Promise<AuthenticatedDeviceUser | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, device_token")
    .eq("device_token", token)
    .single();

  if (error || !data) {
    return null;
  }

  // Update last seen timestamp asynchronously
  supabaseAdmin
    .from("profiles")
    .update({ device_last_seen: new Date().toISOString() })
    .eq("id", data.id)
    .then(
      () => {},
      () => {}
    );

  return {
    userId: data.id,
    userName: data.name || "Student",
  };
}
