"use client";

import { useEffect } from "react";
import { awardDailyLoginXp } from "./actions";

export function DailyXpTrigger() {
  useEffect(() => {
    awardDailyLoginXp().then((result) => {
      if (result) {
        window.dispatchEvent(new Event("xp-updated"));
      }
    });
  }, []);

  return null;
}
