"use client";

import { useEffect } from "react";
import { awardDailyLoginXp } from "./actions";

export function DailyXpTrigger() {
  useEffect(() => {
    // Only fire once per browser session to avoid redundant server calls
    const key = "cg-daily-xp-triggered";
    const today = new Date().toDateString();
    if (sessionStorage.getItem(key) === today) return;

    awardDailyLoginXp().then((result) => {
      sessionStorage.setItem(key, today);
      if (result) {
        window.dispatchEvent(new Event("xp-updated"));
      }
    });
  }, []);

  return null;
}
