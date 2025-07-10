import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import PostCard from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Users, MapPin, ShoppingBag, Utensils, Dumbbell, Camera, Music, Book, Gamepad2, Coffee } from "lucide-react";
import type { Post, User } from "@shared/schema";

export default function Explore() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Filter posts based on selected category and search query
  const filteredPosts = publicPosts?.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  // Group posts by category
  const postsByCategory = publicPosts?.reduce((acc, post) => {
    const category = post.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, (Post & { user: User })[]>) || {};

  const categories = Object.keys(postsByCategory);

  // Featured categories with icons and descriptions
  const featuredCategories = [
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, description: 'Fashion, deals, and purchases', count: postsByCategory.shopping?.length || 0 },
    { key: 'food', label: 'Food', icon: Utensils, description: 'Recipes, restaurants, and dining', count: postsByCategory.food?.length || 0 },
    { key: 'fitness', label: 'Fitness', icon: Dumbbell, description: 'Workouts, health, and wellness', count: postsByCategory.fitness?.length || 0 },
    { key: 'travel', label: 'Travel', icon: Camera, description: 'Adventures and destinations', count: postsByCategory.travel?.length || 0 },
    { key: 'music', label: 'Music', icon: Music, description: 'Songs, concerts, and playlists', count: postsByCategory.music?.length || 0 },
    { key: 'books', label: 'Books', icon: Book, description: 'Reading and literature', count: postsByCategory.books?.length || 0 },
    { key: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Video games and entertainment', count: postsByCategory.gaming?.length || 0 },
    { key: 'lifestyle', label: 'Lifestyle', icon: Coffee, description: 'Daily life and experiences', count: postsByCategory.lifestyle?.length || 0 },
  ];

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, users, or topics..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Featured Categories Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {featuredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.key}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCategory === category.key ? 'ring-2 ring-coral bg-coral/5' : 'hover:border-coral'
                  }`}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      selectedCategory === category.key ? 'text-coral' : 'text-gray-600'
                    }`} />
                    <h3 className="font-medium text-sm text-gray-900">{category.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {category.count} posts
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              All ({publicPosts?.length || 0})
            </Badge>
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant={selectedCategory === category ? 'default' : 'outline'} 
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({postsByCategory[category].length})
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

        {/* Filtered Posts */}
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
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' 
                  ? `All Posts (${filteredPosts.length})` 
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Posts (${filteredPosts.length})`
                }
              </h3>
              {searchQuery && (
                <p className="text-sm text-gray-500">
                  Search results for "{searchQuery}"
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} user={post.user} showUser={true} />
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No posts found for "{searchQuery}"</p>
                <p className="text-sm">Try a different search term or browse categories above</p>
              </div>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : selectedCategory !== 'all' ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 mb-4">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No {selectedCategory} posts yet</p>
                <p className="text-sm">Be the first to post in this category!</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                View All Posts
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 mb-4">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No public posts to explore yet</p>
                <p className="text-sm">Be the first to share your journey with the community!</p>
              </div>
              <Link href="/">
                <Button>Start Posting</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
