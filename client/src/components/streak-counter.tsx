interface StreakCounterProps {
  currentStreak: number;
  level: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, level, longestStreak }: StreakCounterProps) {
  return (
    <div className="bg-gradient-to-r from-coral to-plum rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between text-white">
        <div>
          <p className="text-sm opacity-90">Current Streak</p>
          <p className="text-2xl font-bold">🔥 {currentStreak} days</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Level</p>
          <p className="text-2xl font-bold">Level {level}</p>
        </div>
      </div>
      
      {longestStreak > 0 && (
        <div className="mt-2 pt-2 border-t border-white/20">
          <p className="text-sm opacity-90">Best Streak: {longestStreak} days</p>
        </div>
      )}
    </div>
  );
}
