import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_KEY = 'ggwp_notifications';

export interface AppNotification {
  id: string;
  type: 'match' | 'community_like' | 'community_comment' | 'new_game';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

function getKey(userId: string | null) {
  return userId ? `${NOTIF_KEY}_${userId}` : null;
}

interface NotificationState {
  items: AppNotification[];
  load: (userId: string | null) => Promise<void>;
  add: (userId: string | null, notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAllRead: (userId: string | null) => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],

  load: async (userId) => {
    const key = getKey(userId);
    if (!key) {
      set({ items: [] });
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      set({ items: Array.isArray(list) ? list : [] });
    } catch {
      set({ items: [] });
    }
  },

  add: async (userId, notif) => {
    const key = getKey(userId);
    if (!key) return;
    const item: AppNotification = {
      ...notif,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const next = [item, ...get().items];
    set({ items: next });
    await AsyncStorage.setItem(key, JSON.stringify(next));
  },

  markAllRead: async (userId) => {
    const key = getKey(userId);
    if (!key) return;
    const updated = get().items.map((n) => ({ ...n, read: true }));
    set({ items: updated });
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  },

  unreadCount: () => get().items.filter((n) => !n.read).length,
}));
