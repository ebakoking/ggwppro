import { create } from 'zustand';
import { forumApi } from '@/services/api';
import type { ForumPost } from '@/types/api';

interface ForumState {
  posts: ForumPost[];
  currentPost: ForumPost | null;
  isLoading: boolean;

  loadPosts: (gameId?: string) => Promise<void>;
  loadPost: (postId: string) => Promise<void>;
  createPost: (data: { gameId: string; title: string; content: string; linkUrl?: string }) => Promise<boolean>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
}

export const useForumStore = create<ForumState>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,

  loadPosts: async (gameId) => {
    set({ isLoading: true });
    try {
      const posts = await forumApi.getPosts(gameId);
      set({ posts, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadPost: async (postId) => {
    set({ isLoading: true });
    try {
      const post = await forumApi.getPost(postId);
      set({ currentPost: post, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createPost: async (data) => {
    try {
      const post = await forumApi.createPost(data);
      set((s) => ({ posts: [post, ...s.posts] }));
      return true;
    } catch {
      return false;
    }
  },

  addComment: async (postId, content) => {
    try {
      const comment = await forumApi.addComment(postId, content);
      set((s) => {
        const nextCurrent =
          s.currentPost?.id === postId
            ? {
                ...s.currentPost,
                comments: [...(s.currentPost.comments || []), comment],
                commentCount: s.currentPost.commentCount + 1,
              }
            : s.currentPost;
        const nextPosts = s.posts.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
        );
        return { currentPost: nextCurrent ?? s.currentPost, posts: nextPosts };
      });
      return true;
    } catch {
      return false;
    }
  },

  toggleLike: async (postId) => {
    try {
      const result = await forumApi.toggleLike(postId);
      const delta = result.liked ? 1 : -1;
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, likeCount: p.likeCount + delta } : p,
        ),
        currentPost:
          s.currentPost?.id === postId
            ? { ...s.currentPost, likeCount: s.currentPost.likeCount + delta }
            : s.currentPost,
      }));
    } catch {}
  },
}));
