import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import StreakCard from "../components/streak/StreakCard";
import { useJournalStreak } from "../components/streak/useJournalStreak";
import { useMoodStreak } from "../components/streak/useMoodStreak";
import { useMeditationStreak } from "../components/streak/useMeditationStreak";

const Achievement = () => {
  const journal = useJournalStreak();
  const mood = useMoodStreak();
  const meditation = useMeditationStreak();

  const isLoading = journal.loading || mood.loading || meditation.loading;

  const [popup, setPopup] = useState(null);

  // helper: decide badge based on longest streak
  const getBadge = (longest) => {
    if (longest >= 30) return { label: "Diamond Discipline", emoji: "💎" };
    if (longest >= 14) return { label: "Gold Groove", emoji: "🥇" };
    if (longest >= 7) return { label: "Silver Steady", emoji: "🥈" };
    if (longest >= 3) return { label: "Bronze Beginning", emoji: "🥉" };
    if (longest >= 1) return { label: "Getting Started", emoji: "✨" };
    return { label: "No streak yet", emoji: "🌱" };
  };

  // run confetti when a *new record* longest streak is reached
  useEffect(() => {
    if (isLoading) return;

    const streaks = [
      { key: "journal", name: "Journal", data: journal },
      { key: "mood", name: "Mood", data: mood },
      { key: "meditation", name: "Meditation", data: meditation },
    ];

    streaks.forEach(({ key, name, data }) => {
      const longest = data.longestStreak || 0;
      if (!longest) return;

      const storageKey = `cmh_best_${key}_streak`;
      const prevBest = Number(localStorage.getItem(storageKey) || "0");

      if (longest > prevBest) {
        localStorage.setItem(storageKey, String(longest));

        // confetti burst
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.3 },
        });

        // popup
        setPopup({
          title: "New Streak Record! 🎉",
          message: `${name} streak: ${longest} days`,
        });

        // hide after 3 seconds
        setTimeout(() => setPopup(null), 3000);
      }
    });
  }, [isLoading, journal, mood, meditation]);

  const journalBadge = getBadge(journal.longestStreak || 0);
  const moodBadge = getBadge(mood.longestStreak || 0);
  const meditationBadge = getBadge(meditation.longestStreak || 0);

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* popup */}
      {popup && (
        <div className="fixed inset-x-0 top-4 flex justify-center z-50">
          <div className="bg-white border border-purple-200 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {popup.title}
              </p>
              <p className="text-xs text-gray-600">{popup.message}</p>
            </div>
          </div>
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        <p className="text-sm text-gray-600">
          Track your journaling, mood, and meditation streaks.
        </p>
      </header>

      {/* streak cards */}
      {isLoading ? (
        <p className="text-gray-700 text-sm">Loading your streaks…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StreakCard
            label="Journal Streak"
            icon="📝"
            current={journal.currentStreak}
            longest={journal.longestStreak}
          />
          <StreakCard
            label="Mood Streak"
            icon="😊"
            current={mood.currentStreak}
            longest={mood.longestStreak}
          />
          <StreakCard
            label="Meditation Streak"
            icon="🧘🏽‍♀️"
            current={meditation.currentStreak}
            longest={meditation.longestStreak}
          />
        </div>
      )}

      {/* badges */}
      {!isLoading && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Badges</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-purple-50 border border-purple-100 p-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{journalBadge.emoji}</span>
                Journal
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {journalBadge.label}
              </p>
            </div>

            <div className="rounded-2xl bg-pink-50 border border-pink-100 p-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{moodBadge.emoji}</span>
                Mood
              </p>
              <p className="text-xs text-gray-600 mt-1">{moodBadge.label}</p>
            </div>

            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{meditationBadge.emoji}</span>
                Meditation
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {meditationBadge.label}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Achievement;
