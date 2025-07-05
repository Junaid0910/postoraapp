import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import PostCard from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Users, MapPin } from "lucide-react";
import type { Post, User } from "@shared/schema";

export default function Explore() {
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

  const { data: publicPosts, isLoading: publicPostsLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts/public"],
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

  // Group posts by category
  const postsByCategory = publicPosts?.reduce((acc, post) => {
    const category = post.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, (Post & { user: User })[]>) || {};

  const categories = Object.keys(postsByCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-600">Discover amazing content from the Postora community</p>
        </div>

        {/* Search Bar */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search posts, users, or topics..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="cursor-pointer">
              All
            </Badge>
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="cursor-pointer capitalize">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {publicPosts?.length || 0}
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
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-turquoise">
                    {new Set(publicPosts?.map(p => p.userId)).size || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-turquoise rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-3xl font-bold text-mint">
                    {categories.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts by Category */}
        {publicPostsLoading ? (
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category) => (
              <Card key={category} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl capitalize flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${
                      category === 'travel' ? 'bg-turquoise' :
                      category === 'food' ? 'bg-soft-yellow' :
                      category === 'fitness' ? 'bg-mint' :
                      'bg-coral'
                    }`}></div>
                    <span>{category}</span>
                    <Badge variant="secondary">{postsByCategory[category].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postsByCategory[category].slice(0, 6).map((post) => (
                      <PostCard key={post.id} post={post} user={post.user} showUser={true} />
                    ))}
                  </div>
                  {postsByCategory[category].length > 6 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline">
                        View All {category} Posts
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 mb-4">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No public posts to explore yet</p>
                <p className="text-sm">Be the first to share your journey with the community!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
