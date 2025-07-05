import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import StreakCounter from "@/components/streak-counter";
import EnhancedLevelMap from "@/components/enhanced-level-map";
import PostCard from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, User } from "@shared/schema";

export default function Home() {
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

  const { data: userPosts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/user/" + user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: publicPosts, isLoading: publicPostsLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts/public"],
    retry: false,
  });

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.username || "User"} />
                    <AvatarFallback className="bg-coral text-white">
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                    </h3>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                </div>
                
                {/* Streak Counter */}
                <StreakCounter 
                  currentStreak={user.currentStreak || 0}
                  level={user.level || 1}
                  longestStreak={user.longestStreak || 0}
                />
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center mt-6">
                  <div>
                    <p className="text-xl font-semibold text-gray-900">{user.totalPosts || 0}</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">{user.followersCount || 0}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">{user.followingCount || 0}</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Analytics */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.postsByCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            category === 'travel' ? 'bg-turquoise' :
                            category === 'food' ? 'bg-soft-yellow' :
                            category === 'fitness' ? 'bg-mint' :
                            'bg-coral'
                          }`}></div>
                          <span className="text-sm text-gray-600 capitalize">{category}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No analytics data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Level Progression Map */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Your Journey Map</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedLevelMap 
                  currentLevel={user.level || 1}
                  posts={userPosts || []}
                />
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : userPosts && userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.slice(0, 5).map((post) => (
                      <PostCard key={post.id} post={post} user={user} showUser={false} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No posts yet. Start your journey by creating your first post!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Public Feed */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Discover Public Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {publicPostsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : publicPosts && publicPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publicPosts.slice(0, 4).map((post) => (
                      <PostCard key={post.id} post={post} user={post.user} showUser={true} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No public posts to discover yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
