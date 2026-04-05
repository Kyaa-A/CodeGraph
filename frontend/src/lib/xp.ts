import { createClient } from "@/lib/supabase/client";

const XP_AMOUNTS: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  lesson: 15,
  streak: 5,
};

export async function awardProblemXp(
  userId: string,
  problemId: string,
  difficulty: string
): Promise<{ leveled_up: boolean; new_level: number; total_xp: number } | null> {
  const supabase = createClient();
  const xpAmount = XP_AMOUNTS[difficulty] || 10;

  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: userId,
    p_event_type: "problem_solve",
    p_xp_amount: xpAmount,
    p_metadata: { problem_id: problemId, difficulty },
  });

  if (error) {
    console.error("Failed to award XP:", error);
    return null;
  }

  const result = data as { leveled_up: boolean; level: number; total_xp: number; old_level: number };

  // Fire events for UI updates
  window.dispatchEvent(new Event("xp-updated"));

  if (result.leveled_up) {
    window.dispatchEvent(
      new CustomEvent("level-up", {
        detail: { oldLevel: result.old_level, newLevel: result.level },
      })
    );
  }

  return {
    leveled_up: result.leveled_up,
    new_level: result.level,
    total_xp: result.total_xp,
  };
}

export async function awardLessonXp(
  userId: string,
  lessonId: string
): Promise<{ leveled_up: boolean; new_level: number; total_xp: number } | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: userId,
    p_event_type: "lesson_complete",
    p_xp_amount: XP_AMOUNTS.lesson,
    p_metadata: { lesson_id: lessonId },
  });

  if (error) {
    console.error("Failed to award XP:", error);
    return null;
  }

  const result = data as { leveled_up: boolean; level: number; total_xp: number; old_level: number };

  window.dispatchEvent(new Event("xp-updated"));

  if (result.leveled_up) {
    window.dispatchEvent(
      new CustomEvent("level-up", {
        detail: { oldLevel: result.old_level, newLevel: result.level },
      })
    );
  }

  return {
    leveled_up: result.leveled_up,
    new_level: result.level,
    total_xp: result.total_xp,
  };
}
