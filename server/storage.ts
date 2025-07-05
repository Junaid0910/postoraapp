import {
  users,
  posts,
  follows,
  likes,
  comments,
  streaks,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Follow,
  type InsertFollow,
  type Like,
  type InsertLike,
  type Comment,
  type InsertComment,
  type Streak,
  type InsertStreak,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getUserPosts(userId: string, limit?: number): Promise<Post[]>;
  getPublicPosts(limit?: number): Promise<(Post & { user: User })[]>;
  getPostById(id: number): Promise<Post | undefined>;
  updatePostVisibility(postId: number, isPublic: boolean): Promise<void>;
  
  // Social operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Like operations
  likePost(userId: string, postId: number): Promise<Like>;
  unlikePost(userId: string, postId: number): Promise<void>;
  isPostLiked(userId: string, postId: number): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<(Comment & { user: User })[]>;
  
  // Streak operations
  updateStreak(userId: string, postDate: string): Promise<void>;
  getUserStreak(userId: string): Promise<Streak | undefined>;
  
  // Analytics operations
  getUserAnalytics(userId: string): Promise<{
    totalPosts: number;
    postsByCategory: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
    monthlyPosts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    
    // Update user's total posts and last post date
    await db
      .update(users)
      .set({
        totalPosts: sql`${users.totalPosts} + 1`,
        lastPostDate: post.postDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, post.userId));
    
    // Update streak
    await this.updateStreak(post.userId, post.postDate);
    
    return newPost;
  }

  async getUserPosts(userId: string, limit = 50): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPublicPosts(limit = 20): Promise<(Post & { user: User })[]> {
    return await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        title: posts.title,
        category: posts.category,
        isPublic: posts.isPublic,
        level: posts.level,
        mediaUrls: posts.mediaUrls,
        mediaType: posts.mediaType,
        location: posts.location,
        tags: posts.tags,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
        postDate: posts.postDate,
        user: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.isPublic, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async updatePostVisibility(postId: number, isPublic: boolean): Promise<void> {
    await db.update(posts).set({ isPublic }).where(eq(posts.id, postId));
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    
    // Update follower counts
    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));
    
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, followingId));
    
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    
    // Update follower counts
    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} - 1` })
      .where(eq(users.id, followerId));
    
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} - 1` })
      .where(eq(users.id, followingId));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        bio: users.bio,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        level: users.level,
        totalPosts: users.totalPosts,
        followersCount: users.followersCount,
        followingCount: users.followingCount,
        lastPostDate: users.lastPostDate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        bio: users.bio,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        level: users.level,
        totalPosts: users.totalPosts,
        followersCount: users.followersCount,
        followingCount: users.followingCount,
        lastPostDate: users.lastPostDate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
  }

  async likePost(userId: string, postId: number): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ userId, postId })
      .returning();
    
    // Update post likes count
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
    
    return like;
  }

  async unlikePost(userId: string, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    // Update post likes count
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} - 1` })
      .where(eq(posts.id, postId));
  }

  async isPostLiked(userId: string, postId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update post comments count
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getPostComments(postId: number): Promise<(Comment & { user: User })[]> {
    return await db
      .select({
        id: comments.id,
        userId: comments.userId,
        postId: comments.postId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async updateStreak(userId: string, postDate: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const today = new Date(postDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user has an active streak
    const [currentStreak] = await db
      .select()
      .from(streaks)
      .where(and(eq(streaks.userId, userId), eq(streaks.isActive, true)))
      .orderBy(desc(streaks.startDate));

    if (currentStreak) {
      // Check if this continues the streak
      const streakEndDate = new Date(currentStreak.endDate || currentStreak.startDate);
      const daysDiff = Math.floor((today.getTime() - streakEndDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Continue streak
        await db
          .update(streaks)
          .set({
            endDate: postDate,
            length: currentStreak.length + 1,
          })
          .where(eq(streaks.id, currentStreak.id));

        // Update user's current streak
        await db
          .update(users)
          .set({
            currentStreak: currentStreak.length + 1,
            longestStreak: sql`GREATEST(${users.longestStreak}, ${currentStreak.length + 1})`,
          })
          .where(eq(users.id, userId));
      } else if (daysDiff > 1) {
        // Streak broken, end current and start new
        await db
          .update(streaks)
          .set({ isActive: false })
          .where(eq(streaks.id, currentStreak.id));

        await db.insert(streaks).values({
          userId,
          startDate: postDate,
          endDate: postDate,
          length: 1,
          isActive: true,
        });

        await db
          .update(users)
          .set({ currentStreak: 1 })
          .where(eq(users.id, userId));
      }
    } else {
      // Start new streak
      await db.insert(streaks).values({
        userId,
        startDate: postDate,
        endDate: postDate,
        length: 1,
        isActive: true,
      });

      await db
        .update(users)
        .set({ currentStreak: 1 })
        .where(eq(users.id, userId));
    }
  }

  async getUserStreak(userId: string): Promise<Streak | undefined> {
    const [streak] = await db
      .select()
      .from(streaks)
      .where(and(eq(streaks.userId, userId), eq(streaks.isActive, true)))
      .orderBy(desc(streaks.startDate));
    return streak;
  }

  async getUserAnalytics(userId: string): Promise<{
    totalPosts: number;
    postsByCategory: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
    monthlyPosts: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        totalPosts: 0,
        postsByCategory: {},
        currentStreak: 0,
        longestStreak: 0,
        monthlyPosts: 0,
      };
    }

    // Get posts by category
    const categoryStats = await db
      .select({
        category: posts.category,
        count: count(),
      })
      .from(posts)
      .where(eq(posts.userId, userId))
      .groupBy(posts.category);

    const postsByCategory = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    // Get monthly posts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [monthlyStats] = await db
      .select({ count: count() })
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          sql`${posts.createdAt} >= ${thirtyDaysAgo}`
        )
      );

    return {
      totalPosts: user.totalPosts || 0,
      postsByCategory,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      monthlyPosts: monthlyStats.count,
    };
  }
}

export const storage = new DatabaseStorage();
