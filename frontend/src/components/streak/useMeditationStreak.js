import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";
import { calculateStreaks } from "./streakLogic";

export function useMeditationStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.user) {
        setCurrentStreak(0);
        setLongestStreak(0);
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from("meditation_sessions")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Meditation streak error:", error);
        setLoading(false);
        return;
      }

      const dates = (data || []).map((row) =>
        String(row.created_at).slice(0, 10)
      );

      const { currentStreak, longestStreak } = calculateStreaks(dates);
      setCurrentStreak(currentStreak);
      setLongestStreak(longestStreak);
      setLoading(false);
    }

    load();
  }, []);

  return { currentStreak, longestStreak, loading };
}
