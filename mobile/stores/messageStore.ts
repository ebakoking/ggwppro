import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { matchApi, messageApi } from '@/services/api';
import type { MatchData, Message } from '@/types/api';

const getLocalChatsKey = (userId: string | null) => (userId ? `ggwp_local_chats_${userId}` : null);

export interface LocalChat {
  id: string;
  name: string;
  avatarUrl: string;
  userId: string;
  bio?: string;
  gender?: string;
  playStyle?: string;
  usesMic?: string;
  games?: string;
  messages: Message[];
  createdAt: string;
}

interface MessageState {
  matches: MatchData[];
  localChats: LocalChat[];
  currentMessages: Message[];
  activeMatchId: string | null;
  isLoading: boolean;
  error: string | null;

  loadMatches: (gameId?: string) => Promise<void>;
  loadLocalChats: (userId: string | null) => Promise<void>;
  saveLocalChat: (chat: Omit<LocalChat, 'messages' | 'createdAt'>, userId: string | null) => Promise<void>;
  addLocalMessage: (chatId: string, content: string, senderId: string, userId: string | null) => Promise<void>;
  getLocalChat: (chatId: string) => LocalChat | undefined;
  deleteLocalChat: (chatId: string, userId: string | null) => Promise<void>;
  loadMessages: (matchId: string) => Promise<void>;
  sendMessage: (matchId: string, content: string) => Promise<void>;
  addIncomingMessage: (message: Message) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  matches: [],
  localChats: [],
  currentMessages: [],
  activeMatchId: null,
  isLoading: false,
  error: null,

  loadMatches: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const matches = await matchApi.getMatches(gameId);
      set({ matches, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  loadLocalChats: async (userId) => {
    const key = getLocalChatsKey(userId);
    if (!key) {
      set({ localChats: [] });
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) set({ localChats: JSON.parse(raw) });
      else set({ localChats: [] });
    } catch {
      set({ localChats: [] });
    }
  },

  saveLocalChat: async (chat, userId) => {
    const key = getLocalChatsKey(userId);
    if (!key) return;
    const { localChats } = get();
    const exists = localChats.find((c) => c.id === chat.id);
    if (exists) return;
    const newChat: LocalChat = { ...chat, messages: [], createdAt: new Date().toISOString() };
    const updated = [newChat, ...localChats];
    set({ localChats: updated });
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  },

  addLocalMessage: async (chatId, content, senderId, userId) => {
    const key = getLocalChatsKey(userId);
    if (!key) return;
    const { localChats } = get();
    const msg: Message = {
      id: `lm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      matchId: chatId,
      senderId,
      content,
      read: true,
      createdAt: new Date().toISOString(),
    };
    const updated = localChats.map((c) =>
      c.id === chatId ? { ...c, messages: [...c.messages, msg] } : c,
    );
    set({ localChats: updated });
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  },

  getLocalChat: (chatId) => {
    return get().localChats.find((c) => c.id === chatId);
  },

  deleteLocalChat: async (chatId, userId) => {
    const key = getLocalChatsKey(userId);
    if (!key) return;
    const { localChats } = get();
    const updated = localChats.filter((c) => c.id !== chatId);
    set({ localChats: updated });
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  },

  loadMessages: async (matchId) => {
    set({ isLoading: true, activeMatchId: matchId });
    try {
      const messages = await messageApi.getMessages(matchId);
      set({ currentMessages: messages.reverse(), isLoading: false });
      await messageApi.markAsRead(matchId);
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  sendMessage: async (matchId, content) => {
    try {
      const message = await messageApi.sendMessage(matchId, content);
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  addIncomingMessage: (message) => {
    const { activeMatchId } = get();
    if (message.matchId === activeMatchId) {
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
    }
    set((state) => ({
      matches: state.matches.map((m) =>
        m.matchId === message.matchId ? { ...m, lastMessage: message } : m,
      ),
    }));
  },
}));
