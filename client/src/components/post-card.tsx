import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, UserPlus, Lock, Globe, Play } from "lucide-react";
import CommentsSection from "@/components/comments-section";
import type { Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post;
  user: User;
  showUser?: boolean;
}

export default function PostCard({ post, user, showUser = false }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/likes/${post.id}`);
      } else {
        await apiRequest("POST", "/api/likes", { postId: post.id });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      if (!isLiked) {
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 1000);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/posts/public"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/follows", { followingId: user.id });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `You are now following ${user.username}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/public"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    const postDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return postDate.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'bg-turquoise text-white';
      case 'food': return 'bg-soft-yellow text-yellow-800';
      case 'fitness': return 'bg-mint text-white';
      default: return 'bg-coral text-white';
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-coral to-plum rounded-full flex items-center justify-center text-white font-bold">
            L{post.level}
          </div>
          <div className="flex-1">
            {showUser && (
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profileImageUrl || ""} alt={user.username || "User"} />
                  <AvatarFallback className="bg-coral text-white text-sm">
                    {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    @{user.username}
                  </p>
                  <p className="text-xs text-gray-500">Level {user.level}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-gray-900">{post.title}</h4>
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
              <div className="flex items-center space-x-1 text-gray-500">
                {post.isPublic ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                <span className="text-xs">
                  {post.isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{post.content}</p>
            
            {/* Media Display */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="mb-3 relative">
                {post.mediaType === 'video' ? (
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video 
                      src={post.mediaUrls[0]} 
                      controls 
                      className="w-full max-h-96 object-contain"
                      poster={post.mediaUrls[1] || undefined}
                    />
                    <div className="absolute top-2 left-2">
                      <Play className="w-5 h-5 text-white bg-black/50 rounded-full p-1" />
                    </div>
                    {/* Heart animation overlay for videos */}
                    {showHeartAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-ping" />
                      </div>
                    )}
                  </div>
                ) : post.mediaType === 'image' && (
                  <div className="relative">
                    <img 
                      src={post.mediaUrls[0]} 
                      alt={post.title}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                    {/* Heart animation overlay for images */}
                    {showHeartAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-ping" />
                      </div>
                    )}
                  </div>
                )}
                {post.mediaUrls.length > 1 && post.mediaType === 'image' && (
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {post.mediaUrls.slice(1, 4).map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`${post.title} ${index + 2}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                    {post.mediaUrls.length > 4 && (
                      <div className="relative">
                        <img 
                          src={post.mediaUrls[4]} 
                          alt="More images"
                          className="w-full h-24 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          <span className="text-white font-bold">+{post.mediaUrls.length - 4}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className="flex items-center space-x-1 text-gray-500 hover:text-coral transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-coral text-coral' : ''}`} />
                  <span>{likesCount}</span>
                </button>
                <button
                  onClick={() => setShowComments(true)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-coral transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount || 0}</span>
                </button>
              </div>
              
              {showUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="text-coral hover:text-coral border-coral hover:bg-coral/10"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Follow
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CommentsSection 
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </Card>
  );
}
