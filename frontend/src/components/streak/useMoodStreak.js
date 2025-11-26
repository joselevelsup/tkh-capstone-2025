import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";
import { calculateStreaks } from "./streakLogic";

export function useMoodStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("mood")
        .select("date")
        .order("date", { ascending: true });

      if (error) {
        console.error("Mood streak error:", error);
        setLoading(false);
        return;
      }

      const dates = (data || []).map((row) => String(row.date).slice(0, 10));

      const { currentStreak, longestStreak } = calculateStreaks(dates);
      setCurrentStreak(currentStreak);
      setLongestStreak(longestStreak);
      setLoading(false);
    }

    load();
  }, []);

  return { currentStreak, longestStreak, loading };
}
