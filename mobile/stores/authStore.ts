import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  authApi,
  setTokens,
  clearTokens,
  setOnTokenRefreshFailed,
} from '@/services/api';

async function saveTokensSecure(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

async function getTokensSecure() {
  const at = await SecureStore.getItemAsync('accessToken');
  const rt = await SecureStore.getItemAsync('refreshToken');
  return { accessToken: at, refreshToken: rt };
}

async function clearTokensSecure() {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

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
        await saveTokensSecure(data.accessToken, data.refreshToken);
        await AsyncStorage.multiSet([
          ['userId', data.user.id],
          ['username', data.user.username],
          ['email', data.user.email],
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
        await saveTokensSecure(data.accessToken, data.refreshToken);
        await AsyncStorage.multiSet([
          ['userId', data.user.id],
          ['username', data.user.username],
          ['email', data.user.email],
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
      await clearTokensSecure();
      await AsyncStorage.multiRemove([
        'userId',
        'username',
        'email',
      ]);
    },

    restoreSession: async () => {
      const [[, uid], [, uname], [, em]] =
        await AsyncStorage.multiGet(['userId', 'username', 'email']);
      const { accessToken: at, refreshToken: rt } = await getTokensSecure();

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
