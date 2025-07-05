interface AnalyticsChartProps {
  analytics?: {
    totalPosts: number;
    postsByCategory: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
    monthlyPosts: number;
  };
}

export default function AnalyticsChart({ analytics }: AnalyticsChartProps) {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const categories = Object.keys(analytics.postsByCategory);
  const maxCount = Math.max(...Object.values(analytics.postsByCategory));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Distribution</h3>
        <p className="text-sm text-gray-600">Your posting habits over time</p>
      </div>
      
      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => {
            const count = analytics.postsByCategory[category];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                  <span className="text-sm text-gray-500">{count} posts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      category === 'travel' ? 'bg-turquoise' :
                      category === 'food' ? 'bg-soft-yellow' :
                      category === 'fitness' ? 'bg-mint' :
                      'bg-coral'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts to analyze yet</p>
          <p className="text-gray-400 text-sm">Start posting to see your analytics!</p>
        </div>
      )}
    </div>
  );
}
