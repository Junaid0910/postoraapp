import { useAuth } from "@/hooks/useAuth";
import EditProfileDialog from "@/components/edit-profile-dialog";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import PostCard from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, MapPin, Calendar, Users, Award } from "lucide-react";
import { useState } from "react";
import type { Post } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.profileImageUrl || ""} alt={user.username || "User"} />
                <AvatarFallback className="bg-coral text-white text-2xl">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                    </h1>
                    <p className="text-gray-600 text-lg">@{user.username}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 md:mt-0"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                {user.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}
                
                <div className="flex items-center justify-center md:justify-start space-x-6 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="w-4 h-4 mr-1" />
                    <span className="text-sm">Level {user.level}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start space-x-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{user.totalPosts || 0}</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{user.followersCount || 0}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{user.followingCount || 0}</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-coral">{user.currentStreak || 0}</p>
                    <p className="text-sm text-gray-600">Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-coral mb-2">{user.currentStreak || 0}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-turquoise mb-2">{user.longestStreak || 0}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-mint mb-2">
                {analyticsLoading ? "..." : analytics?.monthlyPosts || 0}
              </div>
              <div className="text-sm text-gray-600">Posts This Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">All Posts</CardTitle>
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
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} user={user} showUser={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No posts yet</p>
                <p className="text-gray-400">Start your journey by creating your first post!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={isEditProfileOpen} 
        onOpenChange={setIsEditProfileOpen}
      />
    </div>
  );
}
