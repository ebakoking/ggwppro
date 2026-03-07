import { create } from 'zustand';
import { gameApi } from '@/services/api';
import type { GameCatalog, UserGame } from '@/types/api';

interface GameState {
  catalog: GameCatalog[];
  myGames: UserGame[];
  isLoading: boolean;

  loadCatalog: () => Promise<void>;
  loadMyGames: () => Promise<void>;
  setMyGames: (games: { gameId: string; rank?: string; role?: string }[]) => Promise<void>;
  addGame: (gameId: string, rank?: string, role?: string) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  catalog: [],
  myGames: [],
  isLoading: false,

  loadCatalog: async () => {
    set({ isLoading: true });
    try {
      const catalog = await gameApi.getAll();
      set({ catalog, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMyGames: async () => {
    try {
      const myGames = await gameApi.getMyGames();
      set({ myGames });
    } catch {}
  },

  setMyGames: async (games) => {
    set({ isLoading: true });
    try {
      const myGames = await gameApi.setMyGames(games);
      set({ myGames, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addGame: async (gameId, rank, role) => {
    try {
      const userGame = await gameApi.addGame(gameId, rank, role);
      set((s) => ({ myGames: [...s.myGames.filter((g) => g.gameId !== gameId), userGame] }));
    } catch {}
  },

  removeGame: async (gameId) => {
    try {
      await gameApi.removeGame(gameId);
      set((s) => ({ myGames: s.myGames.filter((g) => g.gameId !== gameId) }));
    } catch {}
  },
}));
