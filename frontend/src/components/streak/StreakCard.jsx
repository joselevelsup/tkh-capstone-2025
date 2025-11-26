export default function StreakCard({ label, current, longest, icon }) {
    return (
      <div className="p-4 rounded-2xl border border-[#d8c7f5] bg-white shadow-sm space-y-1">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span className="text-2xl">{icon}</span>
          <span>{label}</span>
        </h3>
        <p className="text-sm text-gray-700">
          🔥 Current streak: <span className="font-bold">{current}</span> days
        </p>
        <p className="text-sm text-gray-700">
          🏆 Longest streak: <span className="font-bold">{longest}</span> days
        </p>
      </div>
    );
  }
  