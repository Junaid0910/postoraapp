import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Heart, MessageCircle, X, Globe, Lock } from "lucide-react";
import type { Post } from "@shared/schema";
import { getCategoryIcon } from "@shared/categories";

interface EnhancedLevelMapProps {
  currentLevel: number;
  posts: Post[];
}

export default function EnhancedLevelMap({ currentLevel, posts }: EnhancedLevelMapProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const levelData = useMemo(() => {
    // Create a comprehensive level progression
    const maxDisplayLevels = Math.max(currentLevel + 5, 20);
    
    return Array.from({ length: maxDisplayLevels }, (_, i) => {
      const level = i + 1;
      const post = posts.find(p => p.level === level);
      return {
        level,
        unlocked: level <= currentLevel,
        post,
        date: post ? new Date(post.createdAt) : null,
        category: post?.category,
        title: post?.title,
      };
    });
  }, [currentLevel, posts]);

  const getLevelColor = (level: number, unlocked: boolean) => {
    if (!unlocked) return 'bg-gray-200 border-gray-300 text-gray-400';
    
    const colorSets = [
      'bg-gradient-to-br from-coral to-plum border-coral shadow-lg shadow-coral/20',
      'bg-gradient-to-br from-turquoise to-sky border-turquoise shadow-lg shadow-turquoise/20',
      'bg-gradient-to-br from-mint to-soft-yellow border-mint shadow-lg shadow-mint/20',
      'bg-gradient-to-br from-sky to-turquoise border-sky shadow-lg shadow-sky/20',
      'bg-gradient-to-br from-plum to-coral border-plum shadow-lg shadow-plum/20',
    ];
    
    return colorSets[(level - 1) % colorSets.length];
  };

  const getMilestoneType = (level: number) => {
    if (level % 50 === 0) return 'legendary';
    if (level % 25 === 0) return 'epic';
    if (level % 10 === 0) return 'rare';
    if (level % 5 === 0) return 'uncommon';
    return 'common';
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'legendary': return '👑';
      case 'epic': return '💎';
      case 'rare': return '⭐';
      case 'uncommon': return '🔥';
      default: return '📍';
    }
  };

  // Create the snake-like path
  const createSnakePath = () => {
    const itemsPerRow = 8;
    const rows = Math.ceil(levelData.length / itemsPerRow);
    const snakeLevels = [];

    for (let row = 0; row < rows; row++) {
      const isEvenRow = row % 2 === 0;
      const startIndex = row * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, levelData.length);
      
      const rowData = levelData.slice(startIndex, endIndex);
      
      if (!isEvenRow) {
        rowData.reverse();
      }
      
      snakeLevels.push(...rowData.map((level, index) => ({
        ...level,
        row,
        col: isEvenRow ? index : itemsPerRow - 1 - index,
        originalIndex: startIndex + (isEvenRow ? index : rowData.length - 1 - index)
      })));
    }

    return snakeLevels;
  };

  const snakeLevels = createSnakePath();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Your Journey Map
        </h3>
        <p className="text-gray-600">
          Level {currentLevel} • {posts.length} posts completed
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-coral"></div>
            <span>Unlocked</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span>Locked</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>👑</span>
            <span>Milestone</span>
          </div>
        </div>
      </div>

      {/* Snake Map */}
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-gray-200">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {Array.from({ length: Math.ceil(levelData.length / 8) }).map((_, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;
            const startIndex = rowIndex * 8;
            const endIndex = Math.min(startIndex + 8, levelData.length);
            const rowLevels = levelData.slice(startIndex, endIndex);
            
            if (!isEvenRow) {
              rowLevels.reverse();
            }

            return (
              <div key={rowIndex} className="contents">
                {rowLevels.map((levelInfo, colIndex) => {
                  const milestone = getMilestoneType(levelInfo.level);
                  const isMilestone = milestone !== 'common';
                  const actualColIndex = isEvenRow ? colIndex : 7 - colIndex;
                  
                  return (
                    <div
                      key={levelInfo.level}
                      className="relative group"
                      style={{ gridColumn: actualColIndex + 1 }}
                    >
                      {/* Connection Line */}
                      {levelInfo.level > 1 && levelInfo.unlocked && (
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                          isEvenRow 
                            ? colIndex === 0 && rowIndex > 0 
                              ? 'after:absolute after:w-8 after:h-0.5 after:bg-coral after:-top-6 after:left-1/2 after:-translate-x-1/2'
                              : colIndex > 0 
                                ? 'before:absolute before:w-8 before:h-0.5 before:bg-coral before:right-full before:top-1/2 before:-translate-y-1/2'
                                : ''
                            : colIndex === 7 && rowIndex > 0
                              ? 'after:absolute after:w-8 after:h-0.5 after:bg-coral after:-top-6 after:left-1/2 after:-translate-x-1/2'
                              : colIndex < 7
                                ? 'before:absolute before:w-8 before:h-0.5 before:bg-coral before:left-full before:top-1/2 before:-translate-y-1/2'
                                : ''
                        }`} />
                      )}
                      
                      <div 
                        className={`
                          relative w-16 h-16 rounded-full border-2 flex items-center justify-center 
                          text-white font-bold cursor-pointer transition-all duration-300
                          hover:scale-110 hover:z-10
                          ${getLevelColor(levelInfo.level, levelInfo.unlocked)}
                          ${isMilestone ? 'ring-4 ring-yellow-300 ring-opacity-50' : ''}
                          ${levelInfo.post ? 'hover:ring-2 hover:ring-white' : ''}
                        `}
                        onClick={() => levelInfo.post && setSelectedPost(levelInfo.post)}
                      >
                        {isMilestone && (
                          <div className="absolute -top-2 -right-2 text-lg">
                            {getMilestoneIcon(milestone)}
                          </div>
                        )}
                        
                        {levelInfo.unlocked ? (
                          <div className="text-center">
                            <div className="text-sm font-bold">{levelInfo.level}</div>
                            {levelInfo.category && (
                              <div className="text-xs">
                                {getCategoryIcon(levelInfo.category)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xl">🔒</span>
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20
                                    pointer-events-none">
                        <Card className="w-48 shadow-lg border-2">
                          <CardContent className="p-3 text-center">
                            <div className="font-semibold text-gray-900">
                              Level {levelInfo.level}
                            </div>
                            {levelInfo.post ? (
                              <>
                                <div className="text-sm text-gray-600 mt-1">
                                  {levelInfo.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {levelInfo.date ? format(levelInfo.date, 'MMM d, yyyy') : 'No date'}
                                </div>
                                {levelInfo.category && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {getCategoryIcon(levelInfo.category)} {levelInfo.category}
                                  </Badge>
                                )}
                              </>
                            ) : levelInfo.unlocked ? (
                              <div className="text-sm text-gray-500">Completed</div>
                            ) : (
                              <div className="text-sm text-gray-500">Locked</div>
                            )}
                            {isMilestone && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {milestone.charAt(0).toUpperCase() + milestone.slice(1)} Milestone
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-coral">{currentLevel}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-turquoise">{posts.length}</div>
            <div className="text-sm text-gray-600">Posts Created</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-mint">
              {levelData.filter(l => l.level % 5 === 0 && l.unlocked).length}
            </div>
            <div className="text-sm text-gray-600">Milestones</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-plum">
              {Math.round((currentLevel / Math.max(currentLevel + 5, 20)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {currentLevel >= levelData.length - 5 
            ? `Amazing! You've reached level ${currentLevel}! Keep posting to unlock more levels.`
            : "Complete your daily post to unlock the next level!"
          }
        </p>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Level {selectedPost?.level} Post</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPost(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-coral to-plum rounded-full flex items-center justify-center text-white font-bold">
                  L{selectedPost.level}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedPost.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(selectedPost.createdAt), 'MMM d, yyyy')}</span>
                    <Badge className="bg-coral text-white">
                      {selectedPost.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Media Display */}
              {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
                <div className="space-y-2">
                  {selectedPost.mediaType === 'video' ? (
                    <video 
                      src={selectedPost.mediaUrls[0]} 
                      controls 
                      className="w-full max-h-64 object-contain rounded-lg bg-black"
                      poster={selectedPost.mediaUrls[1] || undefined}
                    />
                  ) : (
                    <div className="grid gap-2">
                      <img 
                        src={selectedPost.mediaUrls[0]} 
                        alt={selectedPost.title}
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                      {selectedPost.mediaUrls.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {selectedPost.mediaUrls.slice(1, 4).map((url, index) => (
                            <img 
                              key={index}
                              src={url} 
                              alt={`${selectedPost.title} ${index + 2}`}
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-gray-700">{selectedPost.content}</p>
                
                {/* Post Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 border-t pt-3">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{selectedPost.likesCount || 0} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{selectedPost.commentsCount || 0} comments</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {selectedPost.isPublic ? (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Private</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Location */}
                {selectedPost.location && (
                  <div className="text-sm text-gray-600">
                    📍 {selectedPost.location}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}