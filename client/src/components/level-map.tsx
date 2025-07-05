import type { Post } from "@shared/schema";

interface LevelMapProps {
  currentLevel: number;
  posts: Post[];
}

export default function LevelMap({ currentLevel, posts }: LevelMapProps) {
  // Create level progression based on posts
  const levels = Array.from({ length: Math.max(currentLevel + 2, 5) }, (_, i) => {
    const level = i + 1;
    const post = posts.find(p => p.level === level);
    return {
      level,
      unlocked: level <= currentLevel,
      post,
      date: post ? new Date(post.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }) : null,
    };
  });

  const getLevelColor = (level: number, unlocked: boolean) => {
    if (!unlocked) return 'bg-gray-200 text-gray-400';
    
    const colors = [
      'bg-gradient-to-r from-coral to-plum',
      'bg-gradient-to-r from-turquoise to-sky',
      'bg-gradient-to-r from-mint to-soft-yellow',
      'bg-gradient-to-r from-sky to-turquoise',
      'bg-gradient-to-r from-plum to-coral',
    ];
    
    return colors[(level - 1) % colors.length];
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-5 gap-4 mb-6">
        {levels.slice(0, 5).map((levelData) => (
          <div key={levelData.level} className="relative group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform ${
              getLevelColor(levelData.level, levelData.unlocked)
            }`}>
              {levelData.unlocked ? (
                <span>{levelData.level}</span>
              ) : (
                <span className="text-xl">🔒</span>
              )}
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {levelData.date || (levelData.unlocked ? 'Unlocked' : 'Locked')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {currentLevel >= levels.length - 2 
            ? `Amazing! You've reached level ${currentLevel}!`
            : "Complete your daily post to unlock the next level!"
          }
        </p>
      </div>
    </div>
  );
}
