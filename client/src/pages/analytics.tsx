import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import AnalyticsChart from "@/components/analytics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalPosts: number;
    postsByCategory: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
    monthlyPosts: number;
  }>({
    queryKey: ["/api/analytics/user/" + user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your posting habits and discover your patterns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsLoading ? "..." : analytics?.totalPosts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-3xl font-bold text-coral">
                    {user.currentStreak || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-turquoise rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Longest Streak</p>
                  <p className="text-3xl font-bold text-sky">
                    {user.longestStreak || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-plum">
                    {analyticsLoading ? "..." : analytics?.monthlyPosts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-soft-yellow rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Posts by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : analytics && Object.keys(analytics.postsByCategory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(analytics.postsByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => {
                      const total = analytics.totalPosts || 1;
                      const percentage = Math.round((count / total) * 100);
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full ${
                                category === 'travel' ? 'bg-turquoise' :
                                category === 'food' ? 'bg-soft-yellow' :
                                category === 'fitness' ? 'bg-mint' :
                                'bg-coral'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {category}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{count} posts</Badge>
                              <span className="text-sm text-gray-500">{percentage}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
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
                <div className="text-center py-12">
                  <p className="text-gray-500">No category data available</p>
                  <p className="text-gray-400 text-sm">Start posting to see your analytics!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak Statistics */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Streak Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-coral mb-2">
                    {user.currentStreak || 0}
                  </div>
                  <p className="text-gray-600">Current Streak</p>
                  <p className="text-sm text-gray-500">
                    {user.currentStreak && user.currentStreak > 0 
                      ? "Keep it up! You're on fire 🔥" 
                      : "Start your streak today!"}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Streak</span>
                    <span className="text-lg font-bold text-coral">
                      {user.currentStreak || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Longest Streak</span>
                    <span className="text-lg font-bold text-turquoise">
                      {user.longestStreak || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Level</span>
                    <span className="text-lg font-bold text-mint">
                      Level {user.level || 1}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Component */}
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart analytics={analytics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
