import { create } from 'zustand';
import { profileApi } from '@/services/api';
import type { Profile, Gender, PlayStyle, GameLevel } from '@/types/api';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    dateOfBirth?: string;
    gender?: Gender;
    playStyle?: PlayStyle;
    gameLevel?: GameLevel;
    usesMic?: boolean;
    bio?: string;
    avatarUrl?: string;
  }) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileApi.getMyProfile();
      set({ profile, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await profileApi.updateProfile(data);
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updated } : null,
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
}));
