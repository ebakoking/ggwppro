import { create } from 'zustand';
import { discoverApi, swipeApi } from '@/services/api';
import type { Profile, SwipeAction } from '@/types/api';

interface DiscoverState {
  feed: Profile[];
  currentIndex: number;
  isLoading: boolean;
  lastMatch: boolean;
  matchedProfile: Profile | null;

  loadFeed: (gameId: string | null) => Promise<void>;
  swipe: (action: SwipeAction, gameId: string | null) => Promise<void>;
  clearMatchFlag: () => void;
  advanceToNext: (effectiveLength?: number) => void;
}

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  feed: [],
  currentIndex: 0,
  isLoading: false,
  lastMatch: false,
  matchedProfile: null,

  loadFeed: async (gameId) => {
    set({ isLoading: true });
    try {
      const feed = await discoverApi.getFeed(gameId);
      set({ feed, currentIndex: 0, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  swipe: async (action, gameId) => {
    const { feed, currentIndex } = get();
    const current = feed[currentIndex];
    if (!current || !gameId) return;

    const nextIndex = currentIndex + 1;
    set({ currentIndex: nextIndex });

    try {
      const result = await swipeApi.swipe(current.userId, action, gameId);
      if (result.matched) set({ lastMatch: true, matchedProfile: current });
    } catch (err: any) {
      set({ currentIndex: currentIndex });
      throw err;
    }

    if (nextIndex >= feed.length - 2) {
      const moreFeed = await discoverApi.getFeed(gameId);
      if (moreFeed.length > 0) {
        set((s) => ({ feed: [...s.feed, ...moreFeed] }));
      }
    }
  },

  advanceToNext: (effectiveLength?: number) => {
    const { feed, currentIndex } = get();
    const len = effectiveLength ?? feed.length;
    if (len === 0) return;
    const next = (currentIndex + 1) % len;
    set({ currentIndex: next });
  },

  clearMatchFlag: () => set({ lastMatch: false, matchedProfile: null }),
}));
