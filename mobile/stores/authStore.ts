import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authApi,
  setTokens,
  clearTokens,
  setOnTokenRefreshFailed,
} from '@/services/api';

interface AuthState {
  userId: string | null;
  username: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  register: (email: string, username: string, password: string, passwordConfirm: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setOnTokenRefreshFailed(() => {
    get().logout();
  });

  return {
    userId: null,
    username: null,
    email: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    register: async (email, username, password, passwordConfirm) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.register(email, username, password, passwordConfirm);
        setTokens(data.accessToken, data.refreshToken, data.user.id);
        await AsyncStorage.multiSet([
          ['userId', data.user.id],
          ['username', data.user.username],
          ['email', data.user.email],
          ['accessToken', data.accessToken],
          ['refreshToken', data.refreshToken],
        ]);
        set({
          userId: data.user.id,
          username: data.user.username,
          email: data.user.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (e: any) {
        set({ error: e.message, isLoading: false });
        return false;
      }
    },

    resendVerification: async (email) => {
      set({ isLoading: true, error: null });
      try {
        await authApi.resendVerificationEmail(email);
        set({ isLoading: false });
        return true;
      } catch (e: any) {
        set({ error: e.message, isLoading: false });
        return false;
      }
    },

    login: async (username, password) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.login(username, password);
        setTokens(data.accessToken, data.refreshToken, data.user.id);
        await AsyncStorage.multiSet([
          ['userId', data.user.id],
          ['username', data.user.username],
          ['email', data.user.email],
          ['accessToken', data.accessToken],
          ['refreshToken', data.refreshToken],
        ]);
        set({
          userId: data.user.id,
          username: data.user.username,
          email: data.user.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (e: any) {
        set({ error: e.message, isLoading: false });
        return false;
      }
    },

    logout: async () => {
      set({
        userId: null,
        username: null,
        email: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
      clearTokens();
      try {
        await authApi.logout();
      } catch {}
      await AsyncStorage.multiRemove([
        'userId',
        'username',
        'email',
        'accessToken',
        'refreshToken',
      ]);
    },

    restoreSession: async () => {
      const [[, uid], [, uname], [, em], [, at], [, rt]] =
        await AsyncStorage.multiGet([
          'userId',
          'username',
          'email',
          'accessToken',
          'refreshToken',
        ]);
      if (uid && at && rt) {
        setTokens(at, rt, uid);
        set({
          userId: uid,
          username: uname,
          email: em,
          accessToken: at,
          refreshToken: rt,
          isAuthenticated: true,
        });
      }
    },
  };
});
