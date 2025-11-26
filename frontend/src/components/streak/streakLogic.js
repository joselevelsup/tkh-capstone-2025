export function calculateStreaks(dates) {
    if (!dates || dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
  
    const uniqueSorted = Array.from(new Set(dates)).sort();
    const dateSet = new Set(uniqueSorted);
    const toDateStr = (d) => d.toISOString().slice(0, 10);
  
    // longest streak from full history
    const longestStreak = longestStreakFromList(uniqueSorted);
  
    // current streak ONLY if last activity is TODAY
    const todayStr = toDateStr(new Date());
    const lastDateStr = uniqueSorted[uniqueSorted.length - 1];
  
    if (lastDateStr !== todayStr) {
      return { currentStreak: 0, longestStreak };
    }
  
    let currentStreak = 0;
    let cursor = todayStr;
  
    while (dateSet.has(cursor)) {
      currentStreak++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = toDateStr(d);
    }
  
    return { currentStreak, longestStreak };
  }
  
  function longestStreakFromList(sortedDates) {
    if (!sortedDates.length) return 0;
  
    const toDate = (s) => new Date(s + "T00:00:00Z");
    let longest = 1;
    let current = 1;
  
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = toDate(sortedDates[i - 1]);
      const curr = toDate(sortedDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
  
      if (diffDays === 1) {
        current++;
      } else if (diffDays === 0) {
        continue; // same day duplicate
      } else {
        longest = Math.max(longest, current);
        current = 1;
      }
    }
  
    longest = Math.max(longest, current);
    return longest;
  }
  