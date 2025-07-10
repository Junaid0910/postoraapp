import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import type { Comment, User } from "@shared/schema";

interface CommentsSectionProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsSection({ postId, isOpen, onClose }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<(Comment & { user: User })[]>({
    queryKey: [`/api/comments/${postId}`],
    enabled: isOpen,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/comments", {
        postId,
        content,
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/comments/${postId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
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
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Comments ({comments.length})</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user.profileImageUrl || ""} />
                    <AvatarFallback className="bg-coral text-white text-xs">
                      {comment.user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        @{comment.user.username}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Level {comment.user.level}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleSubmit} className="border-t pt-4">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="bg-coral text-white text-xs">
                    {user.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                      size="sm"
                      className="bg-coral hover:bg-coral/90"
                    >
                      {createCommentMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}