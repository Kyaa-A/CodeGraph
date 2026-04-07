/**
 * Shared site-wide statistics displayed across marketing / auth / dashboard pages.
 * Update these values in one place when content grows.
 */
export const SITE_STATS = {
  PROBLEMS_LABEL: "1000+",
  DOC_PAGES_LABEL: "600+",
  LANGUAGES_COUNT: "15",
} as const;

/** Human-readable labels for XP event types, used in XP bar, profile, and dashboard */
export const EVENT_LABELS: Record<string, string> = {
  problem_solve: "Problem Solved",
  lesson_complete: "Lesson Complete",
  daily_streak: "Daily Streak",
  daily_login: "Daily Login",
  doc_read: "Doc Read",
};

/** XP amounts awarded per action, matching the award_xp RPC values */
export const XP_REWARDS = [
  { label: "Easy problem", xp: 10, color: "bg-green-100 text-green-700" },
  { label: "Medium problem", xp: 25, color: "bg-amber-100 text-amber-700" },
  { label: "Hard problem", xp: 50, color: "bg-red-100 text-red-700" },
  { label: "Complete lesson", xp: 15, color: "bg-blue-100 text-blue-700" },
  { label: "Read docs page", xp: 5, color: "bg-purple-100 text-purple-700" },
  { label: "Daily login", xp: 5, color: "bg-orange-100 text-orange-700" },
] as const;
