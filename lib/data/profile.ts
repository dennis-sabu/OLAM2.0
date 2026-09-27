/**
 * FlowState Data Layer — Profile & Hardware Companion Device Tokens
 */

import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types";

export interface ProfileRow {
  id: string;
  name: string;
  focus_area: string;
  email: string | null;
  device_token?: string | null;
  device_last_seen?: string | null;
  created_at: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    name: row.name || "",
    focusArea: row.focus_area || "Academics",
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // not found
      if (error.message?.includes("future") || error.message?.includes("JWT")) {
        // Clock skew: wait 1.5s and retry once
        await new Promise((res) => setTimeout(res, 1500));
        const retry = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (!retry.error && retry.data) return rowToProfile(retry.data as ProfileRow);
      }
      console.warn(`getProfile: ${error.message}`);
      return null;
    }
    return rowToProfile(data as ProfileRow);
  } catch (err) {
    console.warn("getProfile exception:", err);
    return null;
  }
}

export async function upsertProfile(userId: string, profile: UserProfile, email?: string): Promise<void> {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    name: profile.name,
    focus_area: profile.focusArea,
    email: email ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`upsertProfile: ${error.message}`);
}

/** Get device connection details for hardware companion */
export async function getDeviceDetails(userId: string): Promise<{
  deviceToken: string | null;
  deviceLastSeen: string | null;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("device_token, device_last_seen")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return { deviceToken: null, deviceLastSeen: null };
    throw new Error(`getDeviceDetails: ${error.message}`);
  }

  return {
    deviceToken: data?.device_token ?? null,
    deviceLastSeen: data?.device_last_seen ?? null,
  };
}

/** Generates a new hardware device token for the user */
export async function generateDeviceToken(userId: string): Promise<string> {
  // Generate random token with prefix
  const randomBytes = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  const newToken = `fs_dev_${randomBytes}`;

  const { error } = await supabase
    .from("profiles")
    .update({
      device_token: newToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(`generateDeviceToken: ${error.message}`);
  return newToken;
}

/** Revokes existing device token */
export async function revokeDeviceToken(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      device_token: null,
      device_last_seen: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(`revokeDeviceToken: ${error.message}`);
}
