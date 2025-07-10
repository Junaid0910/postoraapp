import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Heart, MessageCircle, Share, MoreVertical } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Post, User } from "@shared/schema";

export default function Reels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const { data: posts = [], isLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts/public"],
  });

  // Filter posts that have videos or images for reels
  const reelsPosts = posts.filter(post => 
    post.mediaUrls && post.mediaUrls.length > 0 && 
    (post.mediaType === 'video' || post.mediaType === 'image')
  );

  useEffect(() => {
    // Auto-play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex && video.tagName === 'VIDEO') {
          video.play();
        } else if (video.tagName === 'VIDEO') {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  const handleScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < reelsPosts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = useRef<number>(0);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = handleTouchStart.current - touchEnd;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentIndex < reelsPosts.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Loading reels...</div>
      </div>
    );
  }

  if (reelsPosts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-2">No Reels Available</h2>
          <p className="text-gray-400">Be the first to create content!</p>
          <Link href="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPost = reelsPosts[currentIndex];

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      onWheel={handleScroll}
      onTouchStart={(e) => { handleTouchStart.current = e.touches[0].clientY; }}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-white font-semibold">Reels</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Reels Container */}
      <div className="relative w-full h-full">
        {reelsPosts.map((post, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={post.id}
              className={`absolute inset-0 transition-transform duration-300 ${
                isActive ? 'translate-y-0' : 
                index < currentIndex ? '-translate-y-full' : 'translate-y-full'
              }`}
            >
              {/* Media Content */}
              <div className="relative w-full h-full flex items-center justify-center">
                {post.mediaType === 'video' ? (
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={post.mediaUrls[0]}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    onDoubleClick={() => setIsLiked(!isLiked)}
                  />
                ) : (
                  <img
                    src={post.mediaUrls[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onDoubleClick={() => setIsLiked(!isLiked)}
                  />
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-end justify-between">
                    {/* Left side - User info and content */}
                    <div className="flex-1 mr-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-10 h-10 border-2 border-white">
                          <AvatarImage src={post.user.profileImageUrl || ""} />
                          <AvatarFallback className="bg-coral text-white">
                            {post.user.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            @{post.user.username}
                          </p>
                          <p className="text-gray-300 text-xs">Level {post.user.level}</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs px-3 py-1 h-auto"
                        >
                          Follow
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-white font-medium">{post.title}</h3>
                        <p className="text-gray-200 text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-coral px-2 py-1 rounded-full text-white">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            Level {post.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col items-center space-y-4">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="flex flex-col items-center space-y-1 group"
                      >
                        <div className="bg-black/30 rounded-full p-3 group-hover:bg-black/50 transition-colors">
                          <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </div>
                        <span className="text-white text-xs">{post.likesCount || 0}</span>
                      </button>

                      <button className="flex flex-col items-center space-y-1 group">
                        <div className="bg-black/30 rounded-full p-3 group-hover:bg-black/50 transition-colors">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white text-xs">{post.commentsCount || 0}</span>
                      </button>

                      <button className="flex flex-col items-center space-y-1 group">
                        <div className="bg-black/30 rounded-full p-3 group-hover:bg-black/50 transition-colors">
                          <Share className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white text-xs">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-1">
          {reelsPosts.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-8 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipe Instructions (mobile) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="text-white/50 text-center">
          <p className="text-xs mb-1">Swipe up for next</p>
          <p className="text-xs">Double tap to like</p>
        </div>
      </div>
    </div>
  );
}