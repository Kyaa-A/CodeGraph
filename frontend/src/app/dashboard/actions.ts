"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Awards daily login XP if the user hasn't been awarded today.
 * Called on dashboard load.
 */
export async function awardDailyLoginXp() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if user already got daily_login XP today
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

  const { data: existing } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_type", "daily_login")
    .gte("created_at", startOfDay)
    .limit(1);

  if (existing && existing.length > 0) {
    return null; // Already awarded today
  }

  // Award 5 XP for daily login
  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: user.id,
    p_event_type: "daily_login",
    p_xp_amount: 5,
    p_metadata: { date: startOfDay },
  });

  if (error) {
    console.error("Failed to award daily login XP:", error);
    return null;
  }

  return data;
}
